/**
 * Markdown 工具模块
 * 提供 Markdown 的导入导出功能
 */

import type { Node, TextNode, ElementNode } from '../model/node';
import type { ExportOptions, ImportOptions } from './importExport';

// Markdown-it 类型声明（实际使用需要安装 markdown-it）
interface MarkdownIt {
  render(md: string): string;
}

/**
 * 节点属性
 */
interface NodeAttributes {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Markdown 导出器选项
 */
export interface MarkdownExportOptions extends ExportOptions {
  /** 表格单元格最小宽度 */
  tableCellMinWidth?: number;
  /** 列表缩进空格数 */
  listIndentSize?: number;
  /** 代码块围栏样式 */
  codeFenceStyle?: 'backtick' | 'tilde';
  /** 标题样式 */
  headingStyle?: 'atx' | 'setext';
}

/**
 * Markdown 导入器选项
 */
export interface MarkdownImportOptions extends ImportOptions {
  /** 是否启用 HTML 标签支持 */
  html?: boolean;
  /** 链接处理函数 */
  linkHandler?: (href: string) => string;
}

/**
 * Markdown 转节点解析器
 */
export class MarkdownParser {
  private options: MarkdownImportOptions;

  constructor(options: MarkdownImportOptions = {}) {
    this.options = {
      html: false,
      preserveStyles: true,
      ...options,
    };
  }

  /**
   * 解析 Markdown 字符串为节点数组
   */
  parse(markdown: string): Node[] {
    const lines = markdown.split('\n');
    const nodes: Node[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // 跳过空行
      if (!line.trim()) {
        i++;
        continue;
      }

      // 代码块
      if (line.startsWith('```')) {
        const result = this.parseCodeBlock(lines, i);
        nodes.push(result.node);
        i = result.nextIndex;
        continue;
      }

      // 标题
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = this.parseInline(headingMatch[2]);
        nodes.push(this.createElementNode(`heading${level}`, content));
        i++;
        continue;
      }

      // Setext 标题
      if (i + 1 < lines.length && lines[i + 1].match(/^[=-]+$/)) {
        const level = lines[i + 1].startsWith('=') ? 1 : 2;
        const content = this.parseInline(line);
        nodes.push(this.createElementNode(`heading${level}`, content));
        i += 2;
        continue;
      }

      // 表格
      if (this.isTableStart(lines, i)) {
        const result = this.parseTable(lines, i);
        nodes.push(result.node);
        i = result.nextIndex;
        continue;
      }

      // 引用
      if (line.startsWith('>')) {
        const result = this.parseBlockquote(lines, i);
        nodes.push(result.node);
        i = result.nextIndex;
        continue;
      }

      // 无序列表
      if (line.match(/^\s*[-*+]\s/)) {
        const result = this.parseList(lines, i, 'unordered');
        nodes.push(result.node);
        i = result.nextIndex;
        continue;
      }

      // 有序列表
      if (line.match(/^\s*\d+[.)]\s/)) {
        const result = this.parseList(lines, i, 'ordered');
        nodes.push(result.node);
        i = result.nextIndex;
        continue;
      }

      // 水平线
      if (line.match(/^\s*[-*_]{3,}\s*$/)) {
        nodes.push(this.createElementNode('horizontalRule', []));
        i++;
        continue;
      }

      // 普通段落
      const result = this.parseParagraph(lines, i);
      nodes.push(result.node);
      i = result.nextIndex;
    }

