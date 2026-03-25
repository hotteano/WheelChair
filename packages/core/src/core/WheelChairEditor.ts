import type { Editor, EditorOptions, JSONContent } from '@tiptap/core';
import type { Transaction, EditorState } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import {
  type WheelChairEditorOptions,
  type EditorSelection,
  type InsertOptions,
  type SetContentOptions,
  type EventEmitter,
  type EditorEventMap,
  type EventListener,
  type WordCount,
  type HistoryState,
} from '../types';
import { StateManager } from './StateManager';
import { HistoryManager } from './HistoryManager';

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Partial<WheelChairEditorOptions> = {
  content: '',
  editable: true,
  placeholder: '请输入内容...',
  spellcheck: true,
  enableInputRules: true,
  enablePasteRules: true,
  enableCoreExtensions: true,
};

/**
 * WheelChair 编辑器主类
 * 封装 Tiptap Editor，提供简化的 API 和事件系统
 */
export class WheelChairEditor implements EventEmitter<EditorEventMap> {
  /** Tiptap Editor 实例 */
  private editor: Editor | null = null;
  /** 状态管理器 */
  private stateManager: StateManager;
  /** 历史管理器 */
  private historyManager: HistoryManager;
  /** 合并后的配置 */
  private options: WheelChairEditorOptions;
  /** 事件监听器映射 */
  private listeners: Map<keyof EditorEventMap, Set<EventListener<any>>> = new Map();
  /** 是否已销毁 */
  private destroyed: boolean = false;
  /** 容器元素 */
  private element: HTMLElement | null = null;
  /** 字数统计防抖定时器 */
  private wordCountDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: WheelChairEditorOptions = {}) {
    this.options = this.mergeOptions(options);
    this.stateManager = new StateManager({
      isEditable: this.options.editable ?? true,
    });
    this.historyManager = new HistoryManager({
      maxDepth: 100,
      mergeWindow: 500,
    });

    // 如果提供了元素，立即初始化
    if (this.options.element) {
      this.init(this.options.element);
    }
  }

  /**
   * 合并配置选项
   */
  private mergeOptions(options: WheelChairEditorOptions): WheelChairEditorOptions {
    return {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  /**
   * 初始化编辑器
   * @param element - 编辑器容器元素
   */
  init(element: HTMLElement): void {
    if (this.destroyed) {
      throw new Error('Editor has been destroyed. Please create a new instance.');
    }

    if (this.editor) {
      console.warn('Editor already initialized. Call destroy() first.');
      return;
    }

    this.element = element;
    this.stateManager.setLoading(true);

    // 构建 Tiptap 配置
    const tiptapOptions: Partial<EditorOptions> = {
      element,
      content: this.options.content,
      editable: this.options.editable,
      autofocus: this.options.autofocus,
      extensions: this.options.extensions || [],
      editorProps: this.options.editorProps,
      injectCSS: this.options.injectCSS,
      injectNonce: this.options.injectNonce,
      enableInputRules: this.options.enableInputRules,
      enablePasteRules: this.options.enablePasteRules,
      enableCoreExtensions: this.options.enableCoreExtensions,
      parseOptions: {},
      coreExtensionOptions: {},
      onBeforeCreate: ({ editor }) => {
        this.emit('create', { editor });
        this.options.onCreate?.(editor);
      },
      onCreate: ({ editor }) => {
        this.stateManager.setEditor(editor);
        this.stateManager.setReady(true);
        this.stateManager.setLoading(false);
        this.updateStateFromEditor();
        this.historyManager.reset(editor.state);
      },
      onUpdate: ({ editor, transaction }) => {
        this.updateStateFromEditor();
        this.emit('update', { editor, transaction });
        this.options.onUpdate?.(editor);
        this.options.onChange?.(editor.getJSON(), editor);

        // 更新历史记录
        if (!transaction.getMeta('addToHistory') !== false) {
          this.historyManager.add(editor.state);
        }
      },
      onSelectionUpdate: ({ editor, transaction }) => {
        this.updateSelectionState();
        this.emit('selectionUpdate', { editor, transaction });
        this.options.onSelectionChange?.(this.getSelection(), editor);
      },
      onTransaction: ({ editor, transaction }) => {
        this.emit('transaction', { editor, transaction });
        this.options.onTransaction?.({ editor, transaction });
      },
      onFocus: ({ editor, event, transaction }) => {
        this.stateManager.setFocused(true);
        this.emit('focus', { editor, event, transaction });
        this.options.onFocus?.(event, editor);
      },
      onBlur: ({ editor, event, transaction }) => {
        this.stateManager.setFocused(false);
        this.emit('blur', { editor, event, transaction });
        this.options.onBlur?.(event, editor);
      },
      onDestroy: () => {
        this.emit('destroy', undefined);
        this.options.onDestroy?.();
      },
      onContentError: ({ editor, error, invalidContent, disablesOutput }) => {
        this.emit('contentError', { editor, error, invalidContent, disablesOutput });
        this.options.onContentError?.({ editor, error, invalidContent, disablesOutput });
      },
      onPaste: this.options.onPaste,
      onDrop: this.options.onDrop,
    };

    // 创建 Tiptap Editor 实例
    this.editor = new Editor(tiptapOptions as EditorOptions);
  }

  /**
   * 从编辑器更新状态
   */
  private updateStateFromEditor(): void {
    if (!this.editor) return;

    const editor = this.editor;
    const html = editor.getHTML();
    const text = editor.getText();
    const json = editor.getJSON();

    this.stateManager.batchUpdate({
      html,
      text,
      content: json,
    });

    // 防抖更新字数统计
    if (this.wordCountDebounceTimer) {
      clearTimeout(this.wordCountDebounceTimer);
    }
    this.wordCountDebounceTimer = setTimeout(() => {
      this.updateWordCount();
    }, 300);

    this.updateSelectionState();
  }

  /**
   * 更新选区状态
   */
  private updateSelectionState(): void {
    if (!this.editor) return;

    const { selection } = this.editor.state;
    this.stateManager.setSelection({
      from: selection.from,
      to: selection.to,
      empty: selection.empty,
      anchor: selection.anchor,
      head: selection.head,
    });
  }

  /**
   * 更新字数统计
   */
  private updateWordCount(): void {
    if (!this.editor) return;

    const text = this.editor.getText();
    const characters = text.length;
    const charactersWithoutSpaces = text.replace(/\s/g, '').length;
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;

    this.stateManager.setWordCount({
      words,
      characters,
      charactersWithoutSpaces,
    });
  }

  // ============================================
  // 公共 API
  // ============================================

  /**
   * 获取编辑器实例
   */
  getEditor(): Editor | null {
    return this.editor;
  }

  /**
   * 获取状态管理器
   */
  getStateManager(): StateManager {
    return this.stateManager;
  }

  /**
   * 获取历史管理器
   */
  getHistoryManager(): HistoryManager {
    return this.historyManager;
  }

  /**
   * 获取 HTML 内容
   */
  getHTML(): string {
    return this.editor?.getHTML() ?? '';
  }

  /**
   * 获取 JSON 内容
   */
  getJSON(): JSONContent {
    return this.editor?.getJSON() ?? { type: 'doc', content: [] };
  }

  /**
   * 获取纯文本内容
   */
  getText(): string {
    return this.editor?.getText() ?? '';
  }

  /**
   * 设置内容
   */
  setContent(content: string | JSONContent, options?: SetContentOptions): void {
    if (!this.editor) return;

    this.editor.commands.setContent(content, options?.emitUpdate ?? true, options?.parseOptions);
  }

  /**
   * 插入内容
   */
  insertContent(content: string | JSONContent, options?: InsertOptions): void {
    if (!this.editor) return;

    const { at, updateSelection, parseOptions } = options ?? {};
    
    if (at === undefined) {
      this.editor.commands.insertContent(content, parseOptions);
    } else if (at === 'start') {
      this.editor.commands.insertContentAt(0, content, parseOptions);
    } else if (at === 'end') {
      this.editor.commands.insertContentAt(this.editor.state.doc.content.size, content, parseOptions);
    } else if (at === 'all') {
      this.editor.commands.setContent(content, true, parseOptions);
    } else if (typeof at === 'number') {
      this.editor.commands.insertContentAt(at, content, parseOptions);
    } else if (typeof at === 'object' && 'from' in at && 'to' in at) {
      this.editor.commands.insertContentAt({ from: at.from, to: at.to }, content, parseOptions);
    }

    if (updateSelection !== false) {
      this.editor.commands.focus();
    }
  }

  /**
   * 清空内容
   */
  clearContent(): void {
    this.setContent('');
  }

  /**
   * 获取选区
   */
  getSelection(): EditorSelection {
    if (!this.editor) {
      return { from: 0, to: 0, empty: true, anchor: 0, head: 0 };
    }
    const { selection } = this.editor.state;
    return {
      from: selection.from,
      to: selection.to,
      empty: selection.empty,
      anchor: selection.anchor,
      head: selection.head,
    };
  }

  /**
   * 设置选区
   */
  setSelection(from: number, to?: number): void {
    if (!this.editor) return;
    this.editor.commands.setTextSelection({ from, to: to ?? from });
  }

  /**
   * 全选
   */
  selectAll(): void {
    this.editor?.commands.selectAll();
  }

  /**
   * 聚焦编辑器
   */
  focus(position?: number | 'start' | 'end' | 'all' | Range): void {
    if (!this.editor) return;

    if (position === undefined) {
      this.editor.commands.focus();
    } else if (typeof position === 'number') {
      this.editor.commands.focus(position);
    } else if (position === 'start' || position === 'end' || position === 'all') {
      this.editor.commands.focus(position);
    } else if (typeof position === 'object' && 'from' in position) {
      this.editor.commands.setTextSelection(position);
      this.editor.commands.focus();
    }
  }

  /**
   * 失焦编辑器
   */
  blur(): void {
    this.editor?.commands.blur();
  }

  /**
   * 获取可编辑状态
   */
  isEditable(): boolean {
    return this.editor?.isEditable ?? this.options.editable ?? true;
  }

  /**
   * 设置可编辑状态
   */
  setEditable(editable: boolean): void {
    if (this.editor) {
      this.editor.setEditable(editable);
    }
    this.stateManager.setEditable(editable);
    this.options.editable = editable;
  }

  /**
   * 检查是否聚焦
   */
  isFocused(): boolean {
    return this.editor?.isFocused ?? false;
  }

  /**
   * 获取字数统计
   */
  getWordCount(): WordCount {
    return this.stateManager.getState().wordCount;
  }

  /**
   * 获取历史状态
   */
  getHistoryState(): HistoryState {
    return this.historyManager.getState();
  }

  /**
   * 撤销
   */
  undo(): boolean {
    const entry = this.historyManager.undo();
    if (entry && this.editor) {
      // 恢复到历史状态
      const tr = this.editor.state.tr.replaceWith(
        0,
        this.editor.state.doc.content.size,
        entry.doc.content
      );
      tr.setSelection(this.editor.state.selection.map(tr.doc, tr.mapping));
      this.editor.view.dispatch(tr);
      return true;
    }
    return this.editor?.commands.undo() ?? false;
  }

  /**
   * 重做
   */
  redo(): boolean {
    const entry = this.historyManager.redo();
    if (entry && this.editor) {
      // 恢复到历史状态
      const tr = this.editor.state.tr.replaceWith(
        0,
        this.editor.state.doc.content.size,
        entry.doc.content
      );
      tr.setSelection(this.editor.state.selection.map(tr.doc, tr.mapping));
      this.editor.view.dispatch(tr);
      return true;
    }
    return this.editor?.commands.redo() ?? false;
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.historyManager.canUndo() || (this.editor?.can().undo() ?? false);
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.historyManager.canRedo() || (this.editor?.can().redo() ?? false);
  }

  // ============================================
  // 事件系统
  // ============================================

  /**
   * 订阅事件
   */
  on<K extends keyof EditorEventMap>(
    event: K,
    listener: EventListener<EditorEventMap[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.off(event, listener);
    };
  }

  /**
   * 取消订阅事件
   */
  off<K extends keyof EditorEventMap>(
    event: K,
    listener: EventListener<EditorEventMap[K]>
  ): void {
    this.listeners.get(event)?.delete(listener);
  }

  /**
   * 一次性订阅事件
   */
  once<K extends keyof EditorEventMap>(
    event: K,
    listener: EventListener<EditorEventMap[K]>
  ): () => void {
    const onceListener = (data: EditorEventMap[K]) => {
      this.off(event, onceListener);
      listener(data);
    };
    return this.on(event, onceListener);
  }

  /**
   * 触发事件
   */
  emit<K extends keyof EditorEventMap>(event: K, data: EditorEventMap[K]): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for "${String(event)}":`, error);
      }
    });
  }

  // ============================================
  // 生命周期
  // ============================================

  /**
   * 检查是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    if (this.destroyed) return;

    this.destroyed = true;

    // 清理定时器
    if (this.wordCountDebounceTimer) {
      clearTimeout(this.wordCountDebounceTimer);
    }

    // 清理监听器
    this.listeners.clear();

    // 销毁历史管理器
    this.historyManager.destroy();

    // 销毁状态管理器
    this.stateManager.destroy();

    // 销毁 Tiptap Editor
    this.editor?.destroy();
    this.editor = null;
    this.element = null;
  }
}

/**
 * 创建编辑器实例的工厂函数
 */
export function createWheelChairEditor(
  element: HTMLElement,
  options?: WheelChairEditorOptions
): WheelChairEditor {
  const editor = new WheelChairEditor(options);
  editor.init(element);
  return editor;
}

export default WheelChairEditor;
