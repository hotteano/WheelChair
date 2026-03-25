import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { ToolbarButton } from './ToolbarButton';

export interface DropdownOption {
  /** 选项值 */
  value: string;
  /** 显示标签 */
  label: string;
  /** 选项图标 */
  icon?: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 快捷键提示 */
  shortcut?: string;
  /** 描述文本 */
  description?: string;
}

export interface ToolbarDropdownProps {
  /** 当前选中值 */
  value?: string;
  /** 选项列表 */
  options: DropdownOption[];
  /** 触发按钮图标 */
  icon?: React.ReactNode;
  /** 触发按钮标签 */
  label?: string;
  /** 占位符文本 */
  placeholder?: string;
  /** 值改变回调 */
  onChange?: (value: string, option: DropdownOption) => void;
  /** 自定义类名 */
  className?: string;
  /** 下拉菜单类名 */
  dropdownClassName?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 对齐方式 */
  align?: 'left' | 'right' | 'center';
  /** 最大显示高度 */
  maxHeight?: number;
  /** 是否显示图标 */
  showIcons?: boolean;
}

export const ToolbarDropdown: React.FC<ToolbarDropdownProps> = ({
  value,
  options,
  icon,
  label,
  placeholder = '选择...',
  onChange,
  className,
  dropdownClassName,
  disabled = false,
  size = 'md',
  align = 'left',
  maxHeight = 280,
  showIcons = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取当前选中的选项
  const selectedOption = options.find((opt) => opt.value === value);

  // 计算显示文本
  const displayLabel = selectedOption?.label || label || placeholder;

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
          setHighlightedIndex(0);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && !options[highlightedIndex].disabled) {
            const option = options[highlightedIndex];
            onChange?.(option.value, option);
            setIsOpen(false);
          }
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    },
    [isOpen, highlightedIndex, options, onChange]
  );

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return;
    onChange?.(option.value, option);
    setIsOpen(false);
  };

  // 对齐样式
  const alignStyles = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block', className)}
      onKeyDown={handleKeyDown}
    >
      <ToolbarButton
        icon={icon || selectedOption?.icon}
        label={displayLabel}
        hasDropdown
        active={isOpen}
        disabled={disabled}
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'toolbar-dropdown-listbox' : undefined}
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          id="toolbar-dropdown-listbox"
          role="listbox"
          aria-activedescendant={
            highlightedIndex >= 0 ? `option-${options[highlightedIndex].value}` : undefined
          }
          className={cn(
            'absolute top-full mt-1 z-50 min-w-[160px] rounded-md shadow-lg',
            'bg-white border border-gray-200 py-1',
            'animate-in fade-in zoom-in-95 duration-100',
            alignStyles[align],
            dropdownClassName
          )}
          style={{ maxHeight, overflowY: 'auto' }}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`option-${option.value}`}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'flex items-center px-3 py-2 cursor-pointer text-sm',
                'transition-colors duration-150',
                option.value === value && 'bg-blue-50 text-blue-700',
                highlightedIndex === index && option.value !== value && 'bg-gray-100',
                option.disabled && 'opacity-50 cursor-not-allowed',
                !option.disabled && 'hover:bg-gray-100'
              )}
            >
              {showIcons && (
                <span className="w-5 h-5 mr-2 flex items-center justify-center flex-shrink-0">
                  {option.icon || (option.value === value ? '✓' : '')}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-gray-500 truncate">
                    {option.description}
                  </div>
                )}
              </div>
              {option.shortcut && (
                <span className="ml-2 text-xs text-gray-400 flex-shrink-0">
                  {option.shortcut}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ToolbarDropdown.displayName = 'ToolbarDropdown';

export default ToolbarDropdown;
