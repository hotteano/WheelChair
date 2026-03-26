import { createStore, StoreApi } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Editor, JSONContent } from '@tiptap/core';

export interface EditorSelection {
  from: number;
  to: number;
  empty: boolean;
  anchor: number;
  head: number;
}

export interface WordCount {
  words: number;
  characters: number;
  charactersWithoutSpaces: number;
}

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
  undoDepth: number;
  redoDepth: number;
}

export interface EditorStateStore {
  editor: Editor | null;
  content: JSONContent | null;
  html: string;
  text: string;
  isEditable: boolean;
  isFocused: boolean;
  selection: EditorSelection | null;
  wordCount: WordCount;
  history: HistoryState;
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface EditorStateActions {
  setEditor: (editor: Editor | null) => void;
  setContent: (content: JSONContent) => void;
  setHTML: (html: string) => void;
  setText: (text: string) => void;
  setEditable: (isEditable: boolean) => void;
  setFocused: (isFocused: boolean) => void;
  setSelection: (selection: EditorSelection | null) => void;
  setWordCount: (wordCount: WordCount) => void;
  setHistory: (history: HistoryState) => void;
  setReady: (isReady: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export type EditorStore = EditorStateStore & EditorStateActions;

/**
 * 默认状态
 */
const DEFAULT_STATE: EditorStateStore = {
  editor: null,
  content: null,
  html: '',
  text: '',
  isEditable: true,
  isFocused: false,
  selection: null,
  wordCount: {
    words: 0,
    characters: 0,
    charactersWithoutSpaces: 0,
  },
  history: {
    canUndo: false,
    canRedo: false,
    undoDepth: 0,
    redoDepth: 0,
  },
  isReady: false,
  isLoading: false,
  error: null,
};

/**
 * 状态管理器类
 * 封装 Zustand store，提供类型安全和额外功能
 */
export class StateManager {
  private store: StoreApi<EditorStore>;
  private unsubscribeCallbacks: (() => void)[] = [];

  constructor(initialState?: Partial<EditorStateStore>) {
    this.store = createStore<EditorStore>()(
      subscribeWithSelector((set, _get) => ({
        ...DEFAULT_STATE,
        ...initialState,

        // Actions
        setEditor: (editor: Editor | null) => set({ editor }),
        
        setContent: (content: JSONContent) => set({ content }),
        
        setHTML: (html: string) => set({ html }),
        
        setText: (text: string) => set({ text }),
        
        setEditable: (isEditable: boolean) => set({ isEditable }),
        
        setFocused: (isFocused: boolean) => set({ isFocused }),
        
        setSelection: (selection: EditorSelection | null) => set({ selection }),
        
        setWordCount: (wordCount: WordCount) => set({ wordCount }),
        
        setHistory: (history: HistoryState) => set({ history }),
        
        setReady: (isReady: boolean) => set({ isReady }),
        
        setLoading: (isLoading: boolean) => set({ isLoading }),
        
        setError: (error: Error | null) => set({ error }),
        
        reset: () => set({ ...DEFAULT_STATE }),
      }))
    );
  }

  /**
   * 获取 store 实例
   */
  getStore(): StoreApi<EditorStore> {
    return this.store;
  }

  /**
   * 获取当前状态
   */
  getState(): EditorStore {
    return this.store.getState();
  }

  /**
   * 设置编辑器实例
   */
  setEditor(editor: Editor | null): void {
    this.store.getState().setEditor(editor);
  }

  /**
   * 更新内容
   */
  setContent(content: JSONContent): void {
    this.store.getState().setContent(content);
  }

  /**
   * 更新 HTML
   */
  setHTML(html: string): void {
    this.store.getState().setHTML(html);
  }

  /**
   * 更新纯文本
   */
  setText(text: string): void {
    this.store.getState().setText(text);
  }

  /**
   * 设置可编辑状态
   */
  setEditable(editable: boolean): void {
    this.store.getState().setEditable(editable);
  }

  /**
   * 设置聚焦状态
   */
  setFocused(focused: boolean): void {
    this.store.getState().setFocused(focused);
  }

  /**
   * 设置选区
   */
  setSelection(selection: EditorSelection | null): void {
    this.store.getState().setSelection(selection);
  }

  /**
   * 设置字数统计
   */
  setWordCount(wordCount: WordCount): void {
    this.store.getState().setWordCount(wordCount);
  }

  /**
   * 设置历史状态
   */
  setHistory(history: HistoryState): void {
    this.store.getState().setHistory(history);
  }

  /**
   * 设置就绪状态
   */
  setReady(ready: boolean): void {
    this.store.getState().setReady(ready);
  }

  /**
   * 设置加载状态
   */
  setLoading(loading: boolean): void {
    this.store.getState().setLoading(loading);
  }

  /**
   * 设置错误
   */
  setError(error: Error | null): void {
    this.store.getState().setError(error);
  }

  /**
   * 重置所有状态
   */
  reset(): void {
    this.store.getState().reset();
  }

  /**
   * 订阅状态变更
   * @param selector - 状态选择器
   * @param listener - 监听器
   */
  subscribe<T>(
    selector: (state: EditorStore) => T,
    listener: (value: T, prevValue: T) => void
  ): () => void {
    const unsubscribe = this.store.subscribe(
      (state) => {
        const value = selector(state);
        listener(value, value);
      }
    );
    this.unsubscribeCallbacks.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * 监听编辑器实例变化
   */
  onEditorChange(listener: (editor: Editor | null) => void): () => void {
    return this.subscribe(
      (state) => state.editor,
      (editor: Editor | null) => listener(editor)
    );
  }

  /**
   * 监听内容变化
   */
  onContentChange(listener: (content: JSONContent | null) => void): () => void {
    return this.subscribe(
      (state) => state.content,
      (content: JSONContent | null) => listener(content)
    );
  }

  /**
   * 监听 HTML 变化
   */
  onHTMLChange(listener: (html: string) => void): () => void {
    return this.subscribe(
      (state) => state.html,
      (html: string) => listener(html)
    );
  }

  /**
   * 监听选区变化
   */
  onSelectionChange(listener: (selection: EditorSelection | null) => void): () => void {
    return this.subscribe(
      (state) => state.selection,
      (selection: EditorSelection | null) => listener(selection)
    );
  }

  /**
   * 监听聚焦状态变化
   */
  onFocusChange(listener: (isFocused: boolean) => void): () => void {
    return this.subscribe(
      (state) => state.isFocused,
      (isFocused: boolean) => listener(isFocused)
    );
  }

  /**
   * 监听可编辑状态变化
   */
  onEditableChange(listener: (isEditable: boolean) => void): () => void {
    return this.subscribe(
      (state) => state.isEditable,
      (isEditable: boolean) => listener(isEditable)
    );
  }

  /**
   * 监听字数统计变化
   */
  onWordCountChange(listener: (wordCount: WordCount) => void): () => void {
    return this.subscribe(
      (state) => state.wordCount,
      (wordCount: WordCount) => listener(wordCount)
    );
  }

  /**
   * 监听历史状态变化
   */
  onHistoryChange(listener: (history: HistoryState) => void): () => void {
    return this.subscribe(
      (state) => state.history,
      (history: HistoryState) => listener(history)
    );
  }

  /**
   * 监听就绪状态变化
   */
  onReadyChange(listener: (isReady: boolean) => void): () => void {
    return this.subscribe(
      (state) => state.isReady,
      (isReady: boolean) => listener(isReady)
    );
  }

  /**
   * 监听错误变化
   */
  onErrorChange(listener: (error: Error | null) => void): () => void {
    return this.subscribe(
      (state) => state.error,
      (error: Error | null) => listener(error)
    );
  }

  /**
   * 批量更新状态
   */
  batchUpdate(updates: Partial<EditorStateStore>): void {
    const currentState = this.store.getState();
    this.store.setState({ ...currentState, ...updates });
  }

  /**
   * 从编辑器状态同步
   */
  syncFromEditor(editor: Editor): void {
    const { state } = editor;
    const { selection } = state;

    this.batchUpdate({
      content: editor.getJSON(),
      html: editor.getHTML(),
      text: editor.getText(),
      selection: {
        from: selection.from,
        to: selection.to,
        empty: selection.empty,
        anchor: selection.anchor,
        head: selection.head,
      } as EditorSelection,
    });
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    // 取消所有订阅
    this.unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeCallbacks = [];
    
    // 重置状态
    this.reset();
  }
}

/**
 * 创建状态管理器的工厂函数
 */
export function createStateManager(initialState?: Partial<EditorStateStore>): StateManager {
  return new StateManager(initialState);
}

export default StateManager;
