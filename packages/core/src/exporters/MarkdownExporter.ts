/**
 * Markdown Exporter
 * Markdown 格式导出器
 */

import type { Node } from '../model/node';
import type { ExportFormat, ExportOptions } from '../utils/importExport';
import { MarkdownSerializer, serializeMarkdown } from '../utils/markdown';

export interface MarkdownExportOptions extends ExportOptions {
  /** 是否包含 YAML frontmatter */
  frontmatter?: boolean;
  /** 文档元数据 */
  metadata?: Record<string, string | number | boolean>;
  /** 代码块围栏样式 */
  codeFenceStyle?: 'backtick' | 'tilde';
  /** 标题样式 */
  headingStyle?: 'atx' | 'setext';
  /** 表格单元格最小宽度 */
  tableCellMinWidth?: number;
  /** 列表缩进空格数 */
  listIndentSize?: number;
  /** 是否使用紧凑列表 */
  tightList?: boolean;
}

export class MarkdownExporter {
  readonly format = ExportFormat.MARKDOWN;
  readonly name = 'Markdown';
  readonly extensions = ['md', 'markdown', 'mdown', 'mkd'];
  readonly mimeType = 'text/markdown';

  private options: MarkdownExportOptions;

  constructor(options: MarkdownExportOptions = {}) {
    this.options = {
      codeFenceStyle: 'backtick',
      headingStyle: 'atx',
      tableCellMinWidth: 3,
      listIndentSize: 2,
      tightList: false,
      gfm: true,
      ...options,
    };
  }

  /**
   * 导出节点为 Markdown
   */
  export(nodes: Node[], options?: MarkdownExportOptions): string {
    const mergedOptions = { ...this.options, ...options };
    
    let content = '';
    
    // 添加 YAML frontmatter
    if (mergedOptions.frontmatter && mergedOptions.metadata) {
      content += this.generateFrontmatter(mergedOptions.metadata);
    }
    
    // 序列化节点
    const serializer = new MarkdownSerializer({
      codeFenceStyle: mergedOptions.codeFenceStyle,
      headingStyle: mergedOptions.headingStyle,
      tableCellMinWidth: mergedOptions.tableCellMinWidth,
      listIndentSize: mergedOptions.listIndentSize,
      gfm: mergedOptions.gfm,
    });
    
    content += serializer.serialize(nodes);
    
    // 后处理
    content = this.postProcess(content, mergedOptions);
    
    return content;
  }

  /**
   * 生成 YAML frontmatter
   */
  private generateFrontmatter(metadata: Record<string, string | number | boolean>): string {
    const lines = ['---'];
    
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string' && (value.includes('\n') || value.includes('"'))) {
        // 多行字符串使用 | 或 >
        lines.push(`${key}: |`);
        lines.push(...value.split('\n').map(line => `  ${line}`));
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        lines.push(`${key}: ${value}`);
      } else {
        lines.push(`${key}: "${value}"`);
      }
    }
    
    lines.push('---', '');
    
    return lines.join('\n');
  }

  /**
   * 后处理 Markdown
   */
  private postProcess(content: string, options: MarkdownExportOptions): string {
    let result = content;
    
    // 处理紧凑列表
    if (options.tightList) {
      result = this.makeTightLists(result);
    }
    
    // 规范化换行
    result = result.replace(/\n{3,}/g, '\n\n');
    
    // 移除末尾的空白
    result = result.trimEnd();
    
    return result;
  }

  /**
   * 转换为紧凑列表
   */
  private makeTightLists(content: string): string {
    // 移除列表项之间的空行
    return content.replace(
      /(^\s*[-*+]\s.*$)\n+(?=^\s*[-*+]\s)/gm,
      '$1\n'
    ).replace(
      /(^\s*\d+[.)]\s.*$)\n+(?=^\s*\d+[.)]\s)/gm,
      '$1\n'
    );
  }

  /**
   * 导出为文件 Blob
   */
  exportAsBlob(nodes: Node[], options?: MarkdownExportOptions): Blob {
    const content = this.export(nodes, options);
    return new Blob([content], { type: this.mimeType });
  }

  /**
   * 获取默认文件名
   */
  getDefaultFilename(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `document-${timestamp}.md`;
  }
}

// 便捷函数
export function exportToMarkdown(
  nodes: Node[], 
  options?: MarkdownExportOptions
): { content: string; filename: string; mimeType: string } {
  const exporter = new MarkdownExporter(options);
  return {
    content: exporter.export(nodes, options),
    filename: options?.title 
      ? `${options.title}.md` 
      : exporter.getDefaultFilename(),
    mimeType: exporter.mimeType,
  };
}

export default MarkdownExporter;
