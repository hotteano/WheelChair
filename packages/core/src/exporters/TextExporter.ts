/**
 * Text Exporter
 * 纯文本格式导出器
 */

import type { Node, TextNode, ElementNode } from '../model/node';
import type { ExportFormat, ExportOptions } from '../utils/importExport';

export interface TextExportOptions extends ExportOptions {
  /** 行宽限制 */
  lineWidth?: number;
  /** 是否保留空行 */
  preserveEmptyLines?: boolean;
  /** 列表标记样式 */
  listMarker?: 'dash' | 'bullet' | 'number';
  /** 缩进字符串 */
  indentString?: string;
  /** 是否在段落间添加空行 */
  paragraphSpacing?: boolean;
  /** 编码 */
  encoding?: 'utf-8' | 'ascii';
}

export class TextExporter {
  readonly format = ExportFormat.TEXT;
  readonly name = 'Plain Text';
  readonly extensions = ['txt'];
  readonly mimeType = 'text/plain';

  private options: TextExportOptions;

  constructor(options: TextExportOptions = {}) {
    this.options = {
      lineWidth: 80,
      preserveEmptyLines: true,
      listMarker: 'dash',
      indentString: '  ',
      paragraphSpacing: true,
      encoding: 'utf-8',
      ...options,
    };
  }

  /**
   * 导出节点为纯文本
   */
  export(nodes: Node[], options?: TextExportOptions): string {
    const mergedOptions = { ...this.options, ...options };
    
    const lines: string[] = [];
    
    for (const node of nodes) {
      const text = this.serializeNode(node, 0, mergedOptions);
      if (text || mergedOptions.preserveEmptyLines) {
        lines.push(text);
      }
    }

    let result = lines.join(mergedOptions.paragraphSpacing ? '\n\n' : '\n');
    
    // 处理行宽
    if (mergedOptions.lineWidth && mergedOptions.lineWidth > 0) {
      result = this.wrapLines(result, mergedOptions.lineWidth);
    }

    return result.trimEnd();
  }

  /**
   * 序列化节点
   */
  private serializeNode(node: Node, depth: number, options: TextExportOptions): string {
    if (node.type === 'text') {
      return (node as TextNode).text;
    }

    if (node.type === 'element') {
      const element = node as ElementNode;
      const indent = options.indentString!.repeat(depth);
      
      switch (element.nodeType) {
        case 'paragraph':
          return indent + this.serializeChildren(element.children, depth, options);
        
        case 'heading1':
          return this.serializeHeading(element.children, '=', options);
        case 'heading2':
          return this.serializeHeading(element.children, '-', options);
        case 'heading3':
          return indent + '### ' + this.serializeChildren(element.children, depth, options);
        case 'heading4':
          return indent + '#### ' + this.serializeChildren(element.children, depth, options);
        case 'heading5':
          return indent + '##### ' + this.serializeChildren(element.children, depth, options);
        case 'heading6':
          return indent + '###### ' + this.serializeChildren(element.children, depth, options);
        
        case 'bold':
        case 'italic':
        case 'underline':
        case 'strikethrough':
        case 'inlineCode':
          return this.serializeChildren(element.children, depth, options);
        
        case 'codeBlock':
          return this.serializeCodeBlock(element, options);
        
        case 'blockquote':
          return this.serializeBlockquote(element.children, depth, options);
        
        case 'unorderedList':
        case 'orderedList':
          return this.serializeList(element, depth, options);
        
        case 'listItem':
          return this.serializeChildren(element.children, depth, options);
        
        case 'link':
          const text = this.serializeChildren(element.children, depth, options);
          const href = element.attrs?.href as string || '';
          return `${text} (${href})`;
        
        case 'image':
          const alt = element.attrs?.alt as string || '';
          const src = element.attrs?.src as string || '';
          return alt ? `[Image: ${alt}]` : `[Image: ${src}]`;
        
        case 'table':
          return this.serializeTable(element, options);
        
        case 'horizontalRule':
          return '-'.repeat(Math.min(40, options.lineWidth || 40));
        
        case 'lineBreak':
        case 'hardBreak':
          return '\n' + indent;
        
        default:
          return indent + this.serializeChildren(element.children, depth, options);
      }
    }

    return '';
  }

