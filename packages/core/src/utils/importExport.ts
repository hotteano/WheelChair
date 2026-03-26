/**
 * Import/Export Manager
 * 统一的导入导出管理模块
 */

import type { EditorState } from '../editor/EditorState';
import type { Node } from '../model/node';

/**
 * 支持的导入导出格式
 */
export enum ExportFormat {
  MARKDOWN = 'markdown',
  HTML = 'html',
  JSON = 'json',
  TEXT = 'text',
  WC = 'wc', // WheelChair 专属格式
}

/**
 * 格式注册信息
 */
export interface FormatHandler {
  format: ExportFormat;
  name: string;
  extensions: string[];
  mimeType: string;
  import?: (content: string) => Node[];
  export?: (nodes: Node[], options?: ExportOptions) => string;
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 是否包含内联样式 */
  inlineStyles?: boolean;
  /** 是否美化输出 */
  pretty?: boolean;
  /** 自定义标题 */
  title?: string;
  /** 代码块主题 */
  codeTheme?: string;
  /** GFM 扩展支持 */
  gfm?: boolean;
}

/**
 * 导入选项
 */
export interface ImportOptions {
  /** 源格式 */
  format?: ExportFormat;
  /** 是否保留原始样式 */
  preserveStyles?: boolean;
  /** 图片处理 */
  imageHandler?: (src: string) => string | Promise<string>;
}

/**
 * 导入导出管理器
 */
export class ImportExportManager {
  private handlers: Map<ExportFormat, FormatHandler> = new Map();
  private static instance: ImportExportManager;

  private constructor() {}

  static getInstance(): ImportExportManager {
    if (!ImportExportManager.instance) {
      ImportExportManager.instance = new ImportExportManager();
    }
    return ImportExportManager.instance;
  }

  /**
   * 注册格式处理器
   */
  register(handler: FormatHandler): void {
    this.handlers.set(handler.format, handler);
  }

  /**
   * 取消注册格式
   */
  unregister(format: ExportFormat): void {
    this.handlers.delete(format);
  }

  /**
   * 获取格式处理器
   */
  getHandler(format: ExportFormat): FormatHandler | undefined {
    return this.handlers.get(format);
  }

  /**
   * 获取所有支持的格式
   */
  getSupportedFormats(): FormatHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * 检查格式是否支持导入
   */
  canImport(format: ExportFormat): boolean {
    const handler = this.handlers.get(format);
    return !!handler?.import;
  }

  /**
   * 检查格式是否支持导出
   */
  canExport(format: ExportFormat): boolean {
    const handler = this.handlers.get(format);
    return !!handler?.export;
  }

  /**
   * 导入内容
   */
  import(format: ExportFormat, content: string, options?: ImportOptions): Node[] {
    const handler = this.handlers.get(format);
    if (!handler || !handler.import) {
      throw new Error(`Format "${format}" does not support import`);
    }
    return handler.import(content);
  }

  /**
   * 导出内容
   */
  export(format: ExportFormat, nodes: Node[], options?: ExportOptions): string {
    const handler = this.handlers.get(format);
    if (!handler || !handler.export) {
      throw new Error(`Format "${format}" does not support export`);
    }
    return handler.export(nodes, options);
  }

  /**
   * 根据文件扩展名检测格式
   */
  detectFormatByExtension(filename: string): ExportFormat | null {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return null;

    for (const handler of this.handlers.values()) {
      if (handler.extensions.includes(ext)) {
        return handler.format;
      }
    }
    return null;
  }

  /**
   * 根据 MIME 类型检测格式
   */
  detectFormatByMimeType(mimeType: string): ExportFormat | null {
    for (const handler of this.handlers.values()) {
      if (handler.mimeType === mimeType) {
        return handler.format;
      }
    }
    return null;
  }

  /**
   * 根据内容检测格式
   */
  detectFormatByContent(content: string): ExportFormat | null {
    // JSON 检测
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        JSON.parse(content);
        return ExportFormat.JSON;
      } catch {
        // 不是有效的 JSON
      }
    }

    // HTML 检测
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return ExportFormat.HTML;
    }

    // Markdown 检测（简单的启发式）
    const markdownPatterns = [
      /^#{1,6}\s/m,           // 标题
      /\*\*|__/m,             // 粗体
      /\*|_/m,                // 斜体
      /```[\s\S]*?```/m,      // 代码块
      /\[.*?\]\(.*?\)/m,      // 链接
      /^\s*[-*+]\s/m,         // 列表
      /^\s*\d+\.\s/m,         // 有序列表
      /^\|.*\|$/m,            // 表格
    ];

    const isMarkdown = markdownPatterns.some(pattern => pattern.test(content));
    if (isMarkdown) {
      return ExportFormat.MARKDOWN;
    }

    // 默认为纯文本
    return ExportFormat.TEXT;
  }
}

/**
 * 创建并下载文件
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 读取文件内容
 */
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * 获取默认文件名
 */
export function getDefaultFilename(format: ExportFormat, title?: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const safeTitle = title ? title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').slice(0, 50) : 'document';
  
  const names: Record<ExportFormat, string> = {
    [ExportFormat.MARKDOWN]: `${safeTitle}-${timestamp}.md`,
    [ExportFormat.HTML]: `${safeTitle}-${timestamp}.html`,
    [ExportFormat.JSON]: `${safeTitle}-${timestamp}.json`,
    [ExportFormat.TEXT]: `${safeTitle}-${timestamp}.txt`,
    [ExportFormat.WC]: `${safeTitle}-${timestamp}.wc`,
  };
  return names[format];
}

/**
 * 验证导入内容
 */
export function validateImportContent(content: string, format: ExportFormat): boolean {
  switch (format) {
    case ExportFormat.JSON:
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) || typeof parsed === 'object';
      } catch {
        return false;
      }
    case ExportFormat.HTML:
      return /<[a-z][\s\S]*>/i.test(content);
    case ExportFormat.MARKDOWN:
      return content.length > 0;
    case ExportFormat.TEXT:
      return true;
    default:
      return false;
  }
}

// 默认导出
export default ImportExportManager.getInstance();
