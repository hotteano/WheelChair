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
// 导入导出
// ============================================
export * from './utils/importExport';
export * from './utils/markdown';
export * from './utils/html';
export * from './exporters';
export * from './importers';

// ============================================
// 类型
// ============================================
export * from './types';

// ============================================
// 工具函数
// ============================================
export * from './utils';

// ============================================
// 版本信息
// ============================================
export const VERSION = '0.1.0';

// ============================================
// 便捷使用函数
// ============================================
import { ImportExportManager, ExportFormat } from './utils/importExport';
import type { Node } from './model/node';
import type { ExportOptions, ImportOptions } from './utils/importExport';

// 导出器
import { MarkdownExporter } from './exporters/MarkdownExporter';
import { HTMLExporter } from './exporters/HTMLExporter';
import { TextExporter } from './exporters/TextExporter';
import { JSONExporter } from './exporters/JSONExporter';

// 导入器
import { MarkdownImporter } from './importers/MarkdownImporter';
import { HTMLImporter } from './importers/HTMLImporter';
import { TextImporter } from './importers/TextImporter';
import { PasteImporter } from './importers/PasteImporter';

/**
 * 初始化导入导出管理器
 * 注册所有默认格式处理器
 */
export function initializeImportExport(): ImportExportManager {
  const manager = ImportExportManager.getInstance();

  // 注册 Markdown
  const markdownExporter = new MarkdownExporter();
  const markdownImporter = new MarkdownImporter();
  manager.register({
    format: ExportFormat.MARKDOWN,
    name: 'Markdown',
    extensions: ['md', 'markdown'],
    mimeType: 'text/markdown',
    import: (content) => markdownImporter.import(content).nodes,
    export: (nodes, options) => markdownExporter.export(nodes, options),
  });

  // 注册 HTML
  const htmlExporter = new HTMLExporter();
  const htmlImporter = new HTMLImporter();
  manager.register({
    format: ExportFormat.HTML,
    name: 'HTML',
    extensions: ['html', 'htm'],
    mimeType: 'text/html',
    import: (content) => htmlImporter.import(content).nodes,
    export: (nodes, options) => htmlExporter.export(nodes, options),
  });

  // 注册纯文本
  const textExporter = new TextExporter();
  const textImporter = new TextImporter();
  manager.register({
    format: ExportFormat.TEXT,
    name: 'Plain Text',
    extensions: ['txt'],
    mimeType: 'text/plain',
    import: (content) => textImporter.import(content).nodes,
    export: (nodes, options) => textExporter.export(nodes, options),
  });

  // 注册 JSON
  const jsonExporter = new JSONExporter();
  manager.register({
    format: ExportFormat.JSON,
    name: 'JSON',
    extensions: ['json'],
    mimeType: 'application/json',
    import: (content) => {
      const parsed = JSON.parse(content);
      return parsed.content || parsed;
    },
    export: (nodes, options) => jsonExporter.export(nodes, options),
  });

  return manager;
}

/**
 * 快速导出
 */
export function quickExport(
  nodes: Node[],
  format: ExportFormat,
  options?: ExportOptions
): { content: string; filename: string; mimeType: string } {
  const manager = ImportExportManager.getInstance();
  const content = manager.export(format, nodes, options);
  const handler = manager.getHandler(format);

  return {
    content,
    filename: options?.title 
      ? `${options.title}.${handler?.extensions[0]}`
      : getDefaultFilename(format),
    mimeType: handler?.mimeType || 'text/plain',
  };
}

/**
 * 快速导入
 */
export function quickImport(
  content: string,
  format: ExportFormat,
  options?: ImportOptions
): Node[] {
  const manager = ImportExportManager.getInstance();
  return manager.import(format, content, options);
}

/**
 * 自动检测并导入
 */
export function autoImport(content: string, options?: ImportOptions): {
  format: ExportFormat;
  nodes: Node[];
} {
  const manager = ImportExportManager.getInstance();
  const format = manager.detectFormatByContent(content);

  if (!format) {
    throw new Error('Unable to detect content format');
  }

  return {
    format,
    nodes: manager.import(format, content, options),
  };
}

/**
 * 获取默认文件名
 */
function getDefaultFilename(format: ExportFormat): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const names: Record<ExportFormat, string> = {
    [ExportFormat.MARKDOWN]: `document-${timestamp}.md`,
    [ExportFormat.HTML]: `document-${timestamp}.html`,
    [ExportFormat.JSON]: `document-${timestamp}.json`,
    [ExportFormat.TEXT]: `document-${timestamp}.txt`,
  };
  return names[format];
}
