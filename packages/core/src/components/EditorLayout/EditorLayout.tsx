/**
 * WheelChair Editor - EditorLayout Component
 * 编辑器布局组件 - 整合侧边栏和编辑器区域
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { UseDocumentManagerReturn } from '../../document/DocumentStore';
import { Sidebar } from '../Sidebar';
import './EditorLayout.css';

// ============================================
// Props
// ============================================

export interface EditorLayoutProps {
  /** 文档管理器 */
  documentManager: UseDocumentManagerReturn;
  /** 编辑器内容区域 */
  children: React.ReactNode;
  /** 顶部工具栏 */
  toolbar?: React.ReactNode;
  /** 底部状态栏 */
  footer?: React.ReactNode;
  /** 头部区域（Logo等） */
  header?: React.ReactNode;
  /** 是否显示侧边栏 */
  showSidebar?: boolean;
  /** 侧边栏默认宽度 */
  sidebarWidth?: number;
  /** 自定义类名 */
  className?: string;
}

// ============================================
// 组件
// ============================================

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  documentManager,
  children,
  toolbar,
  footer,
  header,
  showSidebar = true,
  sidebarWidth = 280,
  className = '',
}) => {
  // 侧边栏收起状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // 切换侧边栏
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B: 切换侧边栏
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      
      // Ctrl/Cmd + Shift + [: 上一个文档
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '[') {
        e.preventDefault();
        documentManager.previousDocument();
      }
      
      // Ctrl/Cmd + Shift + ]: 下一个文档
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ']') {
        e.preventDefault();
        documentManager.nextDocument();
      }
      
      // Ctrl/Cmd + N: 新建文档
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        documentManager.createDocument();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, documentManager]);

  return (
    <div className={`wch-editor-layout ${className}`}>
      {/* 侧边栏 */}
      {showSidebar && (
        <Sidebar
          documentManager={documentManager}
          collapsible={true}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          width={sidebarWidth}
        />
      )}

      {/* 主内容区 */}
      <div className="wch-editor-layout__main">
        {/* 头部 */}
        {header && (
          <header className="wch-editor-layout__header">
            {!showSidebar && (
              <button
                className="wch-editor-layout__sidebar-toggle"
                onClick={toggleSidebar}
                title="显示侧边栏 (Ctrl+B)"
              >
                <MenuIcon />
              </button>
            )}
            {header}
          </header>
        )}

        {/* 工具栏 */}
        {toolbar && (
          <div className="wch-editor-layout__toolbar">
            {toolbar}
          </div>
        )}

        {/* 编辑器内容区 */}
        <div className="wch-editor-layout__content">
          {children}
        </div>

        {/* 底部状态栏 */}
        {footer && (
          <footer className="wch-editor-layout__footer">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

// ============================================
// 图标
// ============================================

const MenuIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default EditorLayout;
