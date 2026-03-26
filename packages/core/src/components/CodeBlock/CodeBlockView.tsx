/**
 * WheelChair Editor - Code Block View Component
 * 
 * 代码块视图组件，包含语法高亮、行号和复制功能
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../extensions/nodes/CodeBlock';
import { LanguageSelector } from './LanguageSelector';
import './code-block.css';

// 动态导入 highlight.js
let hljs: import('highlight.js').HLJSApi | null = null;

// 动态导入语言
const importLanguage = async (lang: string) => {
  if (!hljs) return;
  
  try {
    switch (lang) {
      case 'javascript':
      case 'js':
        await import('highlight.js/lib/languages/javascript');
        break;
      case 'typescript':
      case 'ts':
        await import('highlight.js/lib/languages/typescript');
        break;
      case 'python':
      case 'py':
        await import('highlight.js/lib/languages/python');
        break;
      case 'html':
        await import('highlight.js/lib/languages/xml');
        break;
      case 'css':
        await import('highlight.js/lib/languages/css');
        break;
      case 'json':
        await import('highlight.js/lib/languages/json');
        break;
      case 'markdown':
      case 'md':
        await import('highlight.js/lib/languages/markdown');
        break;
      case 'sql':
        await import('highlight.js/lib/languages/sql');
        break;
      case 'bash':
      case 'sh':
      case 'shell':
        await import('highlight.js/lib/languages/bash');
        break;
    }
  } catch (e) {
    console.warn(`Failed to load language: ${lang}`, e);
  }
};

export const CodeBlockView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  editor,
  selected,
}) => {
  const { language, showLineNumbers } = node.attrs;
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [_isHighlighting, setIsHighlighting] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  // 获取纯文本内容
  const getTextContent = useCallback(() => {
    return node.textContent || '';
  }, [node.textContent]);

  // 动态加载 highlight.js
  useEffect(() => {
    const loadHighlight = async () => {
      if (!hljs) {
        const mod = await import('highlight.js');
        hljs = mod.default || mod;
        
        // 注册常用语言
        if (language) {
          await importLanguage(language);
        }
      }
    };
    
    loadHighlight();
  }, []);

  // 语法高亮
  useEffect(() => {
    const highlight = async () => {
      if (!hljs || !language) {
        setHighlightedCode('');
        return;
      }

      setIsHighlighting(true);
      
      try {
        await importLanguage(language);
        
        const code = getTextContent();
        if (code) {
          const result = hljs.highlight(code, { language: language || 'plain' });
          setHighlightedCode(result.value);
        } else {
          setHighlightedCode('');
        }
      } catch (e) {
        // 如果语言不支持，显示原始文本
        setHighlightedCode('');
      }
      
      setIsHighlighting(false);
    };

    highlight();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, node.textContent]);

  // 处理语言变更
  const handleLanguageChange = useCallback((newLanguage: SupportedLanguage | null) => {
    updateAttributes({ language: newLanguage || 'plain' });
  }, [updateAttributes]);

  // 处理复制
  const handleCopy = useCallback(async () => {
    const code = getTextContent();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [getTextContent]);

  // 切换行号显示
  const toggleLineNumbers = useCallback(() => {
    updateAttributes({ showLineNumbers: !showLineNumbers });
  }, [showLineNumbers, updateAttributes]);

  // 生成行号
  const lineCount = getTextContent().split('\n').length;
  const lineNumbers = showLineNumbers 
    ? Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1)
    : [];

  // 获取当前语言标签
  const currentLanguageLabel = language 
    ? SUPPORTED_LANGUAGES.find(l => l.value === language)?.label || language
    : 'Plain Text';

  return (
    <NodeViewWrapper className="code-block-wrapper">
      {/* 工具栏 */}
      <div className="code-block-toolbar">
        <div className="code-block-toolbar-left">
          <LanguageSelector 
            value={language as SupportedLanguage}
            onChange={handleLanguageChange}
          />
          <span className="code-block-language-label">{currentLanguageLabel}</span>
        </div>
        <div className="code-block-toolbar-right">
          <button
            className={`code-block-btn ${showLineNumbers ? 'is-active' : ''}`}
            onClick={toggleLineNumbers}
            title={showLineNumbers ? '隐藏行号' : '显示行号'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
              <path d="M9 7v10M15 7v10" />
            </svg>
          </button>
          <button
            className={`code-block-btn copy-btn ${copied ? 'is-copied' : ''}`}
            onClick={handleCopy}
            title={copied ? '已复制!' : '复制代码'}
          >
            {copied ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
        </div>
      </div>

      {/* 代码内容 */}
      <div className={`code-block-content ${selected ? 'is-selected' : ''}`}>
        {showLineNumbers && (
          <div className="code-block-line-numbers" aria-hidden="true">
            {lineNumbers.map(num => (
              <div key={num} className="code-block-line-number">{num}</div>
            ))}
          </div>
        )}
        <div className="code-block-code">
          <pre>
            <code
              ref={codeRef}
              className={language ? `language-${language}` : ''}
              dangerouslySetInnerHTML={
                highlightedCode && !editor.isEditable
                  ? { __html: highlightedCode }
                  : undefined
              }
            >
              {(!highlightedCode || editor.isEditable) && <NodeViewContent as="span" />}
            </code>
          </pre>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="code-block-footer">
        <span className="code-block-stats">
          {lineCount} 行
        </span>
      </div>
    </NodeViewWrapper>
  );
};

export default CodeBlockView;
