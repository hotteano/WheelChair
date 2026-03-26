/**
 * WheelChair Exporter
 * WheelChair 专属格式 (.wc) 导出器
 * 
 * .wc 文件格式说明：
 * - 基于 JSON 的纯文本格式
 * - 包含完整的文档内容和元数据
 * - 支持版本控制，便于未来升级
 * - 使用 gzip 压缩（可选）以减小文件大小
 */

import type { Node } from '../model/node';
import type { ExportOptions } from '../utils/importExport';
import { ExportFormat } from '../utils/importExport';

export interface WCExportOptions extends ExportOptions {
  /** 文档标题 */
  title?: string;
  /** 文档作者 */
  author?: string;
  /** 文档描述 */
  description?: string;
  /** 标签 */
  tags?: string[];
  /** 是否压缩内容 */
  compress?: boolean;
  /** 自定义元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * .wc 文件结构
 */
export interface WCFileStructure {
  /** 格式标识 */
  format: 'wheelchair';
  /** 版本号 */
  version: string;
  /** 创建时间 */
  createdAt: string;
  /** 修改时间 */
  modifiedAt: string;
  /** 文档内容 */
  document: {
    /** 文档标题 */
    title: string;
    /** 内容节点 */
    content: Node[];
    /** 字数统计 */
    wordCount?: number;
  };
  /** 元数据 */
  metadata: {
    /** 作者 */
    author?: string;
    /** 描述 */
    description?: string;
    /** 标签 */
    tags?: string[];
    /** 编辑器版本 */
    editorVersion?: string;
    /** 自定义元数据 */
    [key: string]: unknown;
  };
  /** 是否压缩 */
  compressed?: boolean;
}

export class WCExporter {
  readonly format = ExportFormat.WC;
  readonly name = 'WheelChair Document';
  readonly extensions = ['wc'];
  readonly mimeType = 'application/wheelchair+json';

  private options: WCExportOptions;

  constructor(options: WCExportOptions = {}) {
    this.options = {
      compress: false,
      ...options,
    };
  }

  /**
   * 导出节点为 .wc 格式
   */
  export(nodes: Node[], options?: WCExportOptions): string {
    const mergedOptions = { ...this.options, ...options };
    const now = new Date().toISOString();

    const wcFile: WCFileStructure = {
      format: 'wheelchair',
      version: '1.0.0',
      createdAt: now,
      modifiedAt: now,
      document: {
        title: mergedOptions.title || 'Untitled Document',
        content: nodes,
        wordCount: this.calculateWordCount(nodes),
      },
      metadata: {
        author: mergedOptions.author,
        description: mergedOptions.description,
        tags: mergedOptions.tags,
        editorVersion: '0.1.0',
        ...mergedOptions.metadata,
      },
      compressed: mergedOptions.compress || false,
    };

    // 转换为 JSON 字符串
    let content = JSON.stringify(wcFile, null, mergedOptions.pretty ? 2 : undefined);

    // 如果需要压缩（这里使用简单的 Base64 编码作为示例）
    if (mergedOptions.compress) {
      content = this.compressContent(content);
    }

    return content;
  }

  /**
   * 导出文档对象（直接从 DocumentManager 使用）
   */
  exportDocument(document: {
    id?: string;
    title: string;
    content: unknown;
    createdAt?: number;
    updatedAt?: number;
    wordCount?: number;
    [key: string]: unknown;
  }, options?: WCExportOptions): string {
    const mergedOptions = { ...this.options, ...options };
    const now = new Date().toISOString();

    const wcFile: WCFileStructure = {
      format: 'wheelchair',
      version: '1.0.0',
      createdAt: document.createdAt ? new Date(document.createdAt).toISOString() : now,
      modifiedAt: document.updatedAt ? new Date(document.updatedAt).toISOString() : now,
      document: {
        title: document.title || mergedOptions.title || 'Untitled Document',
        content: Array.isArray(document.content) ? document.content : [document.content as Node],
        wordCount: document.wordCount || 0,
      },
      metadata: {
        author: mergedOptions.author,
        description: mergedOptions.description,
        tags: mergedOptions.tags,
        editorVersion: '0.1.0',
        originalId: document.id,
        ...mergedOptions.metadata,
      },
      compressed: mergedOptions.compress || false,
    };

    let content = JSON.stringify(wcFile, null, mergedOptions.pretty ? 2 : undefined);

    if (mergedOptions.compress) {
      content = this.compressContent(content);
    }

    return content;
  }

  /**
   * 计算字数
   */
  private calculateWordCount(nodes: Node[]): number {
    let count = 0;

    const traverse = (node: Node & { text?: string; children?: Node[] }) => {
      if (node.type === 'text' && node.text) {
        // 中文按字符计，英文按单词计
        const text = node.text;
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = text
          .replace(/[\u4e00-\u9fa5]/g, '')
          .trim()
          .split(/\s+/)
          .filter(w => w.length > 0).length;
        count += chineseChars + englishWords;
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    nodes.forEach(traverse);
    return count;
  }

  /**
   * 压缩内容（Base64 编码）
   * 注意：这只是简单示例，生产环境可以使用 pako 等库进行真正的 gzip 压缩
   */
  private compressContent(content: string): string {
    try {
      // 在浏览器环境中使用 btoa 进行 Base64 编码
      if (typeof window !== 'undefined') {
        return 'COMPRESSED:' + btoa(unescape(encodeURIComponent(content)));
      }
      return content;
    } catch {
      return content;
    }
  }

  /**
   * 生成默认文件名
   */
  getDefaultFilename(title?: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const safeTitle = title ? title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').slice(0, 50) : 'document';
    return `${safeTitle}-${timestamp}.wc`;
  }
}

export default WCExporter;
