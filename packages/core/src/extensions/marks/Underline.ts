/**
 * Underline Extension - 下划线扩展
 * 
 * 继承自 @tiptap/extension-underline，提供下划线文本格式化功能
 * 支持快捷键 Ctrl+U
 */

import Underline from '@tiptap/extension-underline';
import type { Editor } from '@tiptap/core';
import type { ToolbarButtonConfig } from './Bold';

// 扩展选项接口
export interface UnderlineExtensionOptions {
  /** HTML属性 */
  HTMLAttributes?: Record<string, any>;
}

/**
 * 创建下划线扩展
 * @param options - 扩展配置选项
 * @returns 配置后的 Underline 扩展
 */
export const createUnderlineExtension = (options: UnderlineExtensionOptions = {}) => {
  return Underline.configure({
    HTMLAttributes: {
      class: 'wheelchair-underline',
      ...options.HTMLAttributes,
    },
  });
};

/**
 * 下划线扩展对象（包含扩展和工具栏按钮配置）
 */
export const UnderlineExtension = {
  /** 扩展名称 */
  name: 'underline',
  
  /** Tiptap 扩展实例 */
  extension: createUnderlineExtension(),
  
  /**
   * 渲染工具栏按钮配置
   * @returns 工具栏按钮配置对象
   */
  renderToolbarButton: (): ToolbarButtonConfig => ({
    name: 'underline',
    label: '下划线',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
      <line x1="4" y1="21" x2="20" y2="21"></line>
    </svg>`,
    tooltip: '下划线 (Ctrl+U)',
    shortcut: 'Ctrl+U',
    isActive: (editor: Editor) => editor.isActive('underline'),
    onClick: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
    isDisabled: (editor: Editor) => !editor.can().chain().focus().toggleUnderline().run(),
  }),
  
  /**
   * 快捷键配置
   */
  getKeyboardShortcuts: () => ({
    'Mod-u': () => {
      return true;
    },
  }),
  
  /**
   * 序列化配置
   */
  serializeConfig: {
    /** 导出为 HTML 时的处理 */
    toHTML: {
      open: '<u class="wheelchair-underline">',
      close: '</u>',
    },
    /** 导出为 Markdown 时的处理 (Markdown 标准不支持下划线，使用 HTML) */
    toMarkdown: {
      open: '<u>',
      close: '</u>',
    },
    /** 从 HTML 解析时的处理 */
    parseHTML: {
      tag: 'u',
    },
  },
};

// 默认导出
export default UnderlineExtension;
