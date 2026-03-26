/**
 * HTML Importer
 * HTML 格式导入器
 */

import type { Node, TextNode, ElementNode } from '../model/node';
import { ExportFormat } from '../utils/importExport';
import type { ImportOptions } from '../utils/importExport';

export interface HTMLImportOptions extends ImportOptions {
  /** 允许的标签列表 */
  allowedTags?: string[];
  /** 禁止的属性列表 */
  forbiddenAttributes?: string[];
  /** 样式映射 */
  styleMap?: Record<string, string>;
  /** 是否清理空标签 */
  removeEmptyTags?: boolean;
  /** 是否保留换行符 */
  preserveLineBreaks?: boolean;
  /** 图片处理函数 */
  imageHandler?: (src: string) => string;
  /** 链接处理函数 */
  linkHandler?: (href: string) => string;
  /** 最大解析深度 */
  maxDepth?: number;
}

export interface HTMLImportResult {
  /** 解析的节点 */
  nodes: Node[];
  /** 提取的标题 */
  title?: string;
  /** 提取的元数据 */
  metadata?: Record<string, string>;
  /** 解析统计 */
  stats?: {
    elementCount: number;
    textNodeCount: number;
    imageCount: number;
    linkCount: number;
  };
}

export class HTMLImporter {
  readonly format = ExportFormat.HTML;
  readonly name = 'HTML';
  readonly extensions = ['html', 'htm'];
  readonly mimeType = 'text/html';

  private options: HTMLImportOptions;
  private stats: NonNullable<HTMLImportResult['stats']>;

  constructor(options: HTMLImportOptions = {}) {
    this.options = {
      removeEmptyTags: true,
      preserveLineBreaks: true,
      forbiddenAttributes: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseenter'],
      maxDepth: 100,
      ...options,
    };
    
    this.stats = {
      elementCount: 0,
      textNodeCount: 0,
      imageCount: 0,
      linkCount: 0,
    };
  }

  /**
   * 导入 HTML 内容为节点数组
   */
  import(content: string, options?: HTMLImportOptions): HTMLImportResult {
    const mergedOptions = { ...this.options, ...options };
    this.stats = { elementCount: 0, textNodeCount: 0, imageCount: 0, linkCount: 0 };

    // 创建 DOM 解析器
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // 提取标题和元数据
    const title = this.extractTitle(doc);
    const metadata = this.extractMetadata(doc);

    // 清理文档
    this.sanitizeDocument(doc, mergedOptions);

    // 解析内容
    const body = doc.body;
    const nodes = this.parseElement(body, 0, mergedOptions);

    return {
      nodes,
      title,
      metadata,
      stats: { ...this.stats },
    };
  }

  /**
   * 从文件导入
   */
  async importFromFile(file: File, options?: HTMLImportOptions): Promise<HTMLImportResult> {
    const content = await this.readFile(file);
    return this.import(content, options);
  }

  /**
   * 从 URL 导入
   */
  async importFromURL(url: string, options?: HTMLImportOptions): Promise<HTMLImportResult> {
    const response = await fetch(url);
    const content = await response.text();
    return this.import(content, options);
  }

  /**
   * 提取标题
   */
  private extractTitle(doc: Document): string | undefined {
    const titleEl = doc.querySelector('title');
    const h1El = doc.querySelector('h1');
    return titleEl?.textContent || h1El?.textContent || undefined;
  }

