/**
 * WheelChair Editor - Document Module
 * 文档管理模块入口
 */

// 类型
export * from './types';

// DocumentManager 类
export { DocumentManager, createDocumentManager } from './DocumentManager';

// React Hook
export { useDocumentManager } from './DocumentStore';

// 默认导出
export { useDocumentManager as default } from './DocumentStore';
