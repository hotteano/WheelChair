/**
 * WheelChair Editor - DocumentManager
 * 文档管理器 - 负责文档的CRUD、持久化和状态管理
 */

import type { JSONContent } from '@tiptap/core';
import type {
  Document,
  DocumentState,
  DocumentActions,
  DocumentStore,
  DocumentManagerOptions,
  PersistedDocuments,
  DocumentEventMap,
  DocumentEventListener,
  ExportFormat,
  ExportOptions,
} from './types';

// ============================================
// 默认配置
// ============================================

const DEFAULT_OPTIONS: Required<DocumentManagerOptions> = {
  storageKey: 'wheelchair:documents',
  autoSaveDelay: 1000,
  maxDocuments: 100,
  defaultTitle: '未命名文档',
};

// ============================================
// 生成唯一ID
// ============================================

function generateId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// 计算字数
// ============================================

function calculateWordCount(content: JSONContent): number {
  let count = 0;
  
  function traverse(node: JSONContent) {
    if (node.text) {
      // 中文按字符计，英文按单词计
      const text = node.text;
      const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      const englishWords = text
        .replace(/[\u4e00-\u9fa5]/g, '')
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0).length;
      count += chineseChars + englishWords;
    }
    if (node.content) {
      node.content.forEach(traverse);
    }
  }
  
  traverse(content);
  return count;
}

// ============================================
// DocumentManager 类
// ============================================

export class DocumentManager implements DocumentStore {
  // 状态
  private state: DocumentState;
  
  // 配置
  private options: Required<DocumentManagerOptions>;
  
  // 事件监听器
  private listeners: Map<keyof DocumentEventMap, Set<DocumentEventListener<any>>> = new Map();
  
  // 自动保存定时器
  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  
  // 最后保存时间
  private lastSaveTime = 0;