    return nodes;
  }

  /**
   * 解析代码块
   */
  private parseCodeBlock(lines: string[], start: number): { node: Node; nextIndex: number } {
    const fence = lines[start].match(/^```(\w*)/);
    const language = fence?.[1] || '';
    let content = '';
    let i = start + 1;

    while (i < lines.length && !lines[i].startsWith('```')) {
      content += (content ? '\n' : '') + lines[i];
      i++;
    }

    const node = this.createElementNode('codeBlock', [
      this.createTextNode(content)
    ], { language });

    return { node, nextIndex: i + 1 };
  }

  /**
   * 检查是否是表格开始
   */
  private isTableStart(lines: string[], index: number): boolean {
    if (index + 1 >= lines.length) return false;
    const line1 = lines[index];
    const line2 = lines[index + 1];
    return line1.includes('|') && line2.match(/^\s*\|?[\s\-:|]+\|?[\s\-:|]*$/) !== null;
  }

  /**
   * 解析表格
   */
  private parseTable(lines: string[], start: number): { node: Node; nextIndex: number } {
    const headerLine = lines[start];
    const headers = this.splitTableCells(headerLine);
    let i = start + 2; // 跳过表头行和分隔行
    const rows: string[][] = [];

    while (i < lines.length && lines[i].includes('|') && !lines[i].match(/^\s*$/)) {
      rows.push(this.splitTableCells(lines[i]));
      i++;
    }

    const headerNodes = headers.map(h => 
      this.createElementNode('tableHeader', this.parseInline(h.trim()))
    );
    const rowNodes = rows.map(row => 
      this.createElementNode('tableRow', row.map(cell => 
        this.createElementNode('tableCell', this.parseInline(cell.trim()))
      ))
    );

    const node = this.createElementNode('table', [
      this.createElementNode('tableHeaderRow', headerNodes),
      ...rowNodes
    ]);

    return { node, nextIndex: i };
  }

  /**
   * 分割表格单元格
   */
  private splitTableCells(line: string): string[] {
    return line
      .split('|')
      .map(s => s.trim())
      .filter((s, i, arr) => {
        // 过滤首尾空单元格（由开头的 | 或结尾的 | 产生）
        if (i === 0 && s === '' && arr.length > 1) return false;
        if (i === arr.length - 1 && s === '' && arr.length > 1) return false;
        return true;
      });
  }

  /**
   * 解析引用块
   */
  private parseBlockquote(lines: string[], start: number): { node: Node; nextIndex: number } {
    let content = '';
    let i = start;

    while (i < lines.length && lines[i].startsWith('>')) {
      content += (content ? '\n' : '') + lines[i].slice(1).trimStart();
      i++;
    }

    // 递归解析内容
    const innerParser = new MarkdownParser(this.options);
    const children = innerParser.parse(content);

    const node = this.createElementNode('blockquote', children);
    return { node, nextIndex: i };
  }

  /**
   * 解析列表
   */
  private parseList(lines: string[], start: number, type: 'ordered' | 'unordered'): { node: Node; nextIndex: number } {
    const items: Node[] = [];
    let i = start;
    const indentMatch = lines[start].match(/^(\s*)/);
    const baseIndent = indentMatch ? indentMatch[1].length : 0;

    while (i < lines.length) {
      const line = lines[i];
      const currentIndentMatch = line.match(/^(\s*)/);
      const currentIndent = currentIndentMatch ? currentIndentMatch[1].length : 0;

      if (currentIndent < baseIndent && line.trim()) break;

      const listPattern = type === 'ordered' 
        ? /^\s*\d+[.)]\s/
        : /^\s*[-*+]\s/;

      if (currentIndent === baseIndent && listPattern.test(line)) {
        const content = line.replace(listPattern, '');
        let itemContent = content;
        i++;

        // 收集列表项的后续行（缩进内容）
        while (i < lines.length) {
          const nextLine = lines[i];
          const nextIndentMatch = nextLine.match(/^(\s*)/);
          const nextIndent = nextIndentMatch ? nextIndentMatch[1].length : 0;
          
          if (nextLine.trim() === '') {
            itemContent += '\n';
            i++;
          } else if (nextIndent > baseIndent) {
            itemContent += '\n' + nextLine.slice(baseIndent + 2);
            i++;
          } else {
            break;
          }
        }

        // 递归解析列表项内容
        const innerParser = new MarkdownParser(this.options);
        const children = innerParser.parse(itemContent);
        items.push(this.createElementNode('listItem', children));
      } else {
        break;
      }
    }

    const node = this.createElementNode(type === 'ordered' ? 'orderedList' : 'unorderedList', items);
    return { node, nextIndex: i };
  }

  /**
   * 解析段落
   */
  private parseParagraph(lines: string[], start: number): { node: Node; nextIndex: number } {
    let content = '';
    let i = start;

    while (i < lines.length && lines[i].trim() !== '') {
      // 检查是否是其他块级元素
      if (this.isBlockElement(lines, i)) break;
      
      content += (content ? ' ' : '') + lines[i].trim();
      i++;
    }

    const node = this.createElementNode('paragraph', this.parseInline(content));
    return { node, nextIndex: i };
  }

  /**
   * 检查是否是块级元素开始
   */
  private isBlockElement(lines: string[], index: number): boolean {
    const line = lines[index];
    return !!(
      line.match(/^#{1,6}\s/) ||
      line.match(/^```/) ||
      line.match(/^\s*[-*+]\s/) ||
      line.match(/^\s*\d+[.)]\s/) ||
      line.startsWith('>') ||
      line.match(/^\s*[-*_]{3,}\s*$/) ||
      (index + 1 < lines.length && lines[index + 1].match(/^[=-]+$/))
    );
  }

  /**
   * 解析行内元素
   */
  private parseInline(text: string): Node[] {
    const nodes: Node[] = [];
    let remaining = text;

    // 代码
    const codePattern = /`([^`]+)`/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // 先处理行内代码
    const parts: Array<{ type: 'text' | 'code'; content: string }> = [];
    while ((match = codePattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    // 处理每个部分的行内格式
    for (const part of parts) {
      if (part.type === 'code') {
        nodes.push(this.createElementNode('inlineCode', [this.createTextNode(part.content)]));
      } else {
        nodes.push(...this.parseInlineFormatting(part.content));
      }
    }

    return nodes.length ? nodes : [this.createTextNode(text)];
  }

  /**
   * 解析行内格式（粗体、斜体、链接等）
   */
  private parseInlineFormatting(text: string): Node[] {
    const nodes: Node[] = [];
    
    // 简单的递归下降解析
    const parse = (str: string): Node[] => {
      const result: Node[] = [];
      let i = 0;

      while (i < str.length) {
        // 图片 ![alt](src)
        const imageMatch = str.slice(i).match(/^!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          result.push(this.createElementNode('image', [], { 
            src: imageMatch[2], 
            alt: imageMatch[1] 
          }));
          i += imageMatch[0].length;
          continue;
        }

        // 链接 [text](url)
        const linkMatch = str.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const children = parse(linkMatch[1]);
          const href = this.options.linkHandler ? this.options.linkHandler(linkMatch[2]) : linkMatch[2];
          result.push(this.createElementNode('link', children, { href }));
          i += linkMatch[0].length;
          continue;
        }

        // 自动链接 <url>
        const autoLinkMatch = str.slice(i).match(/^<([a-z][a-z0-9+.-]*:[^>]+)>/i);
        if (autoLinkMatch) {
          const href = autoLinkMatch[1];
          result.push(this.createElementNode('link', [this.createTextNode(href)], { href }));
          i += autoLinkMatch[0].length;
          continue;
        }

        // 粗体 **text** 或 __text__
        const boldMatch = str.slice(i).match(/^(\*\*|__)(.+?)\1/);
        if (boldMatch) {
          const children = parse(boldMatch[2]);
          result.push(this.createElementNode('bold', children));
          i += boldMatch[0].length;
          continue;
        }

        // 斜体 *text* 或 _text_
        const italicMatch = str.slice(i).match(/^(\*|_)([^*_]+?)\1/);
        if (italicMatch) {
          const children = parse(italicMatch[2]);
          result.push(this.createElementNode('italic', children));
          i += italicMatch[0].length;
          continue;
        }

        // 删除线 ~~text~~
        const strikeMatch = str.slice(i).match(/^~~(.+?)~~/);
        if (strikeMatch) {
          const children = parse(strikeMatch[1]);
          result.push(this.createElementNode('strikethrough', children));
          i += strikeMatch[0].length;
          continue;
        }

        // 普通字符
        if (result.length > 0 && result[result.length - 1].type === 'text') {
          (result[result.length - 1] as TextNode).text += str[i];
        } else {
          result.push(this.createTextNode(str[i]));
        }
        i++;
      }

      return result;
    };

    return parse(text);
  }

  /**
   * 创建文本节点
   */
  private createTextNode(text: string): TextNode {
    return {
      type: 'text',
      text,
    };
  }

  /**
   * 创建元素节点
   */
  private createElementNode(
    nodeType: string, 
    children: Node[] = [], 
    attrs: NodeAttributes = {}
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
 * Markdown 序列化器 - 将节点转换为 Markdown
 */
export class MarkdownSerializer {
  private options: MarkdownExportOptions;

  constructor(options: MarkdownExportOptions = {}) {
    this.options = {
      tableCellMinWidth: 3,
      listIndentSize: 2,
      codeFenceStyle: 'backtick',
      headingStyle: 'atx',
      gfm: true,
      ...options,
    };
  }

  /**
   * 将节点数组序列化为 Markdown
   */
  serialize(nodes: Node[]): string {
    return nodes.map(node => this.serializeNode(node, 0)).join('\n\n');
  }

  /**
   * 序列化单个节点
   */
  private serializeNode(node: Node, depth: number): string {
    if (node.type === 'text') {
      return this.escapeMarkdown((node as TextNode).text);
    }

    if (node.type === 'element') {
      const element = node as ElementNode;
      
      switch (element.nodeType) {
        case 'paragraph':
          return this.serializeChildren(element.children);
        
        case 'heading1':
          return this.serializeHeading(element.children, 1);
        case 'heading2':
          return this.serializeHeading(element.children, 2);
        case 'heading3':
          return this.serializeHeading(element.children, 3);
        case 'heading4':
          return this.serializeHeading(element.children, 4);
        case 'heading5':
          return this.serializeHeading(element.children, 5);
        case 'heading6':
          return this.serializeHeading(element.children, 6);
        
        case 'bold':
          return `**${this.serializeChildren(element.children)}**`;
        case 'italic':
          return `*${this.serializeChildren(element.children)}*`;
        case 'strikethrough':
          return `~~${this.serializeChildren(element.children)}~~`;
        case 'inlineCode':
          return `\`${this.serializeChildren(element.children)}\``;
        
        case 'codeBlock':
          return this.serializeCodeBlock(element);
        
        case 'blockquote':
          return this.serializeBlockquote(element.children);
        
        case 'unorderedList':
          return this.serializeList(element.children, 'unordered', depth);
        case 'orderedList':
          return this.serializeList(element.children, 'ordered', depth);
        
        case 'listItem':
          return this.serializeChildren(element.children);
        
        case 'link':
          return this.serializeLink(element);
        case 'image':
          return this.serializeImage(element);
        
        case 'table':
          return this.serializeTable(element);
        
        case 'horizontalRule':
          return '---';
        
        case 'hardBreak':
          return '  \n';
        
        case 'lineBreak':
          return '\n';
        
        default:
          return this.serializeChildren(element.children);
      }
    }

    return '';
  }

  /**
   * 序列化子节点
   */
  private serializeChildren(children: Node[]): string {
    return children.map(child => this.serializeNode(child, 0)).join('');
  }

  /**
   * 序列化标题
   */
  private serializeHeading(children: Node[], level: number): string {
    const content = this.serializeChildren(children);
    
    if (this.options.headingStyle === 'setext' && level <= 2) {
      const marker = level === 1 ? '=' : '-';
      return `${content}\n${marker.repeat(content.length)}`;
    }
    
    return `${'#'.repeat(level)} ${content}`;
  }

  /**
   * 序列化代码块
   */
  private serializeCodeBlock(element: ElementNode): string {
    const language = (element.attrs?.language as string) || '';
    const content = this.serializeChildren(element.children);
    const fence = this.options.codeFenceStyle === 'tilde' ? '~~~' : '```';
    
    return `${fence}${language}\n${content}\n${fence}`;
  }

  /**
   * 序列化引用块
   */
  private serializeBlockquote(children: Node[]): string {
    const content = this.serializeNodesWithLineBreaks(children, 0);
    return content
      .split('\n')
      .map(line => `> ${line}`)
      .join('\n');
  }

  /**
   * 序列化列表
   */
  private serializeList(children: Node[], type: 'ordered' | 'unordered', depth: number): string {
    const indent = ' '.repeat(depth * this.options.listIndentSize);
    
    return children.map((child, index) => {
      const itemContent = this.serializeNode(child, depth + 1);
      const marker = type === 'ordered' ? `${index + 1}.` : '-';
      
      // 处理多行内容
      const lines = itemContent.split('\n');
      const firstLine = `${indent}${marker} ${lines[0]}`;
      const restLines = lines.slice(1).map(line => 
        line ? `${indent}  ${line}` : ''
      );
      
      return [firstLine, ...restLines].join('\n');
    }).join('\n');
  }

  /**
   * 序列化链接
   */
  private serializeLink(element: ElementNode): string {
    const href = (element.attrs?.href as string) || '';
    const title = (element.attrs?.title as string) || '';
    const content = this.serializeChildren(element.children);
    
    if (title) {
      return `[${content}](${href} "${title}")`;
    }
    return `[${content}](${href})`;
  }

  /**
   * 序列化图片
   */
  private serializeImage(element: ElementNode): string {
    const src = (element.attrs?.src as string) || '';
    const alt = (element.attrs?.alt as string) || '';
    const title = (element.attrs?.title as string) || '';
    
    if (title) {
      return `![${alt}](${src} "${title}")`;
    }
    return `![${alt}](${src})`;
  }

  /**
   * 序列化表格
   */
  private serializeTable(element: ElementNode): string {
    const rows = element.children;
    if (rows.length === 0) return '';

    // 提取表头
    const headerRow = rows[0];
    if (headerRow.type !== 'element' || headerRow.nodeType !== 'tableHeaderRow') {
      return '';
    }

    const headers = headerRow.children
      .filter(c => c.type === 'element' && c.nodeType === 'tableHeader')
      .map(c => this.serializeChildren((c as ElementNode).children));

    const dataRows = rows.slice(1)
      .filter(r => r.type === 'element' && r.nodeType === 'tableRow')
      .map(r => 
        (r as ElementNode).children
          .filter(c => c.type === 'element' && c.nodeType === 'tableCell')
          .map(c => this.serializeChildren((c as ElementNode).children))
      );

    // 计算列宽
    const colCount = headers.length;
    const colWidths = headers.map((h, i) => {
      const dataWidths = dataRows.map(r => (r[i] || '').length);
      return Math.max(
        h.length,
        ...dataWidths,
        this.options.tableCellMinWidth
      );
    });

    // 构建表格
    const headerLine = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |';
    const separatorLine = '|' + colWidths.map(w => ' ' + '-'.repeat(w) + ' ').join('|') + '|';
    const dataLines = dataRows.map(row => 
      '| ' + row.map((cell, i) => cell.padEnd(colWidths[i])).join(' | ') + ' |'
    );

    return [headerLine, separatorLine, ...dataLines].join('\n');
  }

  /**
   * 序列化带换行的节点
   */
  private serializeNodesWithLineBreaks(nodes: Node[], depth: number): string {
    return nodes.map(node => this.serializeNode(node, depth)).join('\n\n');
  }

  /**
   * 转义 Markdown 特殊字符
   */
  private escapeMarkdown(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/</g, '\\<')
      .replace(/>/g, '\\>');
  }
}

/**
 * 将 Markdown 解析为节点数组
 */
export function parseMarkdown(markdown: string, options?: MarkdownImportOptions): Node[] {
  const parser = new MarkdownParser(options);
  return parser.parse(markdown);
}

/**
 * 将节点数组序列化为 Markdown
 */
export function serializeMarkdown(nodes: Node[], options?: MarkdownExportOptions): string {
  const serializer = new MarkdownSerializer(options);
  return serializer.serialize(nodes);
}

/**
   * 检查字符串是否为有效的 Markdown
   */
export function isValidMarkdown(content: string): boolean {
  // 基本的 Markdown 语法检查
  const markdownPatterns = [
    /^#{1,6}\s/m,           // 标题
    /\*\*|__/m,             // 粗体
    /\*|_/m,                // 斜体
    /```[\s\S]*?```/m,      // 代码块
    /`[^`]+`/m,             // 行内代码
    /\[.*?\]\(.*?\)/m,      // 链接
    /^\s*[-*+]\s/m,         // 无序列表
    /^\s*\d+\.\s/m,         // 有序列表
    /^\|.*\|$/m,            // 表格
    />\s/m,                 // 引用
  ];

  return markdownPatterns.some(pattern => pattern.test(content));
}

/**
 * 提取 Markdown 中的代码块语言
 */
export function extractCodeLanguage(markdown: string): string | null {
  const match = markdown.match(/^```(\w+)/m);
  return match ? match[1] : null;
}
