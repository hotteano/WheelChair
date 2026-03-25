/**
 * HTML 工具模块
 * 提供 HTML 的导入导出功能
 */

import type { Node, TextNode, ElementNode } from '../model/node';
import type { ExportOptions, ImportOptions } from './importExport';

/**
 * HTML 导出选项
 */
export interface HTMLExportOptions extends ExportOptions {
  /** 是否包含完整 HTML 文档结构 */
  fullDocument?: boolean;
  /** CSS 样式表 */
  css?: string;
  /** 是否使用语义化标签 */
  semanticTags?: boolean;
  /** 图片处理函数 */
  imageHandler?: (src: string) => string;
}

/**
 * HTML 导入选项
 */
export interface HTMLImportOptions extends ImportOptions {
  /** 允许的标签列表 */
  allowedTags?: string[];
  /** 禁止的属性列表 */
  forbiddenAttributes?: string[];
  /** 是否清理空标签 */
  removeEmptyTags?: boolean;
  /** 自定义标签映射 */
  tagMap?: Record<string, string>;
}

/**
 * HTML 序列化器 - 将节点转换为 HTML
 */
export class HTMLSerializer {
  private options: HTMLExportOptions;

  constructor(options: HTMLExportOptions = {}) {
    this.options = {
      inlineStyles: true,
      pretty: false,
      fullDocument: false,
      semanticTags: true,
      ...options,
    };
  }

  /**
   * 将节点数组序列化为 HTML
   */
  serialize(nodes: Node[]): string {
    const content = nodes.map(node => this.serializeNode(node)).join('');
    
    if (this.options.fullDocument) {
      return this.wrapFullDocument(content);
    }
    
    return content;
  }

