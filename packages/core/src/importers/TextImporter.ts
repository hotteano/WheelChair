/**
 * Text Importer
 * 纯文本格式导入器
 */

import type { Node, TextNode, ElementNode } from '../model/node';
import { ExportFormat } from '../utils/importExport';
import type { ImportOptions } from '../utils/importExport';

export interface TextImportOptions extends ImportOptions {
  /** 是否自动检测列表 */
  detectLists?: boolean;
  /** 是否自动检测标题 */
  detectHeadings?: boolean;
  /** 是否自动检测引用 */
  detectBlockquotes?: boolean;
  /** 是否自动检测代码块 */
  detectCodeBlocks?: boolean;
  /** 段落分隔正则 */
  paragraphSeparator?: RegExp;
  /** 编码 */
  encoding?: string;
  /** 最大行长度（用于表格检测） */
  maxLineLength?: number;
}

export interface TextImportResult {
  /** 解析的节点 */
  nodes: Node[];
  /** 统计信息 */
  stats?: {
    lineCount: number;
    characterCount: number;
    wordCount: number;
    paragraphCount: number;
  };
}

export class TextImporter {
  readonly format = ExportFormat.TEXT;
  readonly name = 'Plain Text';
  readonly extensions = ['txt'];
  readonly mimeType = 'text/plain';

  private options: TextImportOptions;

  constructor(options: TextImportOptions = {}) {
    this.options = {
      detectLists: true,
      detectHeadings: true,
      detectBlockquotes: true,
      detectCodeBlocks: true,
      paragraphSeparator: /\n\s*\n/,
      maxLineLength: 1000,
      ...options,
    };
  }

  /**
   * 导入文本内容为节点数组
   */
  import(content: string, options?: TextImportOptions): TextImportResult {
    const mergedOptions = { ...this.options, ...options };
    
    // 规范化换行符
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // 分割为段落
    const paragraphs = this.splitParagraphs(normalizedContent, mergedOptions);
    
    // 解析每个段落
    const nodes: Node[] = [];
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      const node = this.parseParagraph(trimmed, mergedOptions);
      if (node) {
        nodes.push(node);
      }
    }

    // 计算统计信息
    const stats = {
      lineCount: normalizedContent.split('\n').length,
      characterCount: normalizedContent.length,
      wordCount: normalizedContent.trim().split(/\s+/).filter(w => w).length,
      paragraphCount: nodes.length,
    };

