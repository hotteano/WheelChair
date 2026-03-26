import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cn } from '../../utils/cn';

/** 斜杠命令类型 */
export type SlashCommandType = 'basic' | 'format' | 'list' | 'media' | 'embed' | 'other';

/** 斜杠命令配置 */
export interface SlashCommand {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  type: SlashCommandType;
  shortcut?: string;
  keywords?: string[];
  disabled?: boolean;
  /** 执行命令 */
  onExecute: () => void;
}

export interface SlashMenuProps {
  /** 命令列表 */
  commands?: SlashCommand[];
  /** 是否显示 */
  visible?: boolean;
  /** 搜索关键词 */
  filter?: string;
  /** 选中命令索引 */
  selectedIndex?: number;
  /** 触发位置 */
  position?: { top: number; left: number };
  /** 容器引用 */
  containerRef?: React.RefObject<HTMLElement>;
  /** 自定义类名 */
  className?: string;
  /** 命令执行回调 */
  onCommandSelect?: (command: SlashCommand) => void;
  /** 选中索引变化回调 */
  onSelectedIndexChange?: (index: number) => void;
  /** 关闭回调 */
  onClose?: () => void;
  /** 最大显示高度 */
  maxHeight?: number;
  /** 是否显示分类标题 */
  showCategories?: boolean;
}

// 默认命令列表
export const defaultSlashCommands: SlashCommand[] = [
  // 基础块
  {
    id: 'heading-1',
    label: '标题 1',
    description: '大标题',
    type: 'basic',
    shortcut: '#',
    keywords: ['h1', 'heading1', 'title'],
    icon: <HeadingIcon level={1} />,
    onExecute: () => {},
  },
  {
    id: 'heading-2',
    label: '标题 2',
    description: '中等标题',
    type: 'basic',
    shortcut: '##',
    keywords: ['h2', 'heading2', 'subtitle'],
    icon: <HeadingIcon level={2} />,
    onExecute: () => {},
  },
  {
    id: 'heading-3',
    label: '标题 3',
    description: '小标题',
    type: 'basic',
    shortcut: '###',
    keywords: ['h3', 'heading3'],
    icon: <HeadingIcon level={3} />,
    onExecute: () => {},
  },
  {
    id: 'paragraph',
    label: '正文',
    description: '普通文本',
    type: 'basic',
    keywords: ['p', 'text', 'normal'],
    icon: <ParagraphIcon />,
    onExecute: () => {},
  },
  
  // 列表
  {
    id: 'bullet-list',
    label: '无序列表',
    description: '项目符号列表',
    type: 'list',
    shortcut: '-',
    keywords: ['ul', 'bullet', 'list'],
    icon: <BulletListIcon />,
    onExecute: () => {},
  },
  {
    id: 'ordered-list',
    label: '有序列表',
    description: '编号列表',
    type: 'list',
    shortcut: '1.',
    keywords: ['ol', 'ordered', 'number'],
    icon: <OrderedListIcon />,
    onExecute: () => {},
  },
  {
    id: 'task-list',
    label: '任务列表',
    description: '带复选框的列表',
    type: 'list',
    shortcut: '[]',
    keywords: ['todo', 'task', 'checkbox'],
    icon: <TaskListIcon />,
    onExecute: () => {},
  },
  
  // 格式
  {
    id: 'code-block',
    label: '代码块',
    description: '代码片段',
    type: 'format',
    shortcut: '```',
    keywords: ['code', 'pre', 'source'],
    icon: <CodeBlockIcon />,
    onExecute: () => {},
  },
  {
    id: 'blockquote',
    label: '引用',
    description: '引用文本',
    type: 'format',
    shortcut: '>',
    keywords: ['quote', 'cite'],
    icon: <QuoteIcon />,
    onExecute: () => {},
  },
  {
    id: 'callout',
    label: '提示框',
    description: '信息提示框',
    type: 'format',
    keywords: ['info', 'warning', 'alert'],
    icon: <CalloutIcon />,
    onExecute: () => {},
  },
  
  // 媒体
  {
    id: 'image',
    label: '图片',
    description: '插入图片',
    type: 'media',
    shortcut: '![',
    keywords: ['img', 'photo'],
    icon: <ImageIcon />,
    onExecute: () => {},
  },
  {
    id: 'table',
    label: '表格',
    description: '插入表格',
    type: 'media',
    keywords: ['grid', 'sheet'],
    icon: <TableIcon />,
    onExecute: () => {},
  },
  {
    id: 'divider',
    label: '分割线',
    description: '水平分隔线',
    type: 'media',
    shortcut: '---',
    keywords: ['hr', 'line', 'separator'],
    icon: <DividerIcon />,
    onExecute: () => {},
  },
];

// 分类标签
const categoryLabels: Record<SlashCommandType, string> = {
  basic: '基础',
  format: '格式',
  list: '列表',
  media: '媒体',
  embed: '嵌入',
  other: '其他',
};

