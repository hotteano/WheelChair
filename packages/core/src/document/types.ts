/**
 * WheelChair Editor - Document Types
 * 文档管理相关类型定义
 */

import type { JSONContent } from '@tiptap/core';

// ============================================
// 基础文档类型
// ============================================

export interface Document {
  /** 唯一标识 */
  id: string;
  /** 文档标题 */
  title: string;
  /** 文档内容 (Tiptap JSON) */
  content: JSONContent;
  /** 创建时间戳 */
  createdAt: number;
  /** 更新时间戳 */
  updatedAt: number;
  /** 字数统计 */
  wordCount: number;
  /** 是否为草稿 */
  isDraft: boolean;
  /** 标签列表 */
  tags?: string[];
}

// ============================================
// 文档状态
// ============================================

export interface DocumentState {
  /** 所有文档列表 */
  documents: Document[];
  /** 当前激活的文档ID */
  activeDocumentId: string | null;
  /** 是否加载中 */
  isLoading: boolean;
  /** 错误信息 */
  error: Error | null;
}

// ============================================
// 文档操作
// ============================================

export interface DocumentActions {
  // ---------- CRUD 操作 ----------
  
  /** 创建新文档 */
  createDocument: (title?: string, content?: JSONContent) => Document;
  
  /** 删除文档 */
  deleteDocument: (id: string) => void;
  
  /** 更新文档元数据 */
  updateDocument: (id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>) => void;
  
  /** 重命名文档 */
  renameDocument: (id: string, newTitle: string) => void;
  
  /** 复制文档 */
  duplicateDocument: (id: string) => Document;
  
  // ---------- 文档切换 ----------
  
  /** 设置当前激活的文档 */
  setActiveDocument: (id: string | null) => void;
  
  /** 切换到下一个文档 */
  nextDocument: () => void;
  
  /** 切换到上一个文档 */
  previousDocument: () => void;
  
  // ---------- 内容更新 ----------
  
  /** 更新文档内容 */
  updateDocumentContent: (id: string, content: JSONContent) => void;
  
  // ---------- 搜索过滤 ----------
  
  /** 搜索文档 */
  searchDocuments: (query: string) => Document[];
  
  /** 获取排序后的文档列表 */
  getSortedDocuments: (sortBy?: 'updatedAt' | 'createdAt' | 'title', order?: 'asc' | 'desc') => Document[];
}

// ============================================
// 文档存储
// ============================================

export type DocumentStore = DocumentState & DocumentActions;

// ============================================
// 持久化数据格式
// ============================================

export interface PersistedDocuments {
  /** 数据版本 */
  version: number;
  /** 文档列表 */
  documents: Document[];
  /** 当前激活文档ID */
  activeDocumentId: string | null;
  /** 最后同步时间 */
  lastSyncAt: number;
}

// ============================================
// DocumentManager 配置选项
// ============================================

export interface DocumentManagerOptions {
  /** localStorage 键名 */
  storageKey?: string;
  /** 自动保存延迟（毫秒） */
  autoSaveDelay?: number;
  /** 最大文档数量 */
  maxDocuments?: number;
  /** 默认文档标题 */
  defaultTitle?: string;
}

// ============================================
// 导出格式（从 importExport 重新导出）
// ============================================

export { ExportFormat } from '../utils/importExport';

export interface ExportOptions {
  /** 包含元数据 */
  includeMetadata?: boolean;
  /** 格式化输出 */
  pretty?: boolean;
}

// ============================================
// 事件类型
// ============================================

export type DocumentEventMap = {
  'document:create': { document: Document };
  'document:delete': { id: string; document: Document };
  'document:update': { id: string; document: Document };
  'document:active': { id: string | null; previousId: string | null };
  'document:content': { id: string; content: JSONContent };
  'documents:load': { documents: Document[] };
  'documents:save': { timestamp: number };
  'error': { error: Error };
};

export type DocumentEventListener<T extends keyof DocumentEventMap> = 
  (event: DocumentEventMap[T]) => void;

// ============================================
// 工具类型
// ============================================

/** 生成唯一ID */
export type GenerateId = () => string;

/** 文档过滤器 */
export type DocumentFilter = (doc: Document) => boolean;

/** 文档排序器 */
export type DocumentSorter = (a: Document, b: Document) => number;