    return { nodes, stats };
  }

  /**
   * 从文件导入
   */
  async importFromFile(file: File, options?: TextImportOptions): Promise<TextImportResult> {
    const content = await this.readFile(file);
    return this.import(content, options);
  }

  /**
   * 分割段落
   */
  private splitParagraphs(content: string, options: TextImportOptions): string[] {
    const separator = options.paragraphSeparator || /\n\s*\n/;
    return content.split(separator).filter(p => p.trim());
  }

  /**
   * 解析单个段落
   */
  private parseParagraph(text: string, options: TextImportOptions): Node | null {
    // 检测代码块
    if (options.detectCodeBlocks && this.isCodeBlock(text)) {
      return this.parseCodeBlock(text, options);
    }

    // 检测标题（下划线样式）
    if (options.detectHeadings && this.isSetextHeading(text)) {
      return this.parseSetextHeading(text, options);
    }

    // 检测标题（ATX 样式）
    if (options.detectHeadings && this.isAtxHeading(text)) {
      return this.parseAtxHeading(text, options);
    }

    // 检测引用
    if (options.detectBlockquotes && this.isBlockquote(text)) {
      return this.parseBlockquote(text, options);
    }

    // 检测列表
    if (options.detectLists && this.isList(text)) {
      return this.parseList(text, options);
    }

    // 普通段落
    return this.createParagraph(text, options);
  }

  /**
   * 检测代码块
   */
  private isCodeBlock(text: string): boolean {
    const lines = text.split('\n');
    // 多行且缩进至少4个空格或以制表符开头
    if (lines.length < 2) return false;
    
    const indentedLines = lines.filter(line => 
      line.startsWith('    ') || line.startsWith('\t')
    );
    
    return indentedLines.length >= lines.length * 0.8;
  }

  /**
   * 解析代码块
   */
  private parseCodeBlock(text: string, options: TextImportOptions): Node {
    const lines = text.split('\n');
    const code = lines.map(line => 
      line.replace(/^(    |\t)/, '')
    ).join('\n');

    return this.createElementNode('codeBlock', [
      this.createTextNode(code)
    ], { language: '' });
  }

  /**
   * 检测 Setext 样式标题
   */
  private isSetextHeading(text: string): boolean {
    const lines = text.split('\n');
    if (lines.length !== 2) return false;
    
    const underline = lines[1].trim();
    return /^[=\-]+$/.test(underline) && underline.length >= lines[0].length;
  }

  /**
   * 解析 Setext 标题
   */
  private parseSetextHeading(text: string, options: TextImportOptions): Node {
    const lines = text.split('\n');
    const content = lines[0].trim();
    const level = lines[1].trim()[0] === '=' ? 1 : 2;
    
    return this.createElementNode(`heading${level}`, [
      this.createTextNode(content)
    ]);
  }

  /**
   * 检测 ATX 样式标题
   */
  private isAtxHeading(text: string): boolean {
    return /^#{1,6}\s+.+$/.test(text);
  }

  /**
   * 解析 ATX 标题
   */
  private parseAtxHeading(text: string, options: TextImportOptions): Node {
    const match = text.match(/^(#{1,6})\s+(.+)$/);
    if (!match) {
      return this.createParagraph(text, options);
    }
    
    const level = match[1].length;
    const content = match[2].trim();
    
    return this.createElementNode(`heading${level}`, [
      this.createTextNode(content)
    ]);
  }

  /**
   * 检测引用
   */
  private isBlockquote(text: string): boolean {
    const lines = text.split('\n');
    return lines.every(line => !line.trim() || line.trimStart().startsWith('>'));
  }

  /**
   * 解析引用
   */
  private parseBlockquote(text: string, options: TextImportOptions): Node {
    const lines = text.split('\n');
    const content = lines.map(line => 
      line.trimStart().replace(/^>\s?/, '')
    ).join('\n');

    // 递归解析内容
    const innerImporter = new TextImporter({ ...options, detectBlockquotes: false });
    const innerResult = innerImporter.import(content, options);

    return this.createElementNode('blockquote', innerResult.nodes);
  }

  /**
   * 检测列表
   */
  private isList(text: string): boolean {
    const lines = text.split('\n');
    const listPatterns = [
      /^\s*[-*+]\s/,           // 无序列表
      /^\s*\d+[.)]\s/,         // 有序列表
    ];
    
    return lines.some(line => 
      listPatterns.some(pattern => pattern.test(line))
    );
  }

  /**
   * 解析列表
   */
  private parseList(text: string, options: TextImportOptions): Node {
    const lines = text.split('\n');
    const firstLine = lines[0];
    
    // 检测列表类型
    const isOrdered = /^\s*\d+[.)]\s/.test(firstLine);
    
    // 解析列表项
    const items: Node[] = [];
    let currentItem: string[] = [];
    
    const flushItem = () => {
      if (currentItem.length > 0) {
        const itemText = currentItem.join('\n').trim();
        if (itemText) {
          // 移除列表标记
          const cleanText = itemText.replace(/^\s*(?:[-*+\d.)]+)\s*/, '');
          items.push(this.createElementNode('listItem', [
            this.createParagraph(cleanText, options) || this.createTextNode('')
          ]));
        }
        currentItem = [];
      }
    };
    
    for (const line of lines) {
      if (/^\s*(?:[-*+\d.)]+)\s/.test(line)) {
        flushItem();
      }
      currentItem.push(line);
    }
    flushItem();

    const nodeType = isOrdered ? 'orderedList' : 'unorderedList';
    return this.createElementNode(nodeType, items);
  }

  /**
   * 创建段落
   */
  private createParagraph(text: string, options: TextImportOptions): Node {
    return this.createElementNode('paragraph', [
      this.createTextNode(text)
    ]);
  }

  /**
   * 创建文本节点
   */
  private createTextNode(text: string): TextNode {
    return { type: 'text', text };
  }

  /**
   * 创建元素节点
   */
  private createElementNode(
    nodeType: string,
    children: Node[],
    attrs: Record<string, string> = {}
  ): ElementNode {
    return {
      type: 'element',
      nodeType,
      children,
      attrs,
    };
  }

  /**
   * 读取文件
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
   * 验证文本内容
   */
  validate(content: string): { valid: boolean; error?: string } {
    if (content === null || content === undefined) {
      return { valid: false, error: 'Content cannot be null or undefined' };
    }
    
    if (typeof content !== 'string') {
      return { valid: false, error: 'Content must be a string' };
    }

    // 检查是否包含二进制数据
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)) {
      return { valid: false, error: 'Content appears to contain binary data' };
    }

    return { valid: true };
  }

  /**
   * 检测内容类型
   */
  static detectContentType(content: string): 'text' | 'code' | 'markdown' | 'unknown' {
    // Markdown 检测
    const markdownPatterns = [
      /^#{1,6}\s/m,
      /\*\*|__/m,
      /```/m,
      /\[.*?\]\(.*?\)/m,
    ];
    
    if (markdownPatterns.some(p => p.test(content))) {
      return 'markdown';
    }

    // 代码检测
    const codePatterns = [
      /^(    |\t)/m,
      /^(function|class|const|let|var|import|export)\s/m,
      /[{};]$/m,
    ];
    
    if (codePatterns.some(p => p.test(content))) {
      return 'code';
    }

    // 纯文本检测
    if (/^[\s\w\p{P}]*$/u.test(content)) {
      return 'text';
    }

    return 'unknown';
  }
}

// 便捷函数
export function importFromText(
  content: string,
  options?: TextImportOptions
): TextImportResult {
  const importer = new TextImporter(options);
  return importer.import(content, options);
}

export async function importTextFromFile(
  file: File,
  options?: TextImportOptions
): Promise<TextImportResult> {
  const importer = new TextImporter(options);
  return importer.importFromFile(file, options);
}

export default TextImporter;