export const SlashMenu: React.FC<SlashMenuProps> = ({
  commands = defaultSlashCommands,
  visible = false,
  filter = '',
  selectedIndex: controlledSelectedIndex,
  position,
  containerRef,
  className,
  onCommandSelect,
  onSelectedIndexChange,
  onClose,
  maxHeight = 320,
  showCategories = true,
}) => {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0);
  const selectedIndex = controlledSelectedIndex ?? internalSelectedIndex;
  const setSelectedIndex = (index: number) => {
    setInternalSelectedIndex(index);
    onSelectedIndexChange?.(index);
  };
  
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 过滤命令
  const filteredCommands = useMemo(() => {
    if (!filter.trim()) return commands;
    
    const searchTerm = filter.toLowerCase().trim();
    return commands.filter((cmd) => {
      const matchLabel = cmd.label.toLowerCase().includes(searchTerm);
      const matchDescription = cmd.description?.toLowerCase().includes(searchTerm);
      const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(searchTerm));
      return matchLabel || matchDescription || matchKeywords;
    });
  }, [commands, filter]);

  // 按类型分组
  const groupedCommands = useMemo(() => {
    if (!showCategories || filter) {
      return { 'all': filteredCommands };
    }
    
    const groups: Record<string, SlashCommand[]> = {};
    filteredCommands.forEach((cmd) => {
      const type = cmd.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(cmd);
    });
    return groups;
  }, [filteredCommands, showCategories, filter]);

  // 扁平化列表用于键盘导航
  const flatCommands = useMemo(() => {
    return Object.values(groupedCommands).flat();
  }, [groupedCommands]);

  // 重置选中索引当过滤条件变化时
  useEffect(() => {
    if (filteredCommands.length > 0) {
      setSelectedIndex(0);
    }
  }, [filter, filteredCommands.length]);

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!visible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = selectedIndex < flatCommands.length - 1 ? selectedIndex + 1 : selectedIndex;
          setInternalSelectedIndex(nextIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : selectedIndex;
          setInternalSelectedIndex(prevIndex);
          break;
        case 'Enter':
          e.preventDefault();
          if (flatCommands[selectedIndex] && !flatCommands[selectedIndex].disabled) {
            handleCommandSelect(flatCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
      }
    },
    [visible, flatCommands, selectedIndex, onClose]
  );

  // 监听键盘事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 滚动选中项到可视区域
  useEffect(() => {
    const selectedItem = itemRefs.current[selectedIndex];
    if (selectedItem && menuRef.current) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleCommandSelect = (command: SlashCommand) => {
    if (command.disabled) return;
    command.onExecute();
    onCommandSelect?.(command);
    onClose?.();
  };

  // 计算菜单位置
  const calculatePosition = useCallback(() => {
    if (!position || !containerRef?.current) return position;

    const containerRect = containerRef.current.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth || 280;
    const menuHeight = menuRef.current?.offsetHeight || maxHeight;

    let { top, left } = position;

    // 相对于容器的坐标
    top = top - containerRect.top;
    left = left - containerRect.left;

    // 边界检测
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // 右侧边界
    if (left + menuWidth > containerWidth) {
      left = containerWidth - menuWidth - 8;
    }

    // 底部边界 - 如果下方空间不够，显示在上方
    if (top + menuHeight > containerHeight) {
      top = top - menuHeight - 24; // 24px 是行高估计值
    }

    return { top, left };
  }, [position, containerRef, maxHeight]);

  const displayPosition = calculatePosition();

  if (!visible || flatCommands.length === 0) return null;

  let currentIndex = 0;

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute z-50 rounded-lg shadow-xl border border-gray-200',
        'bg-white animate-in fade-in zoom-in-95 duration-100',
        'min-w-[280px] max-w-[320px]',
        className
      )}
      style={{
        top: displayPosition?.top,
        left: displayPosition?.left,
        maxHeight,
      }}
      role="listbox"
      aria-label="斜杠命令菜单"
    >
      <div className="py-2 overflow-y-auto" style={{ maxHeight: maxHeight - 10 }}>
        {filter && flatCommands.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 text-sm">
            未找到匹配的命令
          </div>
        ) : (
          Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category}>
              {showCategories && !filter && category !== 'all' && cmds.length > 0 && (
                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {categoryLabels[category as SlashCommandType] || category}
                </div>
              )}
              <div className="px-1">
                {cmds.map((command) => {
                  const isSelected = currentIndex === selectedIndex;
                  const index = currentIndex++;
                  
                  return (
                    <div
                      key={command.id}
                      ref={(el) => (itemRefs.current[index] = el)}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleCommandSelect(command)}
                      onMouseEnter={() => setInternalSelectedIndex(index)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 mx-1 rounded-md cursor-pointer',
                        'transition-colors duration-100',
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100',
                        command.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
                          isSelected ? 'bg-blue-500' : 'bg-gray-100'
                        )}
                      >
                        <span className={isSelected ? 'text-white' : 'text-gray-600'}>
                          {command.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {command.label}
                          </span>
                          {command.shortcut && (
                            <kbd
                              className={cn(
                                'px-1.5 py-0.5 text-xs rounded',
                                isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-500'
                              )}
                            >
                              {command.shortcut}
                            </kbd>
                          )}
                        </div>
                        {command.description && (
                          <div
                            className={cn(
                              'text-xs truncate',
                              isSelected ? 'text-blue-100' : 'text-gray-500'
                            )}
                          >
                            {command.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {showCategories && !filter && <div className="my-1 border-b border-gray-100 last:hidden" />}
            </div>
          ))
        )}
      </div>
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>使用 ↑↓ 选择，Enter 确认</span>
          <span>ESC 关闭</span>
        </div>
      </div>
    </div>
  );
};

SlashMenu.displayName = 'SlashMenu';

// 图标组件
function HeadingIcon({ level }: { level: number }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={`M4 6h${level * 2}M4 12h${level * 2}M4 18h${level * 2}`} />
    </svg>
  );
}

function ParagraphIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
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

function CodeBlockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
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

function CalloutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

export default SlashMenu;
