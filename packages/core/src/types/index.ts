/**
 * WheelChair Editor - Types
 * 所有类型定义
 */

import type { Editor, EditorOptions, Extensions, JSONContent } from '@tiptap/core';
import type { Editor as TiptapEditor } from '@tiptap/core';
import type { EditorState as PMEditorState } from '@tiptap/pm/state';
import type { Node as PMNode } from '@tiptap/pm/model';

// ============================================
// 基础类型
// ============================================

export type { Editor, EditorOptions, Extensions, JSONContent };
export type { TiptapEditor };
export type { PMEditorState, PMNode };

// ============================================
// 编辑器配置
// ============================================

export interface WheelChairEditorOptions {
  content?: string | JSONContent;
  editable?: boolean;
  placeholder?: string;
  autofocus?: boolean | 'start' | 'end' | 'all' | number;
  extensions?: Extensions;
  onChange?: (content: JSONContent) => void;
  onUpdate?: ({ editor }: { editor: Editor }) => void;
  onSelectionUpdate?: ({ editor }: { editor: Editor }) => void;
  onFocus?: ({ editor }: { editor: Editor }) => void;
  onBlur?: ({ editor }: { editor: Editor }) => void;
  onError?: (error: Error) => void;
}

export interface UseEditorProps extends Partial<WheelChairEditorOptions> {}

export interface UseWheelChairEditorOptions extends Partial<WheelChairEditorOptions> {
  onReady?: (editor: Editor) => void;
}

export interface UseWheelChairEditorReturn {
  editor: Editor | null;
  isReady: boolean;
  error: Error | null;
}

// ============================================
// 编辑器状态
// ============================================

export interface EditorSelection {
  from: number;
  to: number;
}

export interface WordCount {
  words: number;
  characters: number;
  charactersWithoutSpaces?: number;
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
  syncFromEditor: (editor: Editor) => void;
}

export type EditorStore = EditorStateStore & EditorStateActions;

// ============================================
// 历史管理
// ============================================

export interface HistoryEntry {
  state: PMEditorState;
  timestamp: number;
  label?: string;
}

export interface HistoryManagerOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

export interface HistoryManager {
  add: (state: PMEditorState, label?: string) => void;
  undo: () => PMEditorState | null;
  redo: () => PMEditorState | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
  getHistory: () => HistoryEntry[];
}

// ============================================
// 工具栏
// ============================================

export interface ToolbarButtonProps {
  icon?: React.ReactNode;
  label?: string;
  iconOnly?: boolean;
  active?: boolean;
  disabled?: boolean;
  shortcut?: string;
  tooltip?: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  hasDropdown?: boolean;
}

export interface ToolbarDropdownProps {
  label: string;
  value?: string;
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export interface ToolbarDividerProps {}

export interface ToolbarProps {
  children?: React.ReactNode;
  className?: string;
}

// ============================================
// 事件
// ============================================

export type EditorEventMap = {
  'update': { editor: Editor };
  'selectionUpdate': { editor: Editor };
  'focus': { editor: Editor };
  'blur': { editor: Editor };
  'contentError': { editor: Editor; error: Error };
};

export type EventListener<T extends keyof EditorEventMap> = 
  (event: EditorEventMap[T]) => void;

export interface EventEmitter {
  on<T extends keyof EditorEventMap>(
    event: T,
    listener: EventListener<T>
  ): () => void;
  off<T extends keyof EditorEventMap>(
    event: T,
    listener: EventListener<T>
  ): void;
  emit<T extends keyof EditorEventMap>(
    event: T,
    data: EditorEventMap[T]
  ): void;
}

// ============================================
// 内容操作
// ============================================

export interface InsertOptions {
  at?: number | 'start' | 'end' | 'selection';
  updateSelection?: boolean;
}

export interface SetContentOptions {
  emitUpdate?: boolean;
  preserveScroll?: boolean;
}

// ============================================
// 扩展
// ============================================

export interface NodeAttributes {
  [key: string]: string | number | boolean | undefined;
}

export interface MarkAttributes {
  [key: string]: string | number | boolean | undefined;
}

// ============================================
// 状态 Hook
// ============================================

export interface UseEditorStateOptions {
  editor: Editor | null;
  debounceMs?: number;
}

export interface UseEditorStateReturn {
  content: JSONContent | null;
  html: string;
  text: string;
  selection: EditorSelection | null;
  wordCount: WordCount;
  isFocused: boolean;
  isEditable: boolean;
}

// ============================================
// 主题
// ============================================

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  setLightTheme: () => void;
  setDarkTheme: () => void;
  applySystemTheme: () => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  systemTheme: ResolvedTheme | null;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  disableSystem?: boolean;
  onThemeChange?: (theme: Theme, resolvedTheme: ResolvedTheme) => void;
}

// ============================================
// 文档管理类型
// ============================================

export type {
  Document,
  DocumentState,
  DocumentActions,
  DocumentStore,
  PersistedDocuments,
  DocumentManagerOptions,
  ExportFormat,
  ExportOptions,
  DocumentEventMap,
  DocumentEventListener,
  GenerateId,
  DocumentFilter,
  DocumentSorter,
} from '../document/types';

export { ExportFormat } from '../document/types';

// ============================================
// React 导入
// ============================================

import type * as React from 'react';
export { React };

// ============================================
// 命令系统
// ============================================

export interface CommandContext {
  editor: Editor;
  state: PMEditorState;
  dispatch?: (tr: any) => boolean;
}

export interface CommandResult {
  success: boolean;
  error?: string;
}

export type Command = (
  context: CommandContext,
  ...args: any[]
) => CommandResult | boolean;

export interface CommandRegistration {
  id: string;
  command: Command;
  category: string;
  shortcut?: string;
}

export interface CommandManagerOptions {
  maxHistorySize?: number;
}

export interface CommandManager {
  register: (registration: CommandRegistration) => void;
  unregister: (id: string) => void;
  execute: (id: string, ...args: any[]) => CommandResult;
  canExecute: (id: string) => boolean;
  getShortcut: (id: string) => string | undefined;
  undo: () => boolean;
  redo: () => boolean;
}

// ============================================
// 快捷键
// ============================================

export interface KeymapManagerOptions {
  capture?: boolean;
}

export interface Keybinding {
  key: string;
  command: string;
  when?: string;
}

export interface KeybindingConflict {
  key: string;
  existingCommand: string;
  newCommand: string;
}

export interface KeymapManager {
  register: (binding: Keybinding) => void;
  unregister: (key: string) => void;
  resolve: (key: string) => string | undefined;
  getConflicts: () => KeybindingConflict[];
}
