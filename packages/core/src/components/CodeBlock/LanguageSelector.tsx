/**
 * WheelChair Editor - Language Selector Component
 * 
 * 代码块语言选择器组件
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../../extensions/nodes/CodeBlock';

export interface LanguageSelectorProps {
  value: SupportedLanguage | null | undefined;
  onChange: (language: SupportedLanguage | null) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // 打开时聚焦搜索框
      setTimeout(() => inputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 过滤语言列表
  const filteredLanguages = searchTerm
    ? SUPPORTED_LANGUAGES.filter(
        lang =>
          lang.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lang.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : SUPPORTED_LANGUAGES;

  // 处理选择
  const handleSelect = useCallback((langValue: SupportedLanguage | null) => {
    onChange(langValue);
    setIsOpen(false);
    setSearchTerm('');
  }, [onChange]);

  // 获取当前选中语言的标签
  const currentLabel = value
    ? SUPPORTED_LANGUAGES.find(l => l.value === value)?.label || value
    : '自动检测';

  // 键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  }, []);

  return (
    <div ref={containerRef} className="language-selector">
      <button
        className="language-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="选择编程语言"
      >
        <span className="language-selector-value">{currentLabel}</span>
        <svg 
          className={`language-selector-arrow ${isOpen ? 'is-open' : ''}`}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="language-selector-dropdown">
          <div className="language-selector-search">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索语言..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="language-selector-input"
            />
            {searchTerm && (
              <button
                className="clear-btn"
                onClick={() => setSearchTerm('')}
                title="清除搜索"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="language-selector-list">
            <button
              className={`language-option ${!value ? 'is-selected' : ''}`}
              onClick={() => handleSelect(null)}
            >
              <span className="language-option-label">自动检测</span>
              {!value && (
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>

            <div className="language-divider" />

            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.value}
                  className={`language-option ${value === lang.value ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(lang.value)}
                >
                  <span className="language-option-icon">{lang.icon}</span>
                  <span className="language-option-label">{lang.label}</span>
                  {value === lang.value && (
                    <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="language-empty">未找到匹配的语言</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
