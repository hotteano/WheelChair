import React, { forwardRef } from 'react';
import { cn } from '../../utils';

export interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮图标 */
  icon?: React.ReactNode;
  /** 按钮文字 */
  label?: string;
  /** 纯图标模式（无文字） */
  iconOnly?: boolean;
  /** 是否激活 */
  active?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 快捷键提示，如 "Ctrl+B" */
  shortcut?: string;
  /** Tooltip 提示文本 */
  tooltip?: string;
  /** 按钮变体 */
  variant?: 'default' | 'ghost' | 'primary';
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示下拉箭头 */
  hasDropdown?: boolean;
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (
    {
      icon,
      label,
      iconOnly = false,
      active = false,
      disabled = false,
      shortcut,
      tooltip,
      variant = 'ghost',
      size = 'md',
      hasDropdown = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
    
    const variantStyles = {
      default: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    };

    const sizeStyles = {
      sm: iconOnly ? 'h-7 w-7' : 'h-7 px-2 text-xs',
      md: iconOnly ? 'h-8 w-8' : 'h-8 px-3 text-sm',
      lg: iconOnly ? 'h-10 w-10' : 'h-10 px-4 text-base',
    };

    const activeStyles = active
      ? variant === 'primary'
        ? 'bg-blue-700 ring-2 ring-blue-300'
        : 'bg-gray-200 text-gray-900'
      : '';

    const disabledStyles = disabled
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '';

    // 构建 tooltip 内容
    const tooltipContent = tooltip || label;
    const fullTooltip = shortcut ? `${tooltipContent} (${shortcut})` : tooltipContent;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          iconOnly ? sizeStyles[size] : sizeStyles[size],
          activeStyles,
          disabledStyles,
          className
        )}
        title={fullTooltip}
        aria-pressed={active}
        aria-disabled={disabled}
        {...props}
      >
        {icon && <span className={cn('flex-shrink-0', !iconOnly && label && 'mr-1.5')}>{icon}</span>}
        {!iconOnly && label && <span className="truncate">{label}</span>}
        {hasDropdown && (
          <svg
            className="ml-1 h-3 w-3 flex-shrink-0 opacity-60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

ToolbarButton.displayName = 'ToolbarButton';

export default ToolbarButton;
