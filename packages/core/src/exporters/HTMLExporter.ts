/**
 * HTML Exporter
 * HTML 格式导出器
 */

import type { Node } from '../model/node';
import { ExportFormat } from '../utils/importExport';
import type { ExportOptions } from '../utils/importExport';
import { HTMLSerializer } from '../utils/html';

export interface HTMLExportOptions extends ExportOptions {
  /** 是否包含完整 HTML 文档 */
  fullDocument?: boolean;
  /** 文档标题 */
  title?: string;
  /** 自定义 CSS */
  css?: string;
  /** 是否包含语法高亮 */
  syntaxHighlight?: boolean;
  /** 语法高亮主题 */
  highlightTheme?: string;
  /** 语言代码 */
  lang?: string;
  /** 是否压缩输出 */
  minify?: boolean;
  /** 图片处理函数 */
  imageHandler?: (src: string) => string;
}

export class HTMLExporter {
  readonly format = ExportFormat.HTML;
  readonly name = 'HTML';
  readonly extensions = ['html', 'htm'];
  readonly mimeType = 'text/html';

  private options: HTMLExportOptions;

  constructor(options: HTMLExportOptions = {}) {
    this.options = {
      fullDocument: true,
      syntaxHighlight: true,
      highlightTheme: 'github',
      lang: 'zh-CN',
      minify: false,
      ...options,
    };
  }

  /**
   * 导出节点为 HTML
   */
  export(nodes: Node[], options?: HTMLExportOptions): string {
    const mergedOptions = { ...this.options, ...options };
    
    const serializer = new HTMLSerializer({
      inlineStyles: mergedOptions.inlineStyles,
      fullDocument: mergedOptions.fullDocument,
      title: mergedOptions.title,
      css: mergedOptions.css || this.getDefaultCSS(mergedOptions),
      semanticTags: true,
      imageHandler: mergedOptions.imageHandler,
    });

    let html = serializer.serialize(nodes);

    // 添加语法高亮
    if (mergedOptions.syntaxHighlight) {
      html = this.addSyntaxHighlighting(html, mergedOptions.highlightTheme);
    }

    // 压缩
    if (mergedOptions.minify) {
      html = this.minify(html);
    }

    return html;
  }

  /**
   * 获取默认 CSS
   */
  private getDefaultCSS(options: HTMLExportOptions): string {
    const baseCSS = `/* WheelChair Editor Styles */
*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: #24292e;
  background: #fff;
  margin: 0;
  padding: 2rem;
}

.wheelchair-content {
  max-width: 800px;
  margin: 0 auto;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 600;
  line-height: 1.25;
  color: #1a1a2e;
}

h1 { font-size: 2em; border-bottom: 2px solid #eaecef; padding-bottom: 0.3em; }
h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }
h5 { font-size: 0.875em; }
h6 { font-size: 0.85em; color: #6a737d; }

p { margin: 0 0 1em; }

a {
  color: #0366d6;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
a:hover { border-bottom-color: #0366d6; }

code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 85%;
  background: rgba(27, 31, 35, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

pre {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  margin: 0 0 1em;
}

pre code {
  background: none;
  padding: 0;
  font-size: 100%;
}

blockquote {
  margin: 0 0 1em;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}

ul, ol {
  margin: 0 0 1em;
  padding-left: 2em;
}

li + li { margin-top: 0.25em; }
li > p { margin-bottom: 0.5em; }

table {
  border-collapse: collapse;
  margin: 0 0 1em;
  width: 100%;
  overflow: auto;
  display: block;
}

th, td {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

th {
  font-weight: 600;
  background: #f6f8fa;
}

tr:nth-child(2n) { background: #f6f8fa; }

img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em 0;
}

hr {
  height: 0.25em;
  padding: 0;
  margin: 1.5em 0;
  background: #e1e4e8;
  border: 0;
}

/* Print Styles */
@media print {
  body { padding: 0; }
  pre { white-space: pre-wrap; }
  a[href]::after { content: " (" attr(href) ")"; }
}`;

    if (options.syntaxHighlight) {
      return baseCSS + '\n' + this.getHighlightCSS(options.highlightTheme);
    }

    return baseCSS;
  }

  /**
   * 获取语法高亮 CSS
   */
  private getHighlightCSS(theme: string = 'github'): string {
    const themes: Record<string, string> = {
      github: `/* GitHub Syntax Highlighting */
.hljs { display: block; overflow-x: auto; padding: 0.5em; color: #24292e; background: #f6f8fa; }
.hljs-comment, .hljs-quote { color: #6a737d; font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-subst { color: #d73a49; }
.hljs-number, .hljs-literal, .hljs-variable, .hljs-template-variable { color: #005cc5; }
.hljs-string, .hljs-doctag { color: #032f62; }
.hljs-title, .hljs-section, .hljs-selector-id { color: #6f42c1; }
.hljs-type, .hljs-class .hljs-title { color: #22863a; }
.hljs-tag, .hljs-name, .hljs-attribute { color: #22863a; }
.hljs-regexp, .hljs-link { color: #032f62; }
.hljs-symbol, .hljs-bullet { color: #e36209; }
.hljs-built_in, .hljs-builtin-name { color: #6f42c1; }
.hljs-meta { color: #6a737d; }
.hljs-deletion { background: #ffeef0; }
.hljs-addition { background: #f0fff4; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }`,
      
      vs: `/* Visual Studio Theme */
.hljs { display: block; overflow-x: auto; padding: 0.5em; background: white; color: black; }
.hljs-comment, .hljs-quote { color: #008000; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #0000ff; }
.hljs-string, .hljs-doctag { color: #a31515; }
.hljs-title, .hljs-section, .hljs-selector-id { color: #2b91af; }
.hljs-type, .hljs-class .hljs-title { color: #2b91af; }
.hljs-tag, .hljs-name { color: #0000ff; }
.hljs-attr { color: #ff0000; }`,
    };

    return themes[theme] || themes.github;
  }

  /**
   * 添加语法高亮
   */
  private addSyntaxHighlighting(html: string, theme: string): string {
    // 简单的高亮处理 - 实际项目中可以使用 highlight.js 或 prism.js
    return html.replace(
      /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g,
      (match, lang, code) => {
        const decodedCode = this.unescapeHtml(code);
        const highlighted = lang 
          ? `<pre><code class="hljs language-${lang}">${this.escapeHtml(decodedCode)}</code></pre>`
          : `<pre><code class="hljs">${this.escapeHtml(decodedCode)}</code></pre>`;
        return highlighted;
      }
    );
  }

  /**
   * 压缩 HTML
   */
  private minify(html: string): string {
    return html
      .replace(/>\s+</g, '><')
      .replace(/\n\s*/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * HTML 反转义
   */
  private unescapeHtml(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  /**
   * 导出为 Blob
   */
  exportAsBlob(nodes: Node[], options?: HTMLExportOptions): Blob {
    const content = this.export(nodes, options);
    return new Blob([content], { type: this.mimeType });
  }

  /**
   * 获取默认文件名
   */
  getDefaultFilename(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `document-${timestamp}.html`;
  }
}

// 便捷函数
export function exportToHTML(
  nodes: Node[],
  options?: HTMLExportOptions
): { content: string; filename: string; mimeType: string } {
  const exporter = new HTMLExporter(options);
  return {
    content: exporter.export(nodes, options),
    filename: options?.title
      ? `${options.title}.html`
      : exporter.getDefaultFilename(),
    mimeType: exporter.mimeType,
  };
}

export default HTMLExporter;
