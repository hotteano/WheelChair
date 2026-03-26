/**
 * JSON Exporter
 * JSON 格式导出器
 */

import type { Node, TextNode, ElementNode } from '../model/node';
import { ExportFormat } from '../utils/importExport';
import type { ExportOptions } from '../utils/importExport';

export interface JSONExportOptions extends ExportOptions {
  /** 是否包含文档元数据 */
  includeMetadata?: boolean;
  /** 元数据 */
  metadata?: Record<string, unknown>;
  /** 是否包含节点位置信息 */
  includePositions?: boolean;
  /** 是否包含版本信息 */
  includeVersion?: boolean;
  /** 导出格式版本 */
  version?: string;
  /** 是否压缩（无缩进） */
  compact?: boolean;
  /** 缩进空格数 */
  indent?: number;
  /** 自定义节点处理器 */
  nodeHandler?: (node: Node) => unknown;
}

export interface ExportedDocument {
  /** 文档版本 */
  version: string;
  /** 导出格式 */
  format: string;
  /** 导出时间戳 */
  exportedAt: string;
  /** 元数据 */
  metadata?: Record<string, unknown>;
  /** 内容节点 */
  content: unknown[];
  /** 统计信息 */
  stats?: DocumentStats;
}

export interface DocumentStats {
  /** 节点总数 */
  totalNodes: number;
  /** 文本节点数 */
  textNodes: number;
  /** 元素节点数 */
  elementNodes: number;
  /** 字符数（不含空白） */
  characterCount: number;
  /** 单词数 */
  wordCount: number;
  /** 最大深度 */
  maxDepth: number;
}

export class JSONExporter {
  readonly format = ExportFormat.JSON;
  readonly name = 'JSON';
  readonly extensions = ['json'];
  readonly mimeType = 'application/json';

  private options: JSONExportOptions;

  constructor(options: JSONExportOptions = {}) {
    this.options = {
      includeMetadata: true,
      includePositions: false,
      includeVersion: true,
      version: '1.0.0',
      compact: false,
      indent: 2,
      ...options,
    };
  }

  /**
   * 导出节点为 JSON
   */
  export(nodes: Node[], options?: JSONExportOptions): string {
    const mergedOptions = { ...this.options, ...options };
    
    const document = this.createDocument(nodes, mergedOptions);
    
    const indent = mergedOptions.compact ? undefined : mergedOptions.indent;
    
    return JSON.stringify(document, null, indent);
  }

  /**
   * 创建导出文档
   */
  private createDocument(nodes: Node[], options: JSONExportOptions): ExportedDocument {
    const document: ExportedDocument = {
      version: options.includeVersion ? (options.version || '1.0.0') : '1.0.0',
      format: 'wheelchair-document',
      exportedAt: new Date().toISOString(),
      content: nodes.map(node => this.serializeNode(node, options)),
    };

    if (options.includeMetadata) {
      document.metadata = {
        ...this.generateDefaultMetadata(),
        ...options.metadata,
      };
    }

    if (!options.compact) {
      document.stats = this.calculateStats(nodes);
    }

    return document;
  }

  /**
   * 序列化节点
   */
  private serializeNode(node: Node, options: JSONExportOptions): unknown {
    if (options.nodeHandler) {
      const result = options.nodeHandler(node);
      if (result !== undefined) return result;
    }

    if (node.type === 'text') {
      return this.serializeTextNode(node as TextNode, options);
    }

    if (node.type === 'element') {
      return this.serializeElementNode(node as ElementNode, options);
    }

    return null;
  }

  /**
   * 序列化文本节点
   */
  private serializeTextNode(node: TextNode, options: JSONExportOptions): Record<string, unknown> {
    const result: Record<string, unknown> = {
      type: 'text',
      text: node.text,
    };

    if (node.marks && node.marks.length > 0) {
      result.marks = node.marks;
    }

    if (options.includePositions && node.position) {
      result.position = node.position;
    }

    return result;
  }

  /**
   * 序列化元素节点
   */
  private serializeElementNode(
    node: ElementNode, 
    options: JSONExportOptions
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {
      type: 'element',
      nodeType: node.nodeType,
    };

    if (node.children && node.children.length > 0) {
      result.children = node.children.map(child => 
        this.serializeNode(child, options)
      );
    }

    if (node.attrs && Object.keys(node.attrs).length > 0) {
      result.attrs = node.attrs;
    }

    if (node.styles && Object.keys(node.styles).length > 0) {
      result.styles = node.styles;
    }

    if (node.marks && node.marks.length > 0) {
      result.marks = node.marks;
    }

    if (options.includePositions && node.position) {
      result.position = node.position;
    }

    return result;
  }