  /**
   * 包装为完整 HTML 文档
   */
  private wrapFullDocument(content: string): string {
    const title = this.options.title || 'Document';
    const css = this.options.css || this.getDefaultCSS();
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <style>
${css}
  </style>
</head>
<body>
<div class="wheelchair-content">
${content}
</div>
</body>
</html>`;
  }

  /**
   * 获取默认 CSS
   */
  private getDefaultCSS(): string {
    return `/* WheelChair Editor Default Styles */
.wheelchair-content {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.wheelchair-content h1, 
.wheelchair-content h2, 
.wheelchair-content h3, 
.wheelchair-content h4, 
.wheelchair-content h5, 
.wheelchair-content h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.wheelchair-content h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
.wheelchair-content h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
.wheelchair-content h3 { font-size: 1.25em; }
.wheelchair-content h4 { font-size: 1em; }
.wheelchair-content h5 { font-size: 0.875em; }
.wheelchair-content h6 { font-size: 0.85em; color: #6a737d; }

.wheelchair-content p { margin-bottom: 16px; }

.wheelchair-content a { color: #0366d6; text-decoration: none; }
.wheelchair-content a:hover { text-decoration: underline; }

.wheelchair-content code {
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 85%;
  margin: 0;
  padding: 0.2em 0.4em;
}

.wheelchair-content pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  font-size: 85%;
  line-height: 1.45;
  overflow: auto;
  padding: 16px;
}

.wheelchair-content pre code {
  background-color: transparent;
  border: 0;
  display: inline;
  line-height: inherit;
  margin: 0;
  overflow: visible;
  padding: 0;
  word-wrap: normal;
}

.wheelchair-content blockquote {
  border-left: 0.25em solid #dfe2e5;
  color: #6a737d;
  margin: 0 0 16px 0;
  padding: 0 1em;
}

.wheelchair-content ul, .wheelchair-content ol {
  margin-bottom: 16px;
  padding-left: 2em;
}

.wheelchair-content li + li { margin-top: 0.25em; }

.wheelchair-content table {
  border-collapse: collapse;
  border-spacing: 0;
  display: block;
  margin-bottom: 16px;
  overflow: auto;
  width: 100%;
}

.wheelchair-content table th,
.wheelchair-content table td {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

.wheelchair-content table th {
  background-color: #f6f8fa;
  font-weight: 600;
}

.wheelchair-content img {
  background-color: #fff;
  box-sizing: content-box;
  max-width: 100%;
}

.wheelchair-content hr {
  background-color: #e1e4e8;
  border: 0;
  height: 0.25em;
  margin: 24px 0;
  padding: 0;
}`;
  }

  /**
   * 序列化单个节点
   */
  private serializeNode(node: Node): string {
    if (node.type === 'text') {
      return this.escapeHtml((node as TextNode).text);
    }

    if (node.type === 'element') {
      const element = node as ElementNode;
      const tag = this.getHtmlTag(element.nodeType);
      const attrs = this.serializeAttributes(element);
      const content = element.children.map(child => this.serializeNode(child)).join('');
      
      if (this.isVoidElement(tag)) {
        return `<${tag}${attrs}>`;
      }
      
      return `<${tag}${attrs}>${content}</${tag}>`;
    }

    return '';
  }

  /**
   * 获取 HTML 标签名
   */
  private getHtmlTag(nodeType: string): string {
    const tagMap: Record<string, string> = {
      paragraph: this.options.semanticTags ? 'p' : 'p',
      heading1: 'h1',
      heading2: 'h2',
      heading3: 'h3',
      heading4: 'h4',
      heading5: 'h5',
      heading6: 'h6',
      bold: 'strong',
      italic: 'em',
      strikethrough: 's',
      underline: 'u',
      inlineCode: 'code',
      codeBlock: 'pre',
      blockquote: 'blockquote',
      unorderedList: 'ul',
      orderedList: 'ol',
      listItem: 'li',
      link: 'a',
      image: 'img',
      table: 'table',
      tableHeaderRow: 'tr',
      tableRow: 'tr',
      tableHeader: 'th',
      tableCell: 'td',
      horizontalRule: 'hr',
      lineBreak: 'br',
      hardBreak: 'br',
      div: 'div',
      span: 'span',
    };

    return tagMap[nodeType] || 'div';
  }

  /**
   * 检查是否是空元素
   */
  private isVoidElement(tag: string): boolean {
    return ['img', 'hr', 'br', 'input', 'meta', 'link'].includes(tag);
  }

  /**
   * 序列化属性
   */
  private serializeAttributes(element: ElementNode): string {
    const attrs: string[] = [];
    
    if (element.attrs) {
      for (const [key, value] of Object.entries(element.attrs)) {
        if (value !== undefined && value !== null) {
          // 特殊属性处理
          if (key === 'src' && element.nodeType === 'image' && this.options.imageHandler) {
            attrs.push(`${key}="${this.escapeHtml(this.options.imageHandler(String(value)))}"`);
          } else {
            attrs.push(`${key}="${this.escapeHtml(String(value))}"`);
          }
        }
      }
    }

    // 内联样式
    if (this.options.inlineStyles && element.styles) {
      const styleStr = Object.entries(element.styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
      if (styleStr) {
        attrs.push(`style="${this.escapeHtml(styleStr)}"`);
      }
    }

    return attrs.length ? ' ' + attrs.join(' ') : '';
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    
    return text.replace(/[&<>"'\/]/g, char => htmlEscapes[char]);
  }
}

/**
 * HTML 解析器 - 将 HTML 解析为节点
 */
export class HTMLParser {
  private options: HTMLImportOptions;
  private allowedTags: Set<string>;

  constructor(options: HTMLImportOptions = {}) {
    this.options = {
      preserveStyles: true,
      removeEmptyTags: true,
      forbiddenAttributes: ['onclick', 'onload', 'onerror', 'onmouseover'],
      ...options,
    };
    
    this.allowedTags = new Set(this.options.allowedTags || [
      'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 's', 'strike', 'del', 'u',
      'code', 'pre', 'blockquote',
      'ul', 'ol', 'li',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
    ]);
  }

  /**
   * 解析 HTML 字符串为节点数组
   */
  parse(html: string): Node[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 移除危险元素
    this.sanitizeDocument(doc);
    
    const body = doc.body;
    return this.parseElement(body);
  }

  /**
   * 清理文档
   */
  private sanitizeDocument(doc: Document): void {
    // 移除 script 标签
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(s => s.remove());
    
    // 移除 style 标签
    const styles = doc.querySelectorAll('style');
    styles.forEach(s => s.remove());
    
    // 移除事件属性
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
      this.options.forbiddenAttributes?.forEach(attr => {
        el.removeAttribute(attr);
      });
    });
  }

  /**
   * 解析元素
   */
  private parseElement(element: Element): Node[] {
    const nodes: Node[] = [];
    
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || '';
        if (text.trim() || !this.options.removeEmptyTags) {
          nodes.push(this.createTextNode(text));
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        const tagName = el.tagName.toLowerCase();
        
        // 检查是否允许该标签
        if (!this.allowedTags.has(tagName)) {
          // 递归解析子元素
          nodes.push(...this.parseElement(el));
          continue;
        }

        const node = this.convertElementToNode(el);
        if (node) {
          nodes.push(node);
        }
      }
    }
    
    return nodes;
  }

  /**
   * 转换元素为节点
   */
  private convertElementToNode(element: Element): Node | null {
    const tagName = element.tagName.toLowerCase();
    const nodeType = this.getNodeType(tagName);
    
    // 提取属性
    const attrs: Record<string, string> = {};
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        if (!this.options.forbiddenAttributes?.includes(attr.name)) {
          attrs[attr.name] = attr.value;
        }
      }
    }

    // 处理 void 元素
    if (['br', 'hr', 'img'].includes(tagName)) {
      if (tagName === 'img') {
        return this.createElementNode('image', [], {
          src: attrs.src || '',
          alt: attrs.alt || '',
          title: attrs.title || '',
        });
      }
      if (tagName === 'hr') {
        return this.createElementNode('horizontalRule', []);
      }
      return null;
    }

    // 处理特殊元素
    if (tagName === 'pre') {
      // 检查是否包含 code 元素
      const codeEl = element.querySelector('code');
      if (codeEl) {
        const language = this.extractLanguageFromClass(codeEl.className);
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

    if (tagName === 'code' && element.parentElement?.tagName.toLowerCase() !== 'pre') {
      // 行内代码
      return this.createElementNode('inlineCode', [
        this.createTextNode(element.textContent || '')
      ]);
    }

    // 递归解析子元素
    const children = this.parseElement(element);
    
    // 移除空标签
    if (this.options.removeEmptyTags && children.length === 0) {
      return null;
    }

    return this.createElementNode(nodeType, children, attrs);
  }

  /**
   * 从 class 中提取语言
   */
  private extractLanguageFromClass(className: string): string {
    const match = className.match(/language-(\w+)/);
    return match ? match[1] : '';
  }

  /**
   * 获取节点类型
   */
  private getNodeType(tagName: string): string {
    const typeMap: Record<string, string> = {
      p: 'paragraph',
      h1: 'heading1',
      h2: 'heading2',
      h3: 'heading3',
      h4: 'heading4',
      h5: 'heading5',
      h6: 'heading6',
      strong: 'bold',
      b: 'bold',
      em: 'italic',
      i: 'italic',
      s: 'strikethrough',
      strike: 'strikethrough',
      del: 'strikethrough',
      u: 'underline',
      blockquote: 'blockquote',
      ul: 'unorderedList',
      ol: 'orderedList',
      li: 'listItem',
      a: 'link',
      table: 'table',
      thead: 'tableHeader',
      tbody: 'tableBody',
      tr: 'tableRow',
      th: 'tableHeaderCell',
      td: 'tableCell',
      div: 'div',
      span: 'span',
      br: 'lineBreak',
      hr: 'horizontalRule',
    };

    return typeMap[tagName] || 'div';
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
    attrs: Record<string, string> = {}
  ): ElementNode {
    return {
      type: 'element',
      nodeType,
      children,
      attrs,
    };
  }
}

/**
 * 清理 HTML - 移除无用标签和样式
 */
export function sanitizeHtml(html: string, options?: HTMLImportOptions): string {
  const parser = new HTMLParser(options);
  const nodes = parser.parse(html);
  const serializer = new HTMLSerializer({ inlineStyles: false });
  return serializer.serialize(nodes);
}

/**
 * 提取纯文本
 */
export function extractText(html: string): string {
  const parser = new HTMLParser({ removeEmptyTags: true });
  const nodes = parser.parse(html);
  
  const extract = (node: Node): string => {
    if (node.type === 'text') {
      return (node as TextNode).text;
    }
    if (node.type === 'element') {
      return (node as ElementNode).children.map(extract).join('');
    }
    return '';
  };
  
  return nodes.map(extract).join('\n').trim();
}

/**
 * 检查是否为有效的 HTML
 */
export function isValidHtml(content: string): boolean {
  const trimmed = content.trim();
  return /^\s*<([a-z][^\s>]*)[^>]*>.*<\/\1>/is.test(trimmed) ||
         /^\s*<[a-z][^>]*\/>/i.test(trimmed);
}
