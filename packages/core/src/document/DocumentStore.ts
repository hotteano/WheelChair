/**
 * WheelChair Editor - DocumentStore
 * React Hook for Document Management
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { JSONContent } from '@tiptap/core';
import { DocumentManager } from './DocumentManager';
import type {
  Document,
  DocumentState,
  DocumentManagerOptions,
  DocumentEventMap,
  DocumentEventListener,
} from './types';

// ============================================
// Hook 返回值类型
// ============================================

export interface UseDocumentManagerReturn {
  // 状态
  documents: Document[];
  activeDocument: Document | null;
  activeDocumentId: string | null;
  isLoading: boolean;
  error: Error | null;
  
  // CRUD 操作
  createDocument: (title?: string, content?: JSONContent) => Document;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>) => void;
  renameDocument: (id: string, newTitle: string) => void;
  duplicateDocument: (id: string) => Document;
  
  // 文档切换
  setActiveDocument: (id: string | null) => void;
  nextDocument: () => void;
  previousDocument: () => void;
  
  // 内容更新
  updateDocumentContent: (id: string, content: JSONContent) => void;
  
  // 搜索排序
  searchDocuments: (query: string) => Document[];
  getSortedDocuments: (sortBy?: 'updatedAt' | 'createdAt' | 'title', order?: 'asc' | 'desc') => Document[];
  
  // 事件订阅
  on: <T extends keyof DocumentEventMap>(event: T, listener: DocumentEventListener<T>) => () => void;
  off: <T extends keyof DocumentEventMap>(event: T, listener: DocumentEventListener<T>) => void;
  
  // WheelChair (.wc) 格式导入导出
  exportToWC: (id: string, options?: { pretty?: boolean }) => string;
  importFromWC: (content: string) => Document;
  downloadAsWC: (id: string, filename?: string) => void;
  importWCFromFile: (file: File) => Promise<Document>;
}

// ============================================
// Hook 实现
// ============================================

export function useDocumentManager(
  options?: DocumentManagerOptions
): UseDocumentManagerReturn {
  // 使用 ref 保持 DocumentManager 实例
  const managerRef = useRef<DocumentManager | null>(null);
  
  // 如果还没有实例，创建一个
  if (!managerRef.current) {
    managerRef.current = new DocumentManager(options);
  }
  
  const manager = managerRef.current;
  
  // 本地状态，用于触发重新渲染
  const [documents, setDocuments] = useState<Document[]>(manager.documents);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(manager.activeDocumentId);
  const [isLoading, setIsLoading] = useState<boolean>(manager.isLoading);
  const [error, setError] = useState<Error | null>(manager.error);
  
  // 计算当前激活的文档
  const activeDocument = useMemo(() => {
    if (!activeDocumentId) return null;
    return documents.find(d => d.id === activeDocumentId) || null;
  }, [documents, activeDocumentId]);
  
  // 同步状态的方法
  const syncState = useCallback(() => {
    setDocuments(manager.documents);
    setActiveDocumentId(manager.activeDocumentId);
    setIsLoading(manager.isLoading);
    setError(manager.error);
  }, [manager]);
  
  // 订阅文档管理器的事件
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    
    // 监听任何文档变更事件
    const events: (keyof DocumentEventMap)[] = [
      'document:create',
      'document:delete',
      'document:update',
      'document:active',
      'document:content',
      'documents:load',
    ];
    
    events.forEach(event => {
      const unsub = manager.on(event, syncState);
      unsubscribers.push(unsub);
    });
    
    // 初始同步
    syncState();
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [manager, syncState]);
  
  // 清理函数
  useEffect(() => {
    return () => {
      // 组件卸载时保存
      manager.persistToStorage();
    };
  }, [manager]);
  
  // 包装方法，确保状态同步
  const createDocument = useCallback((title?: string, content?: JSONContent) => {
    return manager.createDocument(title, content);
  }, [manager]);
  
  const deleteDocument = useCallback((id: string) => {
    manager.deleteDocument(id);
  }, [manager]);
  
  const updateDocument = useCallback((id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>) => {
    manager.updateDocument(id, updates);
  }, [manager]);
  
  const renameDocument = useCallback((id: string, newTitle: string) => {
    manager.renameDocument(id, newTitle);
  }, [manager]);
  
  const duplicateDocument = useCallback((id: string) => {
    return manager.duplicateDocument(id);
  }, [manager]);
  
  const setActiveDocument = useCallback((id: string | null) => {
    manager.setActiveDocument(id);
  }, [manager]);
  
  const nextDocument = useCallback(() => {
    manager.nextDocument();
  }, [manager]);
  
  const previousDocument = useCallback(() => {
    manager.previousDocument();
  }, [manager]);
  
  const updateDocumentContent = useCallback((id: string, content: JSONContent) => {
    manager.updateDocumentContent(id, content);
  }, [manager]);
  
  const searchDocuments = useCallback((query: string) => {
    return manager.searchDocuments(query);
  }, [manager]);
  
  const getSortedDocuments = useCallback((
    sortBy?: 'updatedAt' | 'createdAt' | 'title',
    order?: 'asc' | 'desc'
  ) => {
    return manager.getSortedDocuments(sortBy, order);
  }, [manager]);
  
  const on = useCallback(<T extends keyof DocumentEventMap>(
    event: T,
    listener: DocumentEventListener<T>
  ) => {
    return manager.on(event, listener);
  }, [manager]);
  
  const off = useCallback(<T extends keyof DocumentEventMap>(
    event: T,
    listener: DocumentEventListener<T>
  ) => {
    manager.off(event, listener);
  }, [manager]);
  
  // WheelChair (.wc) 格式导入导出方法
  const exportToWC = useCallback((id: string, options?: { pretty?: boolean }) => {
    return manager.exportToWC(id, options);
  }, [manager]);
  
  const importFromWC = useCallback((content: string) => {
    return manager.importFromWC(content);
  }, [manager]);
  
  const downloadAsWC = useCallback((id: string, filename?: string) => {
    manager.downloadAsWC(id, filename);
  }, [manager]);
  
  const importWCFromFile = useCallback(async (file: File) => {
    return manager.importWCFromFile(file);
  }, [manager]);
  
  return {
    // 状态
    documents,
    activeDocument,
    activeDocumentId,
    isLoading,
    error,
    
    // CRUD 操作
    createDocument,
    deleteDocument,
    updateDocument,
    renameDocument,
    duplicateDocument,
    
    // 文档切换
    setActiveDocument,
    nextDocument,
    previousDocument,
    
    // 内容更新
    updateDocumentContent,
    
    // 搜索排序
    searchDocuments,
    getSortedDocuments,
    
    // 事件订阅
    on,
    off,
    
    // WheelChair (.wc) 格式导入导出
    exportToWC,
    importFromWC,
    downloadAsWC,
    importWCFromFile,
  };
}

export default useDocumentManager;
