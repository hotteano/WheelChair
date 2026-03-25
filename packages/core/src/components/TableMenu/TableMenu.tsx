/**
 * WheelChair Editor - Table Menu Component
 * 
 * 表格操作菜单组件
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/core';
import { TableGrid } from './TableGrid';
import './table-menu.css';

export interface TableMenuProps {
  editor: Editor;
}

export interface TableMenuItem {
  name: string;
  title: string;
  icon: React.ReactNode;
  action: () => boolean;
  isActive?: () => boolean;
  isDisabled?: () => boolean;
  shortcut?: string;
  divider?: boolean;
}

export const TableMenu: React.FC<TableMenuProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInTable = editor.isActive('table');

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowGrid(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 插入表格
  const handleInsertTable = useCallback((rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowGrid(false);
    setIsOpen(false);
  }, [editor]);

  // 菜单项定义
  const tableItems: TableMenuItem[] = [
    {
      name: 'addColumnBefore',
      title: '在左侧插入列',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="M6 12h6" />
        </svg>
      ),
      action: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      name: 'addColumnAfter',
      title: '在右侧插入列',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M15 3v18" />
          <path d="M12 12h6" />
        </svg>
      ),
      action: () => editor.chain().focus().addColumnAfter().run(),
    },
    {
      name: 'deleteColumn',
      title: '删除列',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      ),
      action: () => editor.chain().focus().deleteColumn().run(),
      divider: true,
    },
    {
      name: 'addRowBefore',
      title: '在上方插入行',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M12 6v6" />
        </svg>
      ),
      action: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      name: 'addRowAfter',
      title: '在下方插入行',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 15h18" />
          <path d="M12 12v6" />
        </svg>
      ),
      action: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      name: 'deleteRow',
      title: '删除行',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
        </svg>
      ),
      action: () => editor.chain().focus().deleteRow().run(),
      divider: true,
    },
    {
      name: 'toggleHeaderRow',
      title: '切换表头行',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 9v12" />
          <path d="M15 9v12" />
        </svg>
      ),
      action: () => editor.chain().focus().toggleHeaderRow().run(),
      isActive: () => {
        // 简化检查：检查第一行是否是表头
        const { state } = editor;
        const { $from } = state.selection;
        const tableNode = $from.node(1);
        if (tableNode && tableNode.type.name === 'table') {
          const firstRow = tableNode.child(0);
          return firstRow?.child(0)?.type.name === 'tableHeader';
        }
        return false;
      },
    },
    {
      name: 'deleteTable',
      title: '删除表格',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
      ),
      action: () => editor.chain().focus().deleteTable().run(),
      divider: true,
    },
    {
      name: 'setCellBgColor',
      title: '单元格背景色',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 15h18" />
          <circle cx="12" cy="18" r="2" fill="currentColor" />
        </svg>
      ),
      action: () => {
        // 打开颜色选择子菜单
        setActiveSubmenu(activeSubmenu === 'color' ? null : 'color');
        return true;
      },
    },
  ];

  // 颜色选项
  const colorOptions = [
    { name: 'transparent', label: '默认', color: 'transparent' },
    { name: 'red', label: '红色', color: '#fee2e2' },
    { name: 'orange', label: '橙色', color: '#ffedd5' },
    { name: 'yellow', label: '黄色', color: '#fef9c3' },
    { name: 'green', label: '绿色', color: '#dcfce7' },
    { name: 'blue', label: '蓝色', color: '#dbeafe' },
    { name: 'purple', label: '紫色', color: '#f3e8ff' },
    { name: 'gray', label: '灰色', color: '#f3f4f6' },
  ];

  const handleColorSelect = (color: string) => {
    editor.chain().focus().setCellAttribute('backgroundColor', color === 'transparent' ? null : color).run();
    setActiveSubmenu(null);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="table-menu-container">
      <button
        className={`table-menu-trigger ${isInTable ? 'is-active' : ''}`}
        onClick={() => {
          if (isInTable) {
            setIsOpen(!isOpen);
            setShowGrid(false);
          } else {
            setShowGrid(!showGrid);
          }
        }}
        title={isInTable ? '表格操作' : '插入表格'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
        <span>表格</span>
        <svg className={`dropdown-arrow ${(isOpen || showGrid) ? 'is-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* 表格网格选择器 - 用于插入新表格 */}
      {showGrid && !isInTable && (
        <div className="table-menu-dropdown">
          <div className="table-menu-header">
            <span>插入表格</span>
          </div>
          <TableGrid onSelect={handleInsertTable} />
        </div>
      )}

      {/* 表格操作菜单 - 当在表格内时显示 */}
      {isOpen && isInTable && (
        <div className="table-menu-dropdown">
          <div className="table-menu-header">
            <span>表格操作</span>
          </div>
          <div className="table-menu-list">
            {tableItems.map((item) => (
              <React.Fragment key={item.name}>
                {item.divider && <div className="table-menu-divider" />}
                <button
                  className={`table-menu-item ${item.isActive?.() ? 'is-active' : ''}`}
                  onClick={() => {
                    if (item.name !== 'setCellBgColor') {
                      item.action();
                      setIsOpen(false);
                    } else {
                      item.action();
                    }
                  }}
                  disabled={item.isDisabled?.()}
                >
                  <span className="table-menu-item-icon">{item.icon}</span>
                  <span className="table-menu-item-title">{item.title}</span>
                  {item.shortcut && (
                    <span className="table-menu-item-shortcut">{item.shortcut}</span>
                  )}
                </button>
              </React.Fragment>
            ))}

            {/* 颜色子菜单 */}
            {activeSubmenu === 'color' && (
              <div className="table-submenu">
                <div className="table-submenu-header">
                  <span>选择背景色</span>
                </div>
                <div className="table-color-grid">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      className="table-color-option"
                      onClick={() => handleColorSelect(color.color)}
                      title={color.label}
                      style={{
                        backgroundColor: color.color === 'transparent' ? 'var(--wc-bg)' : color.color,
                      }}
                    >
                      {color.name === 'transparent' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableMenu;
