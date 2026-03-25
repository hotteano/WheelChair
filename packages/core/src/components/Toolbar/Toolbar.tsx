import React from 'react';
import { cn } from '../../utils/cn';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarDivider } from './ToolbarDivider';
import { ToolbarDropdown, DropdownOption } from './ToolbarDropdown';

/** 工具栏按钮配置 */
export interface ToolbarButtonConfig {
  type: 'button';
  id: string;
  icon?: React.ReactNode;
  label?: string;
  shortcut?: string;
  tooltip?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/** 工具栏下拉配置 */
export interface ToolbarDropdownConfig {
  type: 'dropdown';
  id: string;
  icon?: React.ReactNode;
  label?: string;
  value?: string;
  options: DropdownOption[];
  placeholder?: string;
  onChange?: (value: string, option: DropdownOption) => void;
}

/** 工具栏分隔线配置 */
export interface ToolbarDividerConfig {
  type: 'divider';
  id: string;
}

/** 工具栏分组配置 */
export interface ToolbarGroupConfig {
  type: 'group';
  id: string;
  items: (ToolbarButtonConfig | ToolbarDropdownConfig | ToolbarDividerConfig)[];
  title?: string;
}

export type ToolbarItem =
  | ToolbarButtonConfig
  | ToolbarDropdownConfig
  | ToolbarDividerConfig
  | ToolbarGroupConfig;

export interface ToolbarProps {
  /** 工具栏项目配置 */
  items?: ToolbarItem[];
  /** 子元素（用于自定义布局） */
  children?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 工具栏变体 */
  variant?: 'default' | 'floating' | 'minimal';
  /** 布局方向 */
  orientation?: 'horizontal' | 'vertical';
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否粘性定位 */
  sticky?: boolean;
  /** 是否响应式折叠 */
  responsive?: boolean;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 背景样式 */
  background?: 'white' | 'gray' | 'transparent';
}

// 预设的格式化按钮组
export const defaultFormatItems: ToolbarItem[] = [
  {
    type: 'dropdown',
    id: 'heading',
    label: '正文',
    options: [
      { value: 'paragraph', label: '正文' },
      { value: 'h1', label: '标题 1' },
      { value: 'h2', label: '标题 2' },
      { value: 'h3', label: '标题 3' },
      { value: 'h4', label: '标题 4' },
      { value: 'h5', label: '标题 5' },
      { value: 'h6', label: '标题 6' },
    ],
  },
  { type: 'divider', id: 'divider-1' },
  {
    type: 'button',
    id: 'bold',
    icon: <BoldIcon />,
    tooltip: '粗体',
    shortcut: 'Ctrl+B',
  },
  {
    type: 'button',
    id: 'italic',
    icon: <ItalicIcon />,
    tooltip: '斜体',
    shortcut: 'Ctrl+I',
  },
  {
    type: 'button',
    id: 'underline',
    icon: <UnderlineIcon />,
    tooltip: '下划线',
    shortcut: 'Ctrl+U',
  },
  {
    type: 'button',
    id: 'strikethrough',
    icon: <StrikethroughIcon />,
    tooltip: '删除线',
    shortcut: 'Ctrl+Shift+X',
  },
  { type: 'divider', id: 'divider-2' },
  {
    type: 'button',
    id: 'link',
    icon: <LinkIcon />,
    tooltip: '插入链接',
    shortcut: 'Ctrl+K',
  },
];

// 预设的段落按钮组
export const defaultParagraphItems: ToolbarItem[] = [
  {
    type: 'button',
    id: 'bulletList',
    icon: <BulletListIcon />,
    tooltip: '无序列表',
  },
  {
    type: 'button',
    id: 'orderedList',
    icon: <OrderedListIcon />,
    tooltip: '有序列表',
  },
  {
    type: 'button',
    id: 'taskList',
    icon: <TaskListIcon />,
    tooltip: '任务列表',
  },
  { type: 'divider', id: 'divider-3' },
  {
    type: 'button',
    id: 'code',
    icon: <CodeIcon />,
    tooltip: '行内代码',
  },
  {
    type: 'button',
    id: 'codeBlock',
    icon: <CodeBlockIcon />,
    tooltip: '代码块',
  },
  {
    type: 'button',
    id: 'blockquote',
    icon: <QuoteIcon />,
    tooltip: '引用',
  },
];

// 预设的插入按钮组
export const defaultInsertItems: ToolbarItem[] = [
  {
    type: 'button',
    id: 'image',
    icon: <ImageIcon />,
    tooltip: '插入图片',
  },
  {
    type: 'button',
    id: 'table',
    icon: <TableIcon />,
    tooltip: '插入表格',
  },
  {
    type: 'button',
    id: 'divider',
    icon: <DividerIcon />,
    tooltip: '分割线',
  },
  { type: 'divider', id: 'divider-4' },
  {
    type: 'dropdown',
    id: 'align',
    icon: <AlignLeftIcon />,
    options: [
      { value: 'left', label: '左对齐', icon: <AlignLeftIcon /> },
      { value: 'center', label: '居中', icon: <AlignCenterIcon /> },
      { value: 'right', label: '右对齐', icon: <AlignRightIcon /> },
      { value: 'justify', label: '两端对齐', icon: <AlignJustifyIcon /> },
    ],
  },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  items,
  children,
  className,
  variant = 'default',
  orientation = 'horizontal',
  size = 'md',
  sticky = false,
  responsive = true,
  bordered = true,
  background = 'white',
}) => {
  const backgroundStyles = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    transparent: 'bg-transparent',
  };

  const variantStyles = {
    default: cn(
      'rounded-lg',
      bordered && 'border border-gray-200 shadow-sm',
      backgroundStyles[background]
    ),
    floating: cn(
      'rounded-full shadow-lg border border-gray-200',
      backgroundStyles[background]
    ),
    minimal: 'bg-transparent',
  };

  const orientationStyles = {
    horizontal: 'flex-row items-center',
    vertical: 'flex-col items-stretch',
  };

  const sizeStyles = {
    sm: 'p-1 gap-0.5',
    md: 'p-1.5 gap-1',
    lg: 'p-2 gap-1.5',
  };

  const renderItem = (item: ToolbarItem) => {
    switch (item.type) {
      case 'button':
        return (
          <ToolbarButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            iconOnly={!item.label}
            active={item.active}
            disabled={item.disabled}
            shortcut={item.shortcut}
            tooltip={item.tooltip}
            size={size}
            onClick={item.onClick}
          />
        );
      case 'dropdown':
        return (
          <ToolbarDropdown
            key={item.id}
            icon={item.icon}
            label={item.label}
            value={item.value}
            options={item.options}
            placeholder={item.placeholder}
            onChange={item.onChange}
            size={size}
          />
        );
      case 'divider':
        return (
          <ToolbarDivider
            key={item.id}
            orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
            spacing={size === 'sm' ? 'sm' : 'md'}
          />
        );
      case 'group':
        return (
          <div
            key={item.id}
            className={cn(
              'flex',
              orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
              size === 'sm' ? 'gap-0.5' : 'gap-1'
            )}
          >
            {item.title && (
              <span className="text-xs text-gray-500 px-2 font-medium">
                {item.title}
              </span>
            )}
            {item.items.map(renderItem)}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'flex',
        orientationStyles[orientation],
        sizeStyles[size],
        variantStyles[variant],
        sticky && orientation === 'horizontal' && 'sticky top-0 z-40',
        responsive && orientation === 'horizontal' && 'flex-wrap',
        className
      )}
      role="toolbar"
      aria-orientation={orientation}
    >
      {items ? items.map(renderItem) : children}
    </div>
  );
};

Toolbar.displayName = 'Toolbar';

// 图标组件
function BoldIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  );
}

function StrikethroughIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 16h12M6 12h12M4 8h16" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h12M7 12h12M7 17h12M3 7h.01M3 12h.01M3 17h.01" />
    </svg>
  );
}

function TaskListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function CodeBlockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7-8v8m14-8v8M3 6h18a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z" />
    </svg>
  );
}

function DividerIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

function AlignLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
    </svg>
  );
}

function AlignJustifyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default Toolbar;
