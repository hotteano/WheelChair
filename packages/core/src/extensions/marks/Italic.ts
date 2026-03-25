/**
 * Italic Extension - 斜体扩展
 * 
 * 继承自 @tiptap/extension-italic，提供斜体文本格式化功能
 * 支持快捷键 Ctrl+I
 */

import Italic from '@tiptap/extension-italic';
import type { Editor } from '@tiptap/core';
import type { ToolbarButtonConfig } from './Bold';

// 扩展选项接口
export interface ItalicExtensionOptions {
  /** HTML属性 */
  HTMLAttributes?: Record<string, any>;
}

/**
 * 创建斜体扩展
 * @param options - 扩展配置选项
 * @returns 配置后的 Italic 扩展
 */
export const createItalicExtension = (options: ItalicExtensionOptions = {}) => {
  return Italic.configure({
    HTMLAttributes: {
      class: 'wheelchair-italic',
      ...options.HTMLAttributes,
    },
  });
};

/**
 * 斜体扩展对象（包含扩展和工具栏按钮配置）
 */
export const ItalicExtension = {
  /** 扩展名称 */
  name: 'italic',
  
  /** Tiptap 扩展实例 */
  extension: createItalicExtension(),
  
  /**
   * 渲染工具栏按钮配置
   * @returns 工具栏按钮配置对象
   */
  renderToolbarButton: (): ToolbarButtonConfig => ({
    name: 'italic',
    label: '斜体',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="4" x2="10" y2="4"></line>
      <line x1="14" y1="20" x2="5" y2="20"></line>
      <line x1="15" y1="4" x2="9" y2="20"></line>
    </svg>`,
    tooltip: '斜体 (Ctrl+I)',
    shortcut: 'Ctrl+I',
    isActive: (editor: Editor) => editor.isActive('italic'),
    onClick: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
    isDisabled: (editor: Editor) => !editor.can().chain().focus().toggleItalic().run(),
  }),
  
  /**
   * 快捷键配置
   */
  getKeyboardShortcuts: () => ({
    'Mod-i': () => {
      return true;
    },
  }),
  
  /**
   * 序列化配置
   */
  serializeConfig: {
    /** 导出为 HTML 时的处理 */
    toHTML: {
      open: '<em class="wheelchair-italic">',
      close: '</em>',
    },
    /** 导出为 Markdown 时的处理 */
    toMarkdown: {
      open: '*',
      close: '*',
    },
    /** 从 Markdown 解析时的处理 */
    parseMarkdown: {
      pattern: /\*(.+?)\*/g,
      handler: (match: string, content: string) => ({ type: 'italic', content }),
    },
  },
};

// 默认导出
export default ItalicExtension;
