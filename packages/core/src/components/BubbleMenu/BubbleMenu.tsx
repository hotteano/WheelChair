import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../../utils/cn';

export interface BubbleMenuButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface BubbleMenuProps {
  /** 按钮配置 */
  buttons?: BubbleMenuButton[];
  /** 是否显示 */
  visible?: boolean;
  /** 选中文本范围 */
  selectionRange?: Range | null;
  /** 容器元素（用于计算位置） */
  containerRef?: React.RefObject<HTMLElement>;
  /** 位置偏移 */
  offset?: { x: number; y: number };
  /** 自定义类名 */
  className?: string;
  /** 链接编辑模式 */
  linkMode?: boolean;
  /** 当前链接 URL */
  currentLinkUrl?: string;
  /** 链接保存回调 */
  onLinkSave?: (url: string) => void;
  /** 链接取消回调 */
  onLinkCancel?: () => void;
  /** 链接删除回调 */
  onLinkRemove?: () => void;
  /** 打开时的回调 */
  onOpen?: () => void;
  /** 关闭时的回调 */
  onClose?: () => void;
}

export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  buttons,
  visible = false,
  selectionRange,
  containerRef,
  offset = { x: 0, y: -8 },
  className,
  linkMode = false,
  currentLinkUrl = '',
  onLinkSave,
  onLinkCancel,
  onLinkRemove,
  onOpen,
  onClose,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [linkUrl, setLinkUrl] = useState(currentLinkUrl);
  const menuRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // 计算菜单位置
  const calculatePosition = useCallback(() => {
    if (!selectionRange || !containerRef?.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const selectionRect = selectionRange.getBoundingClientRect();

    // 默认显示在选中区域上方居中
    let top = selectionRect.top - containerRect.top - (menuRef.current?.offsetHeight || 40) + offset.y;
    let left = selectionRect.left - containerRect.left + (selectionRect.width / 2) + offset.x;

    // 边界检测和调整
    const menuWidth = menuRef.current?.offsetWidth || 200;
    void (menuRef.current?.offsetHeight || 40);  // 使用 void 表达式避免未使用变量警告

    // 水平居中，但确保不超出容器边界
    left = left - menuWidth / 2;
    
    // 左边边界检测
    if (left < 8) {
      left = 8;
    }
    
    // 右边边界检测
    const containerWidth = containerRect.width;
    if (left + menuWidth > containerWidth - 8) {
      left = containerWidth - menuWidth - 8;
    }

    // 上边边界检测 - 如果上方空间不够，显示在下方
    if (top < 8) {
      top = selectionRect.bottom - containerRect.top + 8;
    }

    setPosition({ top, left });
  }, [selectionRange, containerRef, offset]);

  // 当可见性变化时计算位置
  useEffect(() => {
    if (visible) {
      calculatePosition();
      onOpen?.();
      
      // 使用 requestAnimationFrame 确保在布局完成后重新计算位置
      requestAnimationFrame(calculatePosition);
    } else {
      onClose?.();
    }
  }, [visible, calculatePosition, onOpen, onClose]);

  // 窗口大小改变或滚动时更新位置
  useEffect(() => {
    if (!visible) return;

    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [visible, calculatePosition]);

  // 链接输入框自动聚焦
  useEffect(() => {
    if (linkMode && linkInputRef.current) {
      linkInputRef.current.focus();
      linkInputRef.current.select();
    }
    setLinkUrl(currentLinkUrl);
  }, [linkMode, currentLinkUrl]);

  // 默认按钮配置
  const defaultButtons: BubbleMenuButton[] = [
    {
      id: 'bold',
      icon: <BoldIcon />,
      label: '粗体',
      shortcut: 'Ctrl+B',
      onClick: () => {},
    },
    {
      id: 'italic',
      icon: <ItalicIcon />,
      label: '斜体',
      shortcut: 'Ctrl+I',
      onClick: () => {},
    },
    {
      id: 'underline',
      icon: <UnderlineIcon />,
      label: '下划线',
      shortcut: 'Ctrl+U',
      onClick: () => {},
    },
    {
      id: 'link',
      icon: <LinkIcon />,
      label: '链接',
      shortcut: 'Ctrl+K',
      onClick: () => {},
    },
  ];

  const displayButtons = buttons || defaultButtons;

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      onLinkSave?.(linkUrl.trim());
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute z-50 rounded-lg shadow-lg border border-gray-200',
        'bg-white animate-in fade-in zoom-in-95 duration-150',
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      role="toolbar"
      aria-label="浮动工具栏"
    >
      {linkMode ? (
        // 链接编辑模式
        <form
          onSubmit={handleLinkSubmit}
          className="flex items-center gap-2 p-2 min-w-[280px]"
        >
          <div className="relative flex-1">
            <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className={cn(
                'w-full pl-9 pr-3 py-1.5 text-sm rounded-md',
                'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                'outline-none transition-colors'
              )}
            />
          </div>
          <button
            type="submit"
            disabled={!linkUrl.trim()}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md',
              'bg-blue-600 text-white hover:bg-blue-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            确定
          </button>
          {currentLinkUrl && (
            <button
              type="button"
              onClick={onLinkRemove}
              className={cn(
                'p-1.5 rounded-md text-red-600 hover:bg-red-50',
                'transition-colors'
              )}
              title="删除链接"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onLinkCancel}
            className={cn(
              'p-1.5 rounded-md text-gray-500 hover:bg-gray-100',
              'transition-colors'
            )}
            title="取消"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </form>
      ) : (
        // 普通工具栏模式
        <div className="flex items-center gap-0.5 p-1">
          {displayButtons.map((button, index) => (
            <React.Fragment key={button.id}>
              <button
                type="button"
                onClick={button.onClick}
                disabled={button.disabled}
                className={cn(
                  'flex items-center justify-center',
                  'w-8 h-8 rounded-md transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  button.active
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100',
                  button.disabled && 'opacity-50 cursor-not-allowed'
                )}
                title={button.shortcut ? `${button.label} (${button.shortcut})` : button.label}
                aria-pressed={button.active}
                aria-label={button.label}
              >
                {button.icon}
              </button>
              {index === 2 && <div className="w-px h-5 bg-gray-200 mx-1" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

BubbleMenu.displayName = 'BubbleMenu';

// 图标组件
function BoldIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
    </svg>
  );
}

function ItalicIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function UnderlineIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default BubbleMenu;
