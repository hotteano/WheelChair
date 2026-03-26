/**
 * WheelChair Core - Main Entry Point
 * WheelChair 富文本编辑器核心入口
 */

// ============================================
// 核心编辑器
// ============================================
export * from './core/WheelChairEditor';
export * from './core/StateManager';
export * from './core/HistoryManager';

// ============================================
// 文档管理
// ============================================
export * from './document';

// ============================================
// React Hooks
// ============================================
export * from './hooks/useEditor';
export * from './hooks/useEditorState';
export * from './hooks/useWheelChairEditor';

// ============================================
// Context
// ============================================
export * from './context/ThemeContext';
export * from './context/EditorContext';

// ============================================
// 组件
// ============================================
export * from './components';

// ============================================
// 扩展
// ============================================
export * from './extensions';

// ============================================
// 命令系统
// ============================================
export * from './commands';

// ============================================
// 快捷键系统
// ============================================
export * from './keymap';

// ============================================
// 导入导出工具
// ============================================
export { ImportExportManager } from './utils/importExport';
export type { ExportFormat as UtilExportFormat, ExportOptions as UtilExportOptions, ImportOptions } from './utils/importExport';

// ============================================
// 导出器
// ============================================
export { WCExporter } from './exporters/WCExporter';
export type { WCExportOptions, WCFileStructure } from './exporters/WCExporter';

// ============================================
// 导入器
// ============================================
export { WCImporter } from './importers/WCImporter';
export type { WCImportOptions, WCImportResult } from './importers/WCImporter';

// ============================================
// 版本信息
// ============================================
export const VERSION = '1.0.1';