  /**
   * 序列化子节点
   */
  private serializeChildren(children: Node[], depth: number, options: TextExportOptions): string {
    return children
      .map(child => this.serializeNode(child, depth, options))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 序列化标题
   */
  private serializeHeading(
    children: Node[], 
    underlineChar: string, 
    options: TextExportOptions
  ): string {
    const text = this.serializeChildren(children, 0, options);
    const underline = underlineChar.repeat(text.length);
    return `${text}\n${underline}`;
  }

  /**
   * 序列化代码块
   */
  private serializeCodeBlock(element: ElementNode, options: TextExportOptions): string {
    const content = this.serializeChildren(element.children, 0, options);
    const language = element.attrs?.language as string;
    
    let result = '';
    if (language) {
      result += `[${language.toUpperCase()} CODE]\n`;
    }
    result += '```\n' + content + '\n```';
    
    return result;
  }

  /**
   * 序列化引用块
   */
  private serializeBlockquote(
    children: Node[], 
    depth: number, 
    options: TextExportOptions
  ): string {
    const content = children
      .map(child => this.serializeNode(child, depth, options))
      .join('\n\n');
    
    return content
      .split('\n')
      .map(line => '> ' + line)
      .join('\n');
  }

  /**
   * 序列化列表
   */
  private serializeList(
    element: ElementNode, 
    depth: number, 
    options: TextExportOptions
  ): string {
    const isOrdered = element.nodeType === 'orderedList';
    const items: string[] = [];
    let index = 1;

    const marker = isOrdered ? null : this.getListMarker(options.listMarker!);

    for (const child of element.children) {
      if (child.type === 'element' && child.nodeType === 'listItem') {
        const itemMarker = isOrdered ? `${index}.` : marker;
        const indent = options.indentString!.repeat(depth);
        const itemContent = this.serializeChildren(child.children, depth + 1, options);
        items.push(`${indent}${itemMarker} ${itemContent}`);
        index++;
      }
    }

    return items.join('\n');
  }

  /**
   * 获取列表标记
   */
  private getListMarker(style: 'dash' | 'bullet' | 'number'): string {
    switch (style) {
      case 'dash': return '-';
      case 'bullet': return '•';
      case 'number': return '1.';
      default: return '-';
    }
  }

  /**
   * 序列化表格
   */
  private serializeTable(element: ElementNode, options: TextExportOptions): string {
    const rows: string[][] = [];
    
    for (const child of element.children) {
      if (child.type === 'element') {
        const row: string[] = [];
        for (const cell of child.children) {
          row.push(this.serializeChildren(cell.children, 0, options));
        }
        if (row.length) rows.push(row);
      }
    }

    if (rows.length === 0) return '';

    // 计算列宽
    const colCount = Math.max(...rows.map(r => r.length));
    const colWidths: number[] = [];
    
    for (let col = 0; col < colCount; col++) {
      const maxWidth = Math.max(
        3, // 最小宽度
        ...rows.map(row => (row[col] || '').length)
      );
      colWidths.push(maxWidth);
    }

    // 格式化行
    const formatRow = (cells: string[]) => {
      return '| ' + cells.map((cell, i) => 
        (cell || '').padEnd(colWidths[i] || 3)
      ).join(' | ') + ' |';
    };

    const lines = rows.map(formatRow);
    
    // 添加分隔行（如果有多行）
    if (rows.length > 1) {
      const separator = '+-' + colWidths.map(w => '-'.repeat(w)).join('-+-') + '-+';
      lines.splice(1, 0, separator);
    }

    return lines.join('\n');
  }

  /**
   * 自动换行
   */
  private wrapLines(text: string, maxWidth: number): string {
    const lines = text.split('\n');
    const wrapped: string[] = [];

    for (const line of lines) {
      if (line.length <= maxWidth) {
        wrapped.push(line);
        continue;
      }

      let current = line;
      while (current.length > maxWidth) {
        // 在单词边界处断开
        let breakPoint = maxWidth;
        while (breakPoint > 0 && current[breakPoint] !== ' ') {
          breakPoint--;
        }
        if (breakPoint === 0) breakPoint = maxWidth;

        wrapped.push(current.slice(0, breakPoint));
        current = current.slice(breakPoint).trimStart();
      }
      if (current) wrapped.push(current);
    }

    return wrapped.join('\n');
  }

  /**
   * 导出为 Blob
   */
  exportAsBlob(nodes: Node[], options?: TextExportOptions): Blob {
    const content = this.export(nodes, options);
    return new Blob([content], { type: this.mimeType });
  }

  /**
   * 获取默认文件名
   */
  getDefaultFilename(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `document-${timestamp}.txt`;
  }
}

// 便捷函数
export function exportToText(
  nodes: Node[],
  options?: TextExportOptions
): { content: string; filename: string; mimeType: string } {
  const exporter = new TextExporter(options);
  return {
    content: exporter.export(nodes, options),
    filename: options?.title
      ? `${options.title}.txt`
      : exporter.getDefaultFilename(),
    mimeType: exporter.mimeType,
  };
}

export default TextExporter;
