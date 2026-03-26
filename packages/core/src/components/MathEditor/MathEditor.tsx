/**
 * WheelChair Editor - Math Editor Component
 * 数学公式编辑组件
 */

import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './MathEditor.css';

// ============================================
// 类型定义
// ============================================

export interface MathEditorProps {
  /** 初始 LaTeX 内容 */
  initialValue?: string;
  /** 公式类型 */
  type?: 'inlineMath' | 'blockMath';
  /** 确认回调 */
  onConfirm: (latex: string, type: 'inlineMath' | 'blockMath') => void;
  /** 取消回调 */
  onCancel: () => void;
  /** 删除回调（编辑模式） */
  onDelete?: () => void;
  /** 自定义类名 */
  className?: string;
}

// ============================================
// 常用公式模板
// ============================================
const COMMON_FORMULAS = [
  { label: '上标', latex: 'x^{2}', display: 'x²' },
  { label: '下标', latex: 'x_{i}', display: 'xᵢ' },
  { label: '分数', latex: '\\frac{a}{b}', display: 'a/b' },
  { label: '平方根', latex: '\\sqrt{x}', display: '√x' },
  { label: 'n次根', latex: '\\sqrt[n]{x}', display: 'ⁿ√x' },
  { label: '求和', latex: '\\sum_{i=1}^{n} x_i', display: 'Σ' },
  { label: '积分', latex: '\\int_{a}^{b} f(x) dx', display: '∫' },
  { label: '极限', latex: '\\lim_{x \\to \\infty}', display: 'lim' },
  { label: '希腊字母 α', latex: '\\alpha', display: 'α' },
  { label: '希腊字母 β', latex: '\\beta', display: 'β' },
  { label: '希腊字母 π', latex: '\\pi', display: 'π' },
  { label: '希腊字母 θ', latex: '\\theta', display: 'θ' },
  { label: '无穷大', latex: '\\infty', display: '∞' },
  { label: '不等于', latex: '\\neq', display: '≠' },
  { label: '约等于', latex: '\\approx', display: '≈' },
  { label: '大于等于', latex: '\\geq', display: '≥' },
  { label: '小于等于', latex: '\\leq', display: '≤' },
  { label: '箭头', latex: '\\rightarrow', display: '→' },
];

// ============================================
// 组件
// ============================================

export const MathEditor: React.FC<MathEditorProps> = ({
  initialValue = '',
  type = 'inlineMath',
  onConfirm,
  onCancel,
  onDelete,
  className = '',
}) => {
  const [latex, setLatex] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'edit' | 'templates'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 安全地渲染预览（使用 useEffect 避免在渲染中调用 setState）
  useEffect(() => {
    if (!latex.trim()) {
      setPreviewHtml('<span class="placeholder">输入 LaTeX 代码预览公式...</span>');
      setError(null);
      return;
    }
    
    try {
      const html = katex.renderToString(latex, {
        throwOnError: true,
        displayMode: type === 'blockMath',
        strict: false,
      });
      setPreviewHtml(html);
      setError(null);
    } catch (err: any) {
      setError(err.message || '渲染错误');
      setPreviewHtml(`<span class="error">${err.message || 'LaTeX 语法错误'}</span>`);
    }
  }, [latex, type]);

  // 插入模板
  const insertTemplate = (template: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const newValue = latex.slice(0, start) + template + latex.slice(end);
    setLatex(newValue);
    
    // 恢复焦点并设置光标位置
    setTimeout(() => {
      textarea.focus();
      const newPos = start + template.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // 处理确认
  const handleConfirm = () => {
    if (error) return;
    onConfirm(latex, type);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      handleConfirm();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  // 阻止事件冒泡
  const stopPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`wch-math-editor ${className}`} 
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      {/* 头部 */}
      <div className="wch-math-editor__header">
        <h3>{initialValue ? '编辑公式' : '插入公式'}</h3>
        <button className="close-btn" onClick={onCancel} title="关闭 (Esc)">
          ×
        </button>
      </div>

      {/* 标签切换 */}
      <div className="wch-math-editor__tabs">
        <button
          className={activeTab === 'edit' ? 'active' : ''}
          onClick={() => setActiveTab('edit')}
        >
          编辑
        </button>
        <button
          className={activeTab === 'templates' ? 'active' : ''}
          onClick={() => setActiveTab('templates')}
        >
          常用符号
        </button>
      </div>

      {/* 编辑区域 */}
      {activeTab === 'edit' ? (
        <div className="wch-math-editor__content">
          <textarea
            ref={textareaRef}
            className="math-input"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入 LaTeX 公式，例如: E = mc^2"
            rows={4}
            autoFocus
          />
          
          {/* 预览区域 */}
          <div className="preview-section">
            <span className="preview-label">预览</span>
            <div
              className={`preview-content ${type === 'blockMath' ? 'block' : 'inline'}`}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>
      ) : (
        /* 模板区域 */
        <div className="wch-math-editor__templates">
          {COMMON_FORMULAS.map((item, index) => (
            <button
              key={index}
              className="template-item"
              onClick={() => insertTemplate(item.latex)}
              title={item.latex}
            >
              <span className="template-display">{item.display}</span>
              <span className="template-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 底部操作 */}
      <div className="wch-math-editor__footer">
        <div className="actions">
          {onDelete && (
            <button className="btn btn-danger" onClick={onDelete}>
              删除
            </button>
          )}
          <button className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!!error}
          >
            确认
          </button>
        </div>
      </div>

      {/* 快捷键提示 */}
      <div className="wch-math-editor__shortcuts">
        <span>快捷键: Ctrl+Enter 确认</span>
        <span>Esc 取消</span>
      </div>
    </div>
  );
};

export default MathEditor;
