/**
 * WheelChair Editor - SearchBox Component
 * 搜索框组件
 */

import React, { useCallback } from 'react';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = '搜索...',
  className = '',
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className={`wch-search-box ${className}`}>
      <span className="wch-search-box__icon">
        <SearchIcon />
      </span>
      <input
        type="text"
        className="wch-search-box__input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {value && (
        <button
          className="wch-search-box__clear"
          onClick={handleClear}
          title="清除"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

const SearchIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default SearchBox;