  /**
   * 生成默认元数据
   */
  private generateDefaultMetadata(): Record<string, unknown> {
    return {
      generator: 'WheelChair Editor',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };
  }

  /**
   * 计算文档统计信息
   */
  private calculateStats(nodes: Node[]): DocumentStats {
    const stats: DocumentStats = {
      totalNodes: 0,
      textNodes: 0,
      elementNodes: 0,
      characterCount: 0,
      wordCount: 0,
      maxDepth: 0,
    };

    const traverse = (node: Node, depth: number) => {
      stats.totalNodes++;
      stats.maxDepth = Math.max(stats.maxDepth, depth);

      if (node.type === 'text') {
        stats.textNodes++;
        const text = (node as TextNode).text;
        stats.characterCount += text.replace(/\s/g, '').length;
        stats.wordCount += text.trim().split(/\s+/).filter(w => w).length;
      } else if (node.type === 'element') {
        stats.elementNodes++;
        for (const child of (node as ElementNode).children) {
          traverse(child, depth + 1);
        }
      }
    };

    for (const node of nodes) {
      traverse(node, 1);
    }

    return stats;
  }

  /**
   * 导出节点为扁平化 JSON（便于其他系统处理）
   */
  exportFlat(nodes: Node[], options?: JSONExportOptions): string {
    const mergedOptions = { ...this.options, ...options };
    
    const flatNodes: unknown[] = [];
    
    const flatten = (node: Node, parentId: string | null, index: number): void => {
      const id = parentId ? `${parentId}.${index}` : `${index}`;
      
      const flatNode: Record<string, unknown> = {
        id,
        parentId,
        index,
        ...this.serializeNode(node, mergedOptions),
      };
      
      flatNodes.push(flatNode);
      
      if (node.type === 'element') {
        (node as ElementNode).children.forEach((child, i) => {
          flatten(child, id, i);
        });
      }
    };
    
    nodes.forEach((node, i) => flatten(node, null, i));
    
    const indent = mergedOptions.compact ? undefined : mergedOptions.indent;
    return JSON.stringify(flatNodes, null, indent);
  }

  /**
   * 导出为简单的节点数组（不含包装对象）
   */
  exportRaw(nodes: Node[], options?: JSONExportOptions): string {
    const mergedOptions = { ...this.options, ...options };
    const serialized = nodes.map(node => this.serializeNode(node, mergedOptions));
    const indent = mergedOptions.compact ? undefined : mergedOptions.indent;
    return JSON.stringify(serialized, null, indent);
  }

  /**
   * 导出为 Blob
   */
  exportAsBlob(nodes: Node[], options?: JSONExportOptions): Blob {
    const content = this.export(nodes, options);
    return new Blob([content], { type: this.mimeType });
  }

  /**
   * 导出扁平化为 Blob
   */
  exportFlatAsBlob(nodes: Node[], options?: JSONExportOptions): Blob {
    const content = this.exportFlat(nodes, options);
    return new Blob([content], { type: this.mimeType });
  }

  /**
   * 获取默认文件名
   */
  getDefaultFilename(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `document-${timestamp}.json`;
  }

  /**
   * 验证导出的 JSON
   */
  validate(json: string): { valid: boolean; error?: string } {
    try {
      const parsed = JSON.parse(json);
      
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'Invalid JSON structure' };
      }

      if (!parsed.content || !Array.isArray(parsed.content)) {
        return { valid: false, error: 'Missing or invalid content array' };
      }

      return { valid: true };
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  }
}

// 便捷函数
export function exportToJSON(
  nodes: Node[],
  options?: JSONExportOptions
): { content: string; filename: string; mimeType: string } {
  const exporter = new JSONExporter(options);
  return {
    content: exporter.export(nodes, options),
    filename: options?.title
      ? `${options.title}.json`
      : exporter.getDefaultFilename(),
    mimeType: exporter.mimeType,
  };
}

export function exportToFlatJSON(
  nodes: Node[],
  options?: JSONExportOptions
): { content: string; filename: string; mimeType: string } {
  const exporter = new JSONExporter(options);
  return {
    content: exporter.exportFlat(nodes, options),
    filename: options?.title
      ? `${options.title}-flat.json`
      : exporter.getDefaultFilename().replace('.json', '-flat.json'),
    mimeType: exporter.mimeType,
  };
}

export default JSONExporter;
