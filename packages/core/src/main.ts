// ============================================
// WheelChair Editor Core - Main Export
// ============================================

// Tiptap 核心类型导出
export type { JSONContent } from '@tiptap/core';

// Editor Core
export { WheelChairEditor } from './editor/WheelChairEditor';
export type { EditorConfig, EditorState } from './editor/WheelChairEditor';

// Extensions
export { MarkdownInputRules } from './extensions';
export type { MarkdownInputRulesOptions, InputRuleConfig } from './extensions';

// Math Extensions
export {
  InlineMath,
  BlockMath,
  MathExtensions,
  MathPlugin,
  createInlineMathRule,
  createBlockMathRule,
  getMathInputRules,
  insertInlineMath,
  insertBlockMath,
  updateMath,
  deleteMath,
  isMath,
  getMathContent,
} from './extensions/math';

export type { MathCommands } from './extensions/math';

// Document Management
export { DocumentManager } from './document/DocumentManager';

// Importers
export { importFromMarkdown } from './importers/MarkdownImporter';

// Exporters
export { exportToMarkdown } from './exporters/MarkdownExporter';

// Components
export { EditorLayout } from './components/EditorLayout';
export { Sidebar } from './components/Sidebar';
export { StatusBar } from './components/StatusBar';
export { Toolbar } from './components/Toolbar';
export { MarkdownPreview } from './components/MarkdownPreview';
export { SplitPane } from './components/SplitPane';
export { MarkdownEditor } from './components/MarkdownEditor';
export { MathEditor } from './components/MathEditor';

// Component Types
export type { EditorLayoutProps } from './components/EditorLayout';
export type { SidebarProps } from './components/Sidebar';
export type { StatusBarProps } from './components/StatusBar';
export type { ToolbarProps } from './components/Toolbar';
export type { MarkdownPreviewProps } from './components/MarkdownPreview';
export type { SplitPaneProps } from './components/SplitPane';
export type { MarkdownEditorProps, EditorMode } from './components/MarkdownEditor';
export type { MathEditorProps } from './components/MathEditor';

// Context
export { ThemeProvider, useTheme } from './contexts/ThemeContext';
export type { Theme } from './contexts/ThemeContext';

// Utils
export { cn } from './utils/cn';

// Hooks
export { useDocumentManager } from './hooks/useDocumentManager';
export type { UseDocumentManagerReturn, Document } from './hooks/useDocumentManager';

// Version
export const VERSION = '1.0.1';
