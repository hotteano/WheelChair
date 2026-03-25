import type { EditorState } from '@tiptap/pm/state';
import { 
  HistoryManager as IHistoryManager, 
  HistoryManagerOptions, 
  HistoryEntry, 
  HistoryState,
  EditorSelection 
} from '../types';

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Required<Omit<HistoryManagerOptions, 'ignoreTransaction' | 'getTransactionLabel'>> = {
  maxDepth: 100,
  mergeWindow: 500,
};

/**
 * 从历史状态中提取选区信息
 */
function getSelectionFromState(state: EditorState): EditorSelection {
  const { selection } = state;
  return {
    from: selection.from,
    to: selection.to,
    empty: selection.empty,
    anchor: selection.anchor,
    head: selection.head,
  };
}

/**
 * 历史管理器
 * 管理编辑器的撤销/重做历史
 */
export class HistoryManager implements IHistoryManager {
  /** 撤销栈 */
  private undoStack: HistoryEntry[] = [];
  /** 重做栈 */
  private redoStack: HistoryEntry[] = [];
  /** 配置选项 */
  private options: Required<HistoryManagerOptions>;
  /** 最后操作时间戳 */
  private lastPushTime: number = 0;
  /** 是否正在撤销/重做中 */
  private isProcessing: boolean = false;
  /** 变更监听器 */
  private listeners: Set<(state: HistoryState) => void> = new Set();

  constructor(options: HistoryManagerOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      ignoreTransaction: options.ignoreTransaction || (() => false),
      getTransactionLabel: options.getTransactionLabel || (() => undefined),
    } as Required<HistoryManagerOptions>;
  }

  /**
   * 添加历史记录
   * @param state - 编辑器状态
   * @param label - 操作标签
   */
  add(state: EditorState, label?: string): void {
    if (this.isProcessing) {
      return;
    }

    // 检查是否应该忽略此事务
    if (this.options.ignoreTransaction && this.options.ignoreTransaction(state.tr)) {
      return;
    }

    const now = Date.now();
    const entry: HistoryEntry = {
      doc: state.doc,
      selection: getSelectionFromState(state),
      timestamp: now,
      label: label || this.options.getTransactionLabel?.(state.tr),
    };

    // 检查是否应该合并到上一个记录
    if (
      this.undoStack.length > 0 &&
      now - this.lastPushTime < this.options.mergeWindow &&
      !label // 如果有标签，不合并
    ) {
      // 替换最后一个记录
      this.undoStack[this.undoStack.length - 1] = entry;
    } else {
      // 添加新记录
      this.undoStack.push(entry);
      
      // 限制历史深度
      if (this.undoStack.length > this.options.maxDepth) {
        this.undoStack.shift();
      }
    }

    // 清空重做栈（新操作会覆盖重做历史）
    if (this.redoStack.length > 0) {
      this.redoStack = [];
    }

    this.lastPushTime = now;
    this.notifyListeners();
  }

  /**
   * 撤销操作
   * @returns 撤销后的历史条目，如果没有可撤销的则返回 null
   */
  undo(): HistoryEntry | null {
    if (!this.canUndo()) {
      return null;
    }

    this.isProcessing = true;

    try {
      // 将当前状态移到重做栈
      const currentEntry = this.undoStack.pop()!;
      this.redoStack.push(currentEntry);

      // 获取上一个状态
      const previousEntry = this.undoStack[this.undoStack.length - 1] || null;

      this.notifyListeners();
      return previousEntry;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 重做操作
   * @returns 重做后的历史条目，如果没有可重做的则返回 null
   */
  redo(): HistoryEntry | null {
    if (!this.canRedo()) {
      return null;
    }

    this.isProcessing = true;

    try {
      // 从重做栈恢复
      const entry = this.redoStack.pop()!;
      this.undoStack.push(entry);

      this.notifyListeners();
      return entry;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 判断是否可以撤销
   */
  canUndo(): boolean {
    return this.undoStack.length > 1; // 至少保留一个初始状态
  }

  /**
   * 判断是否可以重做
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.lastPushTime = 0;
    this.notifyListeners();
  }

  /**
   * 重置历史记录（保留当前状态作为初始状态）
   * @param state - 当前编辑器状态
   */
  reset(state: EditorState): void {
    this.undoStack = [
      {
        doc: state.doc,
        selection: getSelectionFromState(state),
        timestamp: Date.now(),
        label: 'initial',
      },
    ];
    this.redoStack = [];
    this.notifyListeners();
  }

  /**
   * 获取当前历史状态
   */
  getState(): HistoryState {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoDepth: Math.max(0, this.undoStack.length - 1),
      redoDepth: this.redoStack.length,
    };
  }

  /**
   * 获取所有历史条目（用于调试）
   */
  getAllEntries(): { undo: HistoryEntry[]; redo: HistoryEntry[] } {
    return {
      undo: [...this.undoStack],
      redo: [...this.redoStack],
    };
  }

  /**
   * 获取当前撤销栈深度
   */
  getUndoDepth(): number {
    return Math.max(0, this.undoStack.length - 1);
  }

  /**
   * 获取当前重做栈深度
   */
  getRedoDepth(): number {
    return this.redoStack.length;
  }

  /**
   * 跳转到指定历史位置
   * @param targetIndex - 目标索引（相对于初始状态的偏移）
   * @returns 目标位置的条目
   */
  jumpTo(targetIndex: number): HistoryEntry | null {
    const currentIndex = this.undoStack.length - 1;
    
    if (targetIndex < 0 || targetIndex >= this.undoStack.length + this.redoStack.length) {
      return null;
    }

    if (targetIndex < currentIndex) {
      // 向后撤销
      while (this.undoStack.length - 1 > targetIndex && this.canUndo()) {
        const entry = this.undoStack.pop()!;
        this.redoStack.push(entry);
      }
    } else if (targetIndex > currentIndex) {
      // 向前重做
      const steps = targetIndex - currentIndex;
      for (let i = 0; i < steps && this.canRedo(); i++) {
        const entry = this.redoStack.pop()!;
        this.undoStack.push(entry);
      }
    }

    this.notifyListeners();
    return this.undoStack[this.undoStack.length - 1] || null;
  }

  /**
   * 添加历史变更监听器
   * @param listener - 监听器函数
   * @returns 取消监听的函数
   */
  onChange(listener: (state: HistoryState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 移除历史变更监听器
   * @param listener - 监听器函数
   */
  offChange(listener: (state: HistoryState) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('History state listener error:', error);
      }
    });
  }

  /**
   * 销毁历史管理器
   */
  destroy(): void {
    this.listeners.clear();
    this.undoStack = [];
    this.redoStack = [];
  }
}

/**
 * 创建历史管理器的工厂函数
 */
export function createHistoryManager(options?: HistoryManagerOptions): HistoryManager {
  return new HistoryManager(options);
}

export default HistoryManager;