  /**
   * 提取元数据
   */
  private extractMetadata(doc: Document): Record<string, string> {
    const metadata: Record<string, string> = {};
    
    // meta 标签
    const metaTags = doc.querySelectorAll('meta');
    metaTags.forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        metadata[name] = content;
      }
    });

    // Open Graph 标签
    const ogTags = doc.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (property && content) {
        metadata[property] = content;
      }
    });

    return metadata;
  }

  /**
   * 清理文档
   */
  private sanitizeDocument(doc: Document, options: HTMLImportOptions): void {
    // 移除 script 和 style 标签
    const scripts = doc.querySelectorAll('script, style, noscript, iframe');
    scripts.forEach(el => el.remove());

    // 移除危险属性
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
      options.forbiddenAttributes?.forEach(attr => {
        el.removeAttribute(attr);
      });
    });
  }

  /**
   * 解析元素
   */
  private parseElement(element: Element, depth: number, options: HTMLImportOptions): Node[] {
    if (depth > (options.maxDepth || 100)) {
      return [];
    }

    const nodes: Node[] = [];

    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = this.processTextContent(child.textContent || '', options);
        if (text || !options.removeEmptyTags) {
          nodes.push(this.createTextNode(text));
          this.stats.textNodeCount++;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        const tagName = el.tagName.toLowerCase();

        // 检查是否允许该标签
        if (options.allowedTags && !options.allowedTags.includes(tagName)) {
          // 递归解析子元素
          nodes.push(...this.parseElement(el, depth + 1, options));
          continue;
        }

        const node = this.convertElement(el, depth, options);
        if (node) {
          nodes.push(node);
        }
      }
    }

    return this.mergeTextNodes(nodes);
  }

  /**
   * 转换元素为节点
   */
  private convertElement(element: Element, depth: number, options: HTMLImportOptions): Node | null {
    const tagName = element.tagName.toLowerCase();
    this.stats.elementCount++;

    // 提取属性
    const attrs = this.extractAttributes(element, options);

    // 处理特殊元素
    switch (tagName) {
      case 'br':
        return this.createElementNode('hardBreak', []);

      case 'hr':
        return this.createElementNode('horizontalRule', []);

      case 'img':
        this.stats.imageCount++;
        let src = attrs.src || '';
        if (options.imageHandler) {
          src = options.imageHandler(src);
        }
        return this.createElementNode('image', [], {
          src,
          alt: attrs.alt || '',
          title: attrs.title || '',
        });

      case 'pre':
        return this.parsePreElement(element, options);

      case 'code':
        if (element.parentElement?.tagName.toLowerCase() === 'pre') {
          // 已由 pre 处理
          return null;
        }
        return this.createElementNode('inlineCode', [
          this.createTextNode(element.textContent || '')
        ]);

      case 'a':
        this.stats.linkCount++;
        let href = attrs.href || '';
        if (options.linkHandler) {
          href = options.linkHandler(href);
        }
        return this.createElementNode('link', 
          this.parseElement(element, depth + 1, options),
          { href, title: attrs.title || '' }
        );

      case 'table':
        return this.parseTable(element, depth, options);
    }

    // 通用处理
    const nodeType = this.getNodeType(tagName);
    const children = this.parseElement(element, depth + 1, options);

    if (options.removeEmptyTags && children.length === 0 && !this.isVoidElement(tagName)) {
      return null;
    }

    // 处理样式
    const styles = this.extractStyles(element, options);

    return this.createElementNode(nodeType, children, attrs, styles);
  }

  /**
   * 解析 pre 元素（代码块）
   */
  private parsePreElement(element: Element, options: HTMLImportOptions): Node {
    const codeEl = element.querySelector('code');
    
    if (codeEl) {
      const language = this.detectLanguage(codeEl);
      const content = codeEl.textContent || '';
      return this.createElementNode('codeBlock', [
        this.createTextNode(content)
      ], { language });
    }

    const content = element.textContent || '';
    return this.createElementNode('codeBlock', [
      this.createTextNode(content)
    ]);
  }

  /**
   * 检测代码语言
   */
  private detectLanguage(codeEl: Element): string {
    // 从 class 检测
    const className = codeEl.className || '';
    const match = className.match(/(?:language|lang)-(\w+)/);
    if (match) return match[1];

    // 从 data 属性检测
    const dataLang = codeEl.getAttribute('data-language') || codeEl.getAttribute('data-lang');
    if (dataLang) return dataLang;

    return '';
  }

  /**
   * 解析表格
   */
  private parseTable(element: Element, depth: number, options: HTMLImportOptions): Node | null {
    const rows: Node[] = [];
    
    // 表头
    const thead = element.querySelector('thead');
    if (thead) {
      const headerRows = this.parseTableSection(thead, depth, options, true);
      rows.push(...headerRows);
    }

    // 表体
    const tbody = element.querySelector('tbody');
    if (tbody) {
      const bodyRows = this.parseTableSection(tbody, depth, options, false);
      rows.push(...bodyRows);
    } else {
      // 直接解析 tr
      const trs = element.querySelectorAll(':scope > tr, :scope > tbody > tr');
      trs.forEach((tr, index) => {
        const isHeader = index === 0 && !thead;
        const row = this.parseTableRow(tr, isHeader, options);
        if (row) rows.push(row);
      });
    }

    if (rows.length === 0) return null;

    return this.createElementNode('table', rows);
  }

  /**
   * 解析表格区域
   */
  private parseTableSection(
    section: Element, 
    depth: number, 
    options: HTMLImportOptions,
    isHeader: boolean
  ): Node[] {
    const rows: Node[] = [];
    const trs = section.querySelectorAll('tr');
    
    trs.forEach(tr => {
      const row = this.parseTableRow(tr, isHeader, options);
      if (row) rows.push(row);
    });

    return rows;
  }

  /**
   * 解析表格行
   */
  private parseTableRow(tr: Element, isHeader: boolean, options: HTMLImportOptions): Node | null {
    const cells: Node[] = [];
    const cellTag = isHeader ? 'th' : 'td';
    const cellElements = tr.querySelectorAll(cellTag);
    
    cellElements.forEach(cell => {
      const cellContent = this.parseElement(cell, 0, options);
      const cellNode = this.createElementNode(
        isHeader ? 'tableHeader' : 'tableCell',
        cellContent
      );
      cells.push(cellNode);
    });

    if (cells.length === 0) return null;

    return this.createElementNode(
      isHeader ? 'tableHeaderRow' : 'tableRow',
      cells
    );
  }

  /**
   * 提取属性
   */
  private extractAttributes(element: Element, options: HTMLImportOptions): Record<string, string> {
    const attrs: Record<string, string> = {};
    
    for (const attr of Array.from(element.attributes)) {
      if (!options.forbiddenAttributes?.includes(attr.name)) {
        attrs[attr.name] = attr.value;
      }
    }

    return attrs;
  }

  /**
   * 提取样式
   */
  private extractStyles(element: Element, options: HTMLImportOptions): Record<string, string> {
    const styles: Record<string, string> = {};
    const styleAttr = element.getAttribute('style');
    
    if (styleAttr && options.preserveStyles) {
      styleAttr.split(';').forEach(decl => {
        const [prop, value] = decl.split(':').map(s => s.trim());
        if (prop && value) {
          const mappedProp = options.styleMap?.[prop] || prop;
          styles[mappedProp] = value;
        }
      });
    }

    return styles;
  }

  /**
   * 处理文本内容
   */
  private processTextContent(text: string, options: HTMLImportOptions): string {
    if (options.preserveLineBreaks) {
      return text;
    }
    return text.replace(/\s+/g, ' ');
  }

  /**
   * 合并连续的文本节点
   */
  private mergeTextNodes(nodes: Node[]): Node[] {
    const result: Node[] = [];
    let lastTextNode: TextNode | null = null;

    for (const node of nodes) {
      if (node.type === 'text') {
        const textNode = node as TextNode;
        if (lastTextNode) {
          lastTextNode.text += textNode.text;
        } else {
          lastTextNode = { ...textNode };
          result.push(lastTextNode);
        }
      } else {
        lastTextNode = null;
        result.push(node);
      }
    }

    return result;
  }

  /**
   * 获取节点类型
   */
  private getNodeType(tagName: string): string {
    const typeMap: Record<string, string> = {
      p: 'paragraph',
      h1: 'heading1', h2: 'heading2', h3: 'heading3',
      h4: 'heading4', h5: 'heading5', h6: 'heading6',
      strong: 'bold', b: 'bold',
      em: 'italic', i: 'italic',
      s: 'strikethrough', strike: 'strikethrough', del: 'strikethrough',
      u: 'underline',
      blockquote: 'blockquote',
      ul: 'unorderedList',
      ol: 'orderedList',
      li: 'listItem',
      div: 'div',
      span: 'span',
    };

    return typeMap[tagName] || 'div';
  }

  /**
   * 检查是否是空元素
   */
  private isVoidElement(tagName: string): boolean {
    return ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName);
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
    children: Node[] = [],
    attrs: Record<string, string> = {},
    styles: Record<string, string> = {}
  ): ElementNode {
    const node: ElementNode = {
      type: 'element',
      nodeType,
      children,
      attrs,
    };
    
    if (Object.keys(styles).length > 0) {
      node.styles = styles;
    }
    
    return node;
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
   * 验证 HTML
   */
  validate(content: string): { valid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: 'Content must be a non-empty string' };
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // 检查解析错误
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        return { valid: false, error: 'HTML parsing error' };
      }

      return { valid: true };
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  }
}

// 便捷函数
export function importFromHTML(
  content: string,
  options?: HTMLImportOptions
): HTMLImportResult {
  const importer = new HTMLImporter(options);
  return importer.import(content, options);
}

export async function importHTMLFromFile(
  file: File,
  options?: HTMLImportOptions
): Promise<HTMLImportResult> {
  const importer = new HTMLImporter(options);
  return importer.importFromFile(file, options);
}

export default HTMLImporter;
