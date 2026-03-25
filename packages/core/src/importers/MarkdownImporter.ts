/**
 * Markdown Importer
 * Markdown 格式导入器
 */

import type { Node } from '../model/node';
import type { ExportFormat, ImportOptions } from '../utils/importExport';
import { MarkdownParser, parseMarkdown } from '../utils/markdown';

export interface MarkdownImportOptions extends ImportOptions {
  /** 是否启用 GFM 扩展 */
  gfm?: boolean;
  /** 是否支持 HTML 内嵌 */
  html?: boolean;
  /** 链接处理函数 */
  linkHandler?: (href: string) => string;
  /** 图片路径处理函数 */
  imagePathHandler?: (src: string) => string;
  /** 代码高亮处理函数 */
  highlightHandler?: (code: string, language?: string) => string;
  /** YAML frontmatter 处理器 */
  frontmatterHandler?: (frontmatter: Record<string, unknown>) => void;
  /** 是否保留原始换行 */
  preserveLineBreaks?: boolean;
}

export interface ImportResult {
  /** 解析的节点 */
  nodes: Node[];
  /** 提取的元数据 */
  metadata?: Record<string, unknown>;
  /** 解析统计 */
  stats?: {
    totalLines: number;
    processedLines: number;
    blockCount: number;
  };
}

export class MarkdownImporter {
  readonly format = ExportFormat.MARKDOWN;
  readonly name = 'Markdown';
  readonly extensions = ['md', 'markdown', 'mdown', 'mkd'];
  readonly mimeType = 'text/markdown';

  private options: MarkdownImportOptions;

  constructor(options: MarkdownImportOptions = {}) {
    this.options = {
      gfm: true,
      html: false,
      preserveLineBreaks: false,
      ...options,
    };
  }

  /**
   * 导入 Markdown 内容为节点数组
   */
  import(content: string, options?: MarkdownImportOptions): ImportResult {
    const mergedOptions = { ...this.options, ...options };
    
    // 提取 YAML frontmatter
    const { content: cleanContent, metadata } = this.extractFrontmatter(content);
    
    if (metadata && mergedOptions.frontmatterHandler) {
      mergedOptions.frontmatterHandler(metadata);
    }

    // 解析 Markdown
    const parser = new MarkdownParser({
      html: mergedOptions.html,
      preserveStyles: mergedOptions.preserveStyles,
      linkHandler: mergedOptions.linkHandler,
    });

    const nodes = parser.parse(cleanContent);

    // 处理图片路径
    if (mergedOptions.imagePathHandler) {
      this.processImagePaths(nodes, mergedOptions.imagePathHandler);
    }

    return {
      nodes,
      metadata,
      stats: {
        totalLines: content.split('\n').length,
        processedLines: cleanContent.split('\n').length,
        blockCount: nodes.length,
      },
    };
  }

  /**
   * 从文件导入
   */
  async importFromFile(file: File, options?: MarkdownImportOptions): Promise<ImportResult> {
    const content = await this.readFile(file);
    return this.import(content, options);
  }

  /**
   * 提取 YAML frontmatter
   */
  private extractFrontmatter(content: string): { content: string; metadata?: Record<string, unknown> } {
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    
    if (!frontmatterMatch) {
      return { content };
    }

    const frontmatterText = frontmatterMatch[1];
    const remainingContent = content.slice(frontmatterMatch[0].length);
    
    const metadata = this.parseFrontmatter(frontmatterText);
    
    return { content: remainingContent, metadata };
  }

  /**
   * 解析 YAML frontmatter（简化版）
   */
  private parseFrontmatter(text: string): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};
    const lines = text.split('\n');
    
    let currentKey: string | null = null;
    let currentValue: string[] = [];
    let isMultiline = false;

    for (const line of lines) {
      const trimmed = line.trimEnd();
      
      // 键值对
      const keyValueMatch = trimmed.match(/^(\w+):\s*(.*)$/);
      
      if (keyValueMatch) {
        // 保存之前的键值对
        if (currentKey) {
          metadata[currentKey] = this.parseValue(currentValue.join('\n'));
        }
        
        currentKey = keyValueMatch[1];
        const value = keyValueMatch[2];
        
        // 检查是否是多行值
        if (value === '|' || value === '>') {
          isMultiline = true;
          currentValue = [];
        } else {
          isMultiline = false;
          currentValue = [value];
        }
      } else if (isMultiline && currentKey && trimmed) {
        // 多行值的续行（移除缩进）
        currentValue.push(trimmed.replace(/^  /, ''));
      }
    }
    
    // 保存最后一个键值对
    if (currentKey) {
      metadata[currentKey] = this.parseValue(currentValue.join('\n'));
    }

    return metadata;
  }

  /**
   * 解析值
   */
  private parseValue(value: string): unknown {
    value = value.trim();
    
    // 布尔值
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // 数字
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
    
    // 数组（简化支持）
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        return JSON.parse(value);
      } catch {
        return value.slice(1, -1).split(',').map(s => s.trim());
      }
    }
    
    // 字符串（移除引号）
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    return value;
  }

  /**
   * 处理图片路径
   */
  private processImagePaths(nodes: Node[], handler: (src: string) => string): void {
    const processNode = (node: Node): void => {
      if (node.type === 'element') {
        if (node.nodeType === 'image' && node.attrs?.src) {
          node.attrs.src = handler(node.attrs.src as string);
        }
        node.children?.forEach(processNode);
      }
    };

    nodes.forEach(processNode);
  }

  /**
   * 读取文件内容
   */
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  /**
   * 验证 Markdown 内容
   */
  validate(content: string): { valid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: 'Content must be a non-empty string' };
    }

    // 基本的语法检查
    const hasInvalidStructure = /\n{10,}/.test(content);
    if (hasInvalidStructure) {
      return { valid: false, error: 'Content appears to have invalid structure' };
    }

    return { valid: true };
  }

  /**
   * 检测内容是否为 Markdown
   */
  static detect(content: string): boolean {
    const markdownPatterns = [
      /^#{1,6}\s/m,
      /\*\*|__/m,
      /```[\s\S]*?```/m,
      /`[^`]+`/m,
      /\[.*?\]\(.*?\)/m,
      /^\s*[-*+]\s/m,
      /^\s*\d+\.\s/m,
      /^\|.*\|$/m,
      />\s/m,
      /^---\s*$/m,
    ];

    return markdownPatterns.some(pattern => pattern.test(content));
  }
}

// 便捷函数
export function importFromMarkdown(
  content: string,
  options?: MarkdownImportOptions
): ImportResult {
  const importer = new MarkdownImporter(options);
  return importer.import(content, options);
}

export async function importMarkdownFromFile(
  file: File,
  options?: MarkdownImportOptions
): Promise<ImportResult> {
  const importer = new MarkdownImporter(options);
  return importer.importFromFile(file, options);
}

export default MarkdownImporter;
