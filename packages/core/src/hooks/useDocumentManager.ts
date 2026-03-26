/**
 * WheelChair Editor - Document Manager Hook
 * 文档管理 Hook
 */

import { useState, useCallback, useEffect } from 'react';
import { WELCOME_DOCUMENT_TITLE, WELCOME_DOCUMENT_CONTENT } from '../document/welcomeDocument';

export interface Document {
  id: string;
  title: string;
  content: any;
  createdAt: number;
  updatedAt: number;
}

export interface UseDocumentManagerReturn {
  documents: Document[];
  activeDocument: Document | null;
  activeDocumentId: string | null;
  createDocument: (title?: string, content?: any) => Document;
  deleteDocument: (id: string) => void;
  updateDocumentContent: (id: string, content: any) => void;
  renameDocument: (id: string, title: string) => void;
  setActiveDocument: (id: string | null) => void;
  duplicateDocument: (id: string) => Document | null;
  searchDocuments: (query: string) => Document[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

// 创建欢迎文档
const createWelcomeDocument = (): Document => ({
  id: generateId(),
  title: WELCOME_DOCUMENT_TITLE,
  content: WELCOME_DOCUMENT_CONTENT,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export function useDocumentManager(): UseDocumentManagerReturn {
  const [documents, setDocuments] = useState<Document[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('wheelchair-documents');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed : [createWelcomeDocument()];
    }
    // 首次使用，创建欢迎文档
    return [createWelcomeDocument()];
  });
  
  // 初始化时自动选中第一个文档（欢迎文档）
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('wheelchair-documents');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed[0].id : null;
    }
    // 首次使用，欢迎文档会被创建，但此时还不知道ID
    // 使用 useEffect 在文档创建后设置
    return null;
  });
  
  // 持久化到 localStorage
  useEffect(() => {
    localStorage.setItem('wheelchair-documents', JSON.stringify(documents));
  }, [documents]);
  
  // 首次加载时，如果没有选中文档，自动选中第一个
  useEffect(() => {
    if (!activeDocumentId && documents.length > 0) {
      setActiveDocumentId(documents[0].id);
    }
  }, [activeDocumentId, documents]);
  
  const createDocument = useCallback((title?: string, content?: any): Document => {
    const doc: Document = {
      id: generateId(),
      title: title || '未命名文档',
      content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDocuments(prev => [doc, ...prev]);
    setActiveDocumentId(doc.id);
    return doc;
  }, []);
  
  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activeDocumentId === id) {
      setActiveDocumentId(null);
    }
  }, [activeDocumentId]);
  
  const updateDocumentContent = useCallback((id: string, content: any) => {
    setDocuments(prev => prev.map(d => 
      d.id === id ? { ...d, content, updatedAt: Date.now() } : d
    ));
  }, []);
  
  const renameDocument = useCallback((id: string, title: string) => {
    setDocuments(prev => prev.map(d => 
      d.id === id ? { ...d, title, updatedAt: Date.now() } : d
    ));
  }, []);
  
  const setActiveDocument = useCallback((id: string | null) => {
    setActiveDocumentId(id);
  }, []);
  
  const duplicateDocument = useCallback((id: string): Document | null => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return null;
    
    const newDoc: Document = {
      ...doc,
      id: generateId(),
      title: `${doc.title} (副本)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  }, [documents]);
  
  const searchDocuments = useCallback((query: string): Document[] => {
    if (!query.trim()) return documents;
    const lower = query.toLowerCase();
    return documents.filter(d => 
      d.title.toLowerCase().includes(lower)
    );
  }, [documents]);
  
  const activeDocument = activeDocumentId 
    ? documents.find(d => d.id === activeDocumentId) || null
    : null;
  
  return {
    documents,
    activeDocument,
    activeDocumentId,
    createDocument,
    deleteDocument,
    updateDocumentContent,
    renameDocument,
    setActiveDocument,
    duplicateDocument,
    searchDocuments,
  };
}
