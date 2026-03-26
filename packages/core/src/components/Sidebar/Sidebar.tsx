/**
 * WheelChair Editor - Sidebar Component
 * 侧边栏主组件
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { UseDocumentManagerReturn } from '../../document/DocumentStore';
import { SearchBox } from './SearchBox';
import { DocumentList } from './DocumentList';
import { NewDocumentButton } from './NewDocumentButton';
import './Sidebar.css';

// ============================================
// Props
// ============================================

export interface SidebarProps {
  /** 文档管理器 */
  documentManager: UseDocumentManagerReturn;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 是否收起 */
  collapsed?: boolean;
  /** 切换收起状态 */
  onToggleCollapse?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义宽度 */
  width?: number;
}

// ============================================
// 组件
// ============================================

export const Sidebar: React.FC<SidebarProps> = ({
  documentManager,
  collapsible = true,
  collapsed = false,
  onToggleCollapse,
  className = '',
  width = 280,
}) => {
  const {
    documents,
    activeDocumentId,
    createDocument,
    deleteDocument,
    renameDocument,
    duplicateDocument,
    setActiveDocument,
    searchDocuments,
    downloadAsWC,
    importWCFromFile,
  } = documentManager;
  
  // 文件输入引用（用于导入）
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 搜索关键词
  const [searchQuery, setSearchQuery] = useState('');
  
  // 过滤后的文档列表
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) {
      return documents.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return searchDocuments(searchQuery).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [documents, searchQuery, searchDocuments]);

  // 处理新建文档
  const handleCreateDocument = useCallback(() => {
    createDocument();
    // 自动聚焦到新文档的标题编辑（在 DocumentItem 中处理）
  }, [createDocument]);

  // 处理选择文档
  const handleSelectDocument = useCallback((id: string) => {
    setActiveDocument(id);
  }, [setActiveDocument]);

  // 处理删除文档
  const handleDeleteDocument = useCallback((id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc && window.confirm(`确定要删除文档 "${doc.title}" 吗？`)) {
      deleteDocument(id);
    }
  }, [deleteDocument, documents]);

  // 处理重命名文档
  const handleRenameDocument = useCallback((id: string, newTitle: string) => {
    if (newTitle.trim()) {
      renameDocument(id, newTitle.trim());
    }
  }, [renameDocument]);

  // 处理复制文档
  const handleDuplicateDocument = useCallback((id: string) => {
    duplicateDocument(id);
  }, [duplicateDocument]);
  
  // 处理导出文档为 .wc 格式
  const handleExportDocument = useCallback((id: string) => {
    try {
      downloadAsWC(id);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }, [downloadAsWC]);
  
  // 处理导入 .wc 文件
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await importWCFromFile(file);
      // 清空输入以便可以再次选择同一文件
      e.target.value = '';
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
      e.target.value = '';
    }
  }, [importWCFromFile]);

  // 如果收起状态
  if (collapsed) {
    return (
      <aside 
        className={`wch-sidebar wch-sidebar--collapsed ${className}`}
        style={{ width: 48 }}
      >
        <div className="wch-sidebar__collapsed-content">
          {collapsible && (
            <button
              className="wch-sidebar__toggle"
              onClick={onToggleCollapse}
              title="展开侧边栏"
            >
              <ChevronRightIcon />
            </button>
          )}
          <button
            className="wch-sidebar__collapsed-btn"
            onClick={handleCreateDocument}
            title="新建文档"
          >
            <PlusIcon />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      className={`wch-sidebar ${className}`}
      style={{ width }}
    >
      {/* 头部 */}
      <div className="wch-sidebar__header">
        <h2 className="wch-sidebar__title">文档</h2>
        {collapsible && (
          <button
            className="wch-sidebar__toggle"
            onClick={onToggleCollapse}
            title="收起侧边栏"
          >
            <ChevronLeftIcon />
          </button>
        )}
      </div>

      {/* 搜索框 */}
      <div className="wch-sidebar__search">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索文档..."
        />
      </div>

      {/* 新建文档按钮 */}
      <div className="wch-sidebar__actions">
        <NewDocumentButton onClick={handleCreateDocument} />
      </div>

      {/* 文档列表 */}
      <div className="wch-sidebar__content">
        <DocumentList
          documents={filteredDocuments}
          activeDocumentId={activeDocumentId}
          onSelect={handleSelectDocument}
          onDelete={handleDeleteDocument}
          onRename={handleRenameDocument}
          onDuplicate={handleDuplicateDocument}
          onExport={handleExportDocument}
          emptyText={searchQuery ? '没有找到匹配的文档' : '暂无文档，点击上方按钮创建'}
        />
      </div>

      {/* 底部 */}
      <div className="wch-sidebar__footer">
        <span className="wch-sidebar__stats">
          {documents.length} 个文档
        </span>
        <button
          className="wch-sidebar__import-btn"
          onClick={handleImportClick}
          title="导入 .wc 文件"
        >
          <ImportIcon />
          导入
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".wc"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </aside>
  );
};

// ============================================
// 图标组件
// ============================================

const ChevronLeftIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ImportIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ChevronRightIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default Sidebar;
