/**
 * WheelChair Editor - Markdown Preview Component
 * Markdown 预览组件 - 实时预览 Markdown 渲染效果（支持数学公式）
 */

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './MarkdownPreview.css';

// ============================================
// 类型定义
// ============================================

export interface MarkdownPreviewProps {
  /** Markdown 文本内容 */
  content: string;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 主题：light 或 dark */
  theme?: 'light' | 'dark';
  /** 是否启用数学公式渲染 */
  enableMath?: boolean;
}

// ============================================
// Markdown 解析器（轻量级，支持数学公式）
// ============================================

function parseMarkdown(md: string, enableMath: boolean = true): string {
  let html = md;
  
  // 1. 先处理代码块（避免公式干扰）
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const id = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre class="code-block${lang ? ` language-${lang}` : ''}"><code>${escapeHtml(code.trim())}</code></pre>`);
    return id;
  });
  
  // 2. 处理行内代码
  const inlineCodes: string[] = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const id = `__INLINE_CODE_${inlineCodes.length}__`;
    inlineCodes.push(`<code class="inline-code">${escapeHtml(code)}</code>`);
    return id;
  });
  
  // 3. 处理数学公式（在转义 HTML 之前）
  const mathBlocks: string[] = [];
  if (enableMath) {
    // 块级公式 $$...$$
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
      const id = `__MATH_BLOCK_${mathBlocks.length}__`;
      mathBlocks.push(renderKaTeX(latex.trim(), true));
      return id;
    });
    
    // 行内公式 $...$
    html = html.replace(/\$([^$\n]+)\$/g, (_, latex) => {
      const id = `__MATH_INLINE_${mathBlocks.length}__`;
      mathBlocks.push(renderKaTeX(latex.trim(), false));
      return id;
    });
  }
  
  // 4. 转义 HTML 特殊字符
  html = escapeHtmlExceptBlocks(html, [...codeBlocks, ...inlineCodes, ...mathBlocks]);
  
  // 5. 处理标题
  for (let i = 6; i >= 1; i--) {
    const regex = new RegExp(`^${'#'.repeat(i)}\\s+(.+)$`, 'gm');
    html = html.replace(regex, `<h${i}>$1</h${i}>`);
  }
  
  // 6. 处理粗体、斜体、删除线
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  
  // 7. 处理链接和图片
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');
  
  // 8. 处理列表
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (match.includes('<ul>')) return match;
    return `<ol>${match}</ol>`;
  });
  
  // 9. 处理引用块
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  
  // 10. 处理水平分割线
  html = html.replace(/^(---|___|\*\*\*)$/gm, '<hr />');
  
  // 11. 处理段落
  const paragraphs = html.split('\n\n');
  html = paragraphs
    .map(p => {
      p = p.trim();
      if (!p) return '';
      if (/^<(h[1-6]|ul|ol|pre|blockquote|hr|div)/.test(p)) return p;
      return `<p>${p}</p>`;
    })
    .filter(Boolean)
    .join('\n');
  
  // 12. 处理换行
  html = html.replace(/\n/g, '<br />');
  
  // 13. 恢复占位符
  codeBlocks.forEach((block, i) => {
    html = html.replace(`__CODE_BLOCK_${i}__`, block);
  });
  inlineCodes.forEach((code, i) => {
    html = html.replace(`__INLINE_CODE_${i}__`, code);
  });
  mathBlocks.forEach((math, i) => {
    html = html.replace(`__MATH_BLOCK_${i}__`, math);
    html = html.replace(`__MATH_INLINE_${i}__`, math);
  });
  
  return html;
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 转义 HTML 但不处理占位符
 */
function escapeHtmlExceptBlocks(text: string, blocks: string[]): string {
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    let foundBlock = false;
    
    for (let j = 0; j < blocks.length; j++) {
      const marker = `__CODE_BLOCK_${j}__`;
      const inlineMarker = `__INLINE_CODE_${j}__`;
      const mathBlockMarker = `__MATH_BLOCK_${j}__`;
      const mathInlineMarker = `__MATH_INLINE_${j}__`;
      
      if (text.substring(i).startsWith(marker) || 
          text.substring(i).startsWith(inlineMarker) ||
          text.substring(i).startsWith(mathBlockMarker) ||
          text.substring(i).startsWith(mathInlineMarker)) {
        result += text.substring(i, i + (text.substring(i).indexOf('__', 2) + 2));
        i += (text.substring(i).indexOf('__', 2) + 2);
        foundBlock = true;
        break;
      }
    }
    
    if (!foundBlock) {
      const char = text[i];
      if (char === '&') result += '&amp;';
      else if (char === '<') result += '&lt;';
      else if (char === '>') result += '&gt;';
      else result += char;
      i++;
    }
  }
  
  return result;
}

/**
 * 渲染 KaTeX 公式
 */
function renderKaTeX(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      strict: false,
    });
  } catch (e) {
    return `<span class="math-error">${displayMode ? '$$' : '$'}${latex}${displayMode ? '$$' : '$'}</span>`;
  }
}

// ============================================
// 组件
// ============================================

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  showLineNumbers = false,
  className = '',
  theme = 'light',
  enableMath = true,
}) => {
  const html = useMemo(() => {
    if (!content.trim()) {
      return '<p class="empty-placeholder">开始输入 Markdown...</p>';
    }
    return parseMarkdown(content, enableMath);
  }, [content, enableMath]);
  
  return (
    <div 
      className={`wch-markdown-preview wch-markdown-preview--${theme} ${className}`}
      data-show-line-numbers={showLineNumbers}
    >
      <div 
        className="wch-markdown-preview__content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default MarkdownPreview;
