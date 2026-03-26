/**
 * WheelChair Editor - DocumentItem Component
 * 单个文档项组件
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Document } from '../../document/types';

export interface DocumentItemProps {
  document: Document;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
  onDuplicate: () => void;
  onExport?: () => void;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({
  document,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onDuplicate,
  onExport,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(document.title);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 自动聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as globalThis.Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      globalThis.document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      globalThis.document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // 处理重命名确认
  const handleRenameConfirm = useCallback(() => {
    if (editTitle.trim() && editTitle.trim() !== document.title) {
      onRename(editTitle.trim());
    } else {
      setEditTitle(document.title);
    }
    setIsEditing(false);
  }, [editTitle, document.title, onRename]);

  // 处理重命名取消
  const handleRenameCancel = useCallback(() => {
    setEditTitle(document.title);
    setIsEditing(false);
  }, [document.title]);

  // 键盘事件处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleRenameConfirm();
        break;
      case 'Escape':
        e.preventDefault();
        handleRenameCancel();
        break;
    }
  }, [handleRenameConfirm, handleRenameCancel]);

  // 处理更多按钮点击
  const handleMoreClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 计算菜单位置
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 160, // 菜单宽度 160px，右对齐
      });
    }
    
    setShowMenu(prev => !prev);
  }, []);

  // 处理重命名菜单点击
  const handleRenameClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setIsEditing(true);
  }, []);

  // 处理复制菜单点击
  const handleDuplicateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDuplicate();
  }, [onDuplicate]);

  // 处理删除菜单点击
  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete();
  }, [onDelete]);

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 小于1小时显示"x分钟前"
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return minutes < 1 ? '刚刚' : `${minutes} 分钟前`;
    }
    
    // 小于24小时显示"x小时前"
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} 小时前`;
    }
    
    // 小于7天显示"x天前"
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} 天前`;
    }
    
    // 否则显示日期
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 编辑状态
  if (isEditing) {
    return (
      <div 
        ref={itemRef}
        className="wch-doc-item wch-doc-item--active wch-doc-item--editing"
        onClick={(e) => e.stopPropagation()}
      >
        <FileIcon />
        <input
          ref={inputRef}
          type="text"
          className="wch-doc-item__input"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleRenameConfirm}
        />
      </div>
    );
  }

  return (
    <div
      ref={itemRef}
      className={`wch-doc-item ${isActive ? 'wch-doc-item--active' : ''}`}
      onClick={onSelect}
      title={document.title}
    >
      <span className="wch-doc-item__icon">
        <FileIcon />
      </span>
      
      <div className="wch-doc-item__content">
        <span className="wch-doc-item__title">
          {document.title}
        </span>
        <span className="wch-doc-item__meta">
          {formatTime(document.updatedAt)} · {document.wordCount} 字
        </span>
      </div>
      
      <div className="wch-doc-item__actions" onClick={(e) => e.stopPropagation()}>
        <button
          ref={buttonRef}
          className="wch-doc-item__action"
          onClick={handleMoreClick}
          title="更多操作"
        >
          <MoreIcon />
        </button>
        
        {showMenu && (
          <div 
            ref={menuRef} 
            className="wch-doc-menu"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button className="wch-doc-menu__item" onClick={handleRenameClick}>
              <EditIcon />
              重命名
            </button>
            <button className="wch-doc-menu__item" onClick={handleDuplicateClick}>
              <CopyIcon />
              创建副本
            </button>
            {onExport && (
              <button className="wch-doc-menu__item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onExport(); }}>
                <ExportIcon />
                导出为 .wc
              </button>
            )}
            <div className="wch-doc-menu__divider" />
            <button 
              className="wch-doc-menu__item wch-doc-menu__item--danger" 
              onClick={handleDeleteClick}
            >
              <TrashIcon />
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 图标组件
// ============================================

const FileIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const MoreIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const EditIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CopyIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ExportIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const TrashIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default DocumentItem;