  constructor(options: DocumentManagerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    this.state = {
      documents: [],
      activeDocumentId: null,
      isLoading: true,
      error: null,
    };
    
    // 从持久化存储加载
    this.loadFromStorage();
    
    // 监听页面关闭，确保保存
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.persistToStorage();
      });
    }
  }

  // ============================================
  // Getters
  // ============================================

  get documents(): Document[] {
    return [...this.state.documents];
  }

  get activeDocumentId(): string | null {
    return this.state.activeDocumentId;
  }

  get activeDocument(): Document | null {
    if (!this.state.activeDocumentId) return null;
    return this.state.documents.find(d => d.id === this.state.activeDocumentId) || null;
  }

  get isLoading(): boolean {
    return this.state.isLoading;
  }

  get error(): Error | null {
    return this.state.error;
  }

  // ============================================
  // CRUD 操作
  // ============================================

  /**
   * 创建新文档
   */
  createDocument(title?: string, content?: JSONContent): Document {
    // 检查文档数量限制
    if (this.state.documents.length >= this.options.maxDocuments) {
      const error = new Error(`文档数量已达上限 (${this.options.maxDocuments})`);
      this.emit('error', { error });
      throw error;
    }
    
    const now = Date.now();
    const newDocument: Document = {
      id: generateId(),
      title: title || this.generateDefaultTitle(),
      content: content || {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      },
      createdAt: now,
      updatedAt: now,
      wordCount: content ? calculateWordCount(content) : 0,
      isDraft: true,
    };
    
    this.state.documents = [...this.state.documents, newDocument];
    this.state.activeDocumentId = newDocument.id;
    
    this.emit('document:create', { document: newDocument });
    this.emit('document:active', { id: newDocument.id, previousId: null });
    this.scheduleAutoSave();
    
    return newDocument;
  }

  /**
   * 删除文档
   */
  deleteDocument(id: string): void {
    const document = this.state.documents.find(d => d.id === id);
    if (!document) {
      console.warn(`Document not found: ${id}`);
      return;
    }
    
    this.state.documents = this.state.documents.filter(d => d.id !== id);
    
    // 如果删除的是当前激活的文档，切换到其他文档
    if (this.state.activeDocumentId === id) {
      const previousId = this.state.activeDocumentId;
      const nextDoc = this.state.documents[0] || null;
      this.state.activeDocumentId = nextDoc?.id || null;
      this.emit('document:active', { 
        id: this.state.activeDocumentId, 
        previousId 
      });
    }
    
    this.emit('document:delete', { id, document });
    this.scheduleAutoSave();
  }

  /**
   * 更新文档元数据
   */
  updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): void {
    const index = this.state.documents.findIndex(d => d.id === id);
    if (index === -1) {
      console.warn(`Document not found: ${id}`);
      return;
    }
    
    const oldDoc = this.state.documents[index];
    const updatedDoc: Document = {
      ...oldDoc,
      ...updates,
      updatedAt: Date.now(),
    };
    
    this.state.documents = [
      ...this.state.documents.slice(0, index),
      updatedDoc,
      ...this.state.documents.slice(index + 1),
    ];
    
    this.emit('document:update', { id, document: updatedDoc });
    this.scheduleAutoSave();
  }

  /**
   * 重命名文档
   */
  renameDocument(id: string, newTitle: string): void {
    if (!newTitle.trim()) {
      console.warn('Document title cannot be empty');
      return;
    }
    this.updateDocument(id, { title: newTitle.trim() });
  }

  /**
   * 复制文档
   */
  duplicateDocument(id: string): Document {
    const original = this.state.documents.find(d => d.id === id);
    if (!original) {
      throw new Error(`Document not found: ${id}`);
    }
    
    return this.createDocument(
      `${original.title} 副本`,
      JSON.parse(JSON.stringify(original.content))
    );
  }

  // ============================================
  // 文档切换
  // ============================================

  /**
   * 设置当前激活的文档
   */
  setActiveDocument(id: string | null): void {
    if (id === this.state.activeDocumentId) return;
    
    if (id !== null && !this.state.documents.find(d => d.id === id)) {
      console.warn(`Document not found: ${id}`);
      return;
    }
    
    const previousId = this.state.activeDocumentId;
    this.state.activeDocumentId = id;
    
    this.emit('document:active', { id, previousId });
    this.scheduleAutoSave();
  }

  /**
   * 切换到下一个文档
   */
  nextDocument(): void {
    if (!this.state.activeDocumentId) {
      if (this.state.documents.length > 0) {
        this.setActiveDocument(this.state.documents[0].id);
      }
      return;
    }
    
    const currentIndex = this.state.documents.findIndex(
      d => d.id === this.state.activeDocumentId
    );
    const nextIndex = (currentIndex + 1) % this.state.documents.length;
    this.setActiveDocument(this.state.documents[nextIndex].id);
  }

  /**
   * 切换到上一个文档
   */
  previousDocument(): void {
    if (!this.state.activeDocumentId) {
      if (this.state.documents.length > 0) {
        this.setActiveDocument(this.state.documents[this.state.documents.length - 1].id);
      }
      return;
    }
    
    const currentIndex = this.state.documents.findIndex(
      d => d.id === this.state.activeDocumentId
    );
    const previousIndex = currentIndex <= 0 
      ? this.state.documents.length - 1 
      : currentIndex - 1;
    this.setActiveDocument(this.state.documents[previousIndex].id);
  }

  // ============================================
  // 内容更新
  // ============================================

  /**
   * 更新文档内容
   */
  updateDocumentContent(id: string, content: JSONContent): void {
    const index = this.state.documents.findIndex(d => d.id === id);
    if (index === -1) {
      console.warn(`Document not found: ${id}`);
      return;
    }
    
    const oldDoc = this.state.documents[index];
    const wordCount = calculateWordCount(content);
    
    const updatedDoc: Document = {
      ...oldDoc,
      content,
      wordCount,
      updatedAt: Date.now(),
      isDraft: false,
    };
    
    this.state.documents = [
      ...this.state.documents.slice(0, index),
      updatedDoc,
      ...this.state.documents.slice(index + 1),
    ];
    
    this.emit('document:content', { id, content });
    this.scheduleAutoSave();
  }

  // ============================================
  // 搜索和排序
  // ============================================

  /**
   * 搜索文档
   */
  searchDocuments(query: string): Document[] {
    if (!query.trim()) return this.documents;
    
    const lowerQuery = query.toLowerCase().trim();
    return this.state.documents.filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 获取排序后的文档列表
   */
  getSortedDocuments(
    sortBy: 'updatedAt' | 'createdAt' | 'title' = 'updatedAt',
    order: 'asc' | 'desc' = 'desc'
  ): Document[] {
    const sorted = [...this.state.documents].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title, 'zh-CN');
        case 'createdAt':
          return a.createdAt - b.createdAt;
        case 'updatedAt':
        default:
          return a.updatedAt - b.updatedAt;
      }
    });
    
    return order === 'desc' ? sorted.reverse() : sorted;
  }

  // ============================================
  // 持久化
  // ============================================

  /**
   * 从 localStorage 加载
   */
  loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = localStorage.getItem(this.options.storageKey);
      if (data) {
        const parsed: PersistedDocuments = JSON.parse(data);
        
        // 验证数据版本
        if (parsed.version !== 1) {
          console.warn('Unsupported document data version:', parsed.version);
          this.initializeDefaultDocuments();
          return;
        }
        
        this.state.documents = parsed.documents || [];
        this.state.activeDocumentId = parsed.activeDocumentId;
        
        this.emit('documents:load', { documents: this.state.documents });
      } else {
        // 首次使用，创建默认文档
        this.initializeDefaultDocuments();
      }
    } catch (error) {
      console.error('Failed to load documents from storage:', error);
      this.state.error = error as Error;
      this.initializeDefaultDocuments();
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * 保存到 localStorage
   */
  persistToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data: PersistedDocuments = {
        version: 1,
        documents: this.state.documents,
        activeDocumentId: this.state.activeDocumentId,
        lastSyncAt: Date.now(),
      };
      
      localStorage.setItem(this.options.storageKey, JSON.stringify(data));
      this.lastSaveTime = Date.now();
      
      this.emit('documents:save', { timestamp: this.lastSaveTime });
    } catch (error) {
      console.error('Failed to save documents to storage:', error);
      this.emit('error', { error: error as Error });
    }
  }

  // ============================================
  // 事件系统
  // ============================================

  /**
   * 订阅事件
   */
  on<T extends keyof DocumentEventMap>(
    event: T,
    listener: DocumentEventListener<T>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    
    return () => this.off(event, listener);
  }

  /**
   * 取消订阅事件
   */
  off<T extends keyof DocumentEventMap>(
    event: T,
    listener: DocumentEventListener<T>
  ): void {
    this.listeners.get(event)?.delete(listener);
  }

  /**
   * 触发事件
   */
  private emit<T extends keyof DocumentEventMap>(
    event: T,
    data: DocumentEventMap[T]
  ): void {
    this.listeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in document event listener for "${event}":`, error);
      }
    });
  }

  // ============================================
  // 私有方法
  // ============================================

  /**
   * 生成默认标题
   */
  private generateDefaultTitle(): string {
    const existingTitles = new Set(
      this.state.documents.map(d => d.title)
    );
    
    let index = 1;
    let title = `${this.options.defaultTitle} ${index}`;
    
    while (existingTitles.has(title)) {
      index++;
      title = `${this.options.defaultTitle} ${index}`;
    }
    
    return title;
  }

  /**
   * 初始化默认文档
   */
  private initializeDefaultDocuments(): void {
    if (this.state.documents.length === 0) {
      this.createDocument('欢迎使用 WheelChair', {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: '🎨 欢迎使用 WheelChair 编辑器' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '这是一个' },
              { type: 'text', marks: [{ type: 'bold' }], text: '现代化' },
              { type: 'text', text: '的富文本编辑器，具有' },
              { type: 'text', marks: [{ type: 'italic' }], text: '丰富的功能' },
              { type: 'text', text: '和优秀的体验。' },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '✨ 主要特性' }],
          },
          {
            type: 'bulletList',
            content: [
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '🎨 支持多种文本格式' }] }] },
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '📄 多文档管理' }] }] },
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '💾 自动保存' }] }] },
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '📤 导入导出' }] }] },
            ],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '开始你的创作之旅吧！✍️' }],
          },
        ],
      });
    }
  }

  /**
   * 计划自动保存
   */
  private scheduleAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.persistToStorage();
    }, this.options.autoSaveDelay);
  }

  // ============================================
  // 导入导出
  // ============================================

  /**
   * 导出文档为 JSON 字符串
   */
  exportDocument(id: string, format: ExportFormat = ExportFormat.JSON, options: ExportOptions = {}): string {
    const doc = this.state.documents.find(d => d.id === id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }

    switch (format) {
      case ExportFormat.JSON:
        return options.pretty 
          ? JSON.stringify(doc, null, 2)
          : JSON.stringify(doc);
      
      case ExportFormat.TEXT:
        return this.extractTextFromContent(doc.content);
      
      default:
        throw new Error(`Export format not implemented: ${format}`);
    }
  }

  /**
   * 从内容中提取纯文本
   */
  private extractTextFromContent(content: JSONContent): string {
    let text = '';
    
    function traverse(node: JSONContent) {
      if (node.text) {
        text += node.text;
      }
      if (node.type === 'paragraph' || node.type === 'heading') {
        text += '\n';
      }
      if (node.content) {
        node.content.forEach(traverse);
      }
    }
    
    traverse(content);
    return text.trim();
  }

  /**
   * 导入文档
   */
  importDocument(content: string, format: ExportFormat, title?: string): Document {
    switch (format) {
      case ExportFormat.JSON: {
        const parsed = JSON.parse(content);
        return this.createDocument(
          title || parsed.title || '导入的文档',
          parsed.content || parsed
        );
      }
      
      default:
        throw new Error(`Import format not implemented: ${format}`);
    }
  }

  // ============================================
  // WheelChair (.wc) 专属格式导入导出
  // ============================================

  /**
   * 导出文档为 .wc 格式
   */
  exportToWC(id: string, options?: { pretty?: boolean; includeMetadata?: boolean }): string {
    const doc = this.state.documents.find(d => d.id === id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }

    // 使用 WCExporter 导出
    const now = new Date().toISOString();
    const wcFile = {
      format: 'wheelchair' as const,
      version: '1.0.0',
      createdAt: new Date(doc.createdAt).toISOString(),
      modifiedAt: new Date(doc.updatedAt).toISOString(),
      document: {
        title: doc.title,
        content: doc.content,
        wordCount: doc.wordCount,
      },
      metadata: {
        editorVersion: '0.1.0',
        originalId: doc.id,
      },
    };

    return JSON.stringify(wcFile, null, options?.pretty ? 2 : undefined);
  }

  /**
   * 从 .wc 文件导入文档
   */
  importFromWC(content: string, options?: { validate?: boolean }): Document {
    const validate = options?.validate ?? true;
    
    // 检查是否是压缩格式
    let jsonContent = content;
    if (content.startsWith('COMPRESSED:')) {
      const compressed = content.slice('COMPRESSED:'.length);
      jsonContent = decodeURIComponent(escape(atob(compressed)));
    }

    const wcFile = JSON.parse(jsonContent);

    // 验证文件结构
    if (validate) {
      if (!wcFile.format || wcFile.format !== 'wheelchair') {
        throw new Error('Invalid .wc file: missing or invalid format field');
      }
      if (!wcFile.document || !wcFile.document.content) {
        throw new Error('Invalid .wc file: missing document content');
      }
    }

    return this.createDocument(
      wcFile.document.title || '导入的文档',
      wcFile.document.content
    );
  }

  /**
   * 下载文档为 .wc 文件
   */
  downloadAsWC(id: string, filename?: string): void {
    const doc = this.state.documents.find(d => d.id === id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }

    const content = this.exportToWC(id, { pretty: true });
    const blob = new Blob([content], { type: 'application/wheelchair+json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.wc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 从文件导入 .wc 文档
   */
  async importWCFromFile(file: File): Promise<Document> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const doc = this.importFromWC(content);
          resolve(doc);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

// ============================================
// 工厂函数
// ============================================

export function createDocumentManager(options?: DocumentManagerOptions): DocumentManager {
  return new DocumentManager(options);
}

export default DocumentManager;
