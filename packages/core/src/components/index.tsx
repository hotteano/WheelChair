// ============================================
// 工具栏组件
// ============================================
export { Toolbar } from './Toolbar/Toolbar';
export { ToolbarButton } from './Toolbar/ToolbarButton';
export { ToolbarDropdown } from './Toolbar/ToolbarDropdown';
export { ToolbarDivider } from './Toolbar/ToolbarDivider';

// ============================================
// 浮动菜单
// ============================================
export { BubbleMenu } from './BubbleMenu';

// ============================================
// 斜杠菜单
// ============================================
export { SlashMenu } from './SlashMenu';

// ============================================
// 状态栏
// ============================================
export { StatusBar } from './StatusBar';

// ============================================
// 图片上传组件
// ============================================
export {
  ImageUpload,
  ImageResize,
  ImageMenu,
  useImageUpload,
} from './ImageUpload';

// ============================================
// 链接菜单组件
// ============================================
export {
  LinkMenu,
  LinkPreview,
} from './LinkMenu';

// ============================================
// 代码块组件
// ============================================
export {
  CodeBlockView,
  LanguageSelector,
} from './CodeBlock';

// ============================================
// 表格菜单
// ============================================
export {
  TableMenu,
  TableGrid,
} from './TableMenu';

// ============================================
// 导出菜单
// ============================================
export { ExportMenu } from './ExportMenu';

// ============================================
// 侧边栏组件
// ============================================
export {
  Sidebar,
  SearchBox,
  NewDocumentButton,
  DocumentList,
  DocumentItem,
} from './Sidebar';

// ============================================
// 编辑器布局组件
// ============================================
export { EditorLayout } from './EditorLayout';

// ============================================
// Markdown 编辑器组件
// ============================================
export { MarkdownPreview } from './MarkdownPreview';
export { SplitPane } from './SplitPane';
export { MarkdownEditor } from './MarkdownEditor';
export { MathEditor } from './MathEditor';

// ============================================
// 编辑器专用组件（为演示应用提供）
// ============================================

export type EditorToolbarProps = { editor: any };
export type EditorStatusBarProps = { editor: any; lastSaved: Date | null };
export type ExportButtonProps = { getContent: () => string };
export type ImportButtonProps = { onImport: (content: string) => void };
export type ThemeToggleProps = { theme: string; onToggle: () => void };
