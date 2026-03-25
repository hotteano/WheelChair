/**
 * Strike Extension - 删除线扩展
 * 
 * 继承自 @tiptap/extension-strike，提供删除线文本格式化功能
 * 支持快捷键 Ctrl+Shift+S
 */

import Strike from '@tiptap/extension-strike';
import type { Editor } from '@tiptap/core';
import type { ToolbarButtonConfig } from './Bold';

// 扩展选项接口
export interface StrikeExtensionOptions {
  /** HTML属性 */
  HTMLAttributes?: Record<string, any>;
}

/**
 * 创建删除线扩展
 * @param options - 扩展配置选项
 * @returns 配置后的 Strike 扩展
 */
export const createStrikeExtension = (options: StrikeExtensionOptions = {}) => {
  return Strike.configure({
    HTMLAttributes: {
      class: 'wheelchair-strike',
      ...options.HTMLAttributes,
    },
  });
};

/**
 * 删除线扩展对象（包含扩展和工具栏按钮配置）
 */
export const StrikeExtension = {
  /** 扩展名称 */
  name: 'strike',
  
  /** Tiptap 扩展实例 */
  extension: createStrikeExtension(),
  
  /**
   * 渲染工具栏按钮配置
   * @returns 工具栏按钮配置对象
   */
  renderToolbarButton: (): ToolbarButtonConfig => ({
    name: 'strike',
    label: '删除线',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.3 19c.52.86 1 1.88 1 2.5a2.5 2.5 0 0 1-5 0c0-1.05-.57-2.1-1.29-3.2L12 12.5l-1.71 3.3c-.72 1.1-1.29 2.15-1.29 3.2a2.5 2.5 0 0 1-5 0c0-.62.48-1.64 1-2.5"></path>
      <path d="M17.3 19c-1.35 1-3.23 2-5.3 2s-3.95-1-5.3-2"></path>
      <line x1="4" y1="12" x2="20" y2="12"></line>
    </svg>`,
    tooltip: '删除线 (Ctrl+Shift+S)',
    shortcut: 'Ctrl+Shift+S',
    isActive: (editor: Editor) => editor.isActive('strike'),
    onClick: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
    isDisabled: (editor: Editor) => !editor.can().chain().focus().toggleStrike().run(),
  }),
  
  /**
   * 快捷键配置
   * Ctrl+Shift+S 用于删除线
   */
  getKeyboardShortcuts: () => ({
    'Mod-Shift-s': () => {
      return true;
    },
  }),
  
  /**
   * 序列化配置
   */
  serializeConfig: {
    /** 导出为 HTML 时的处理 */
    toHTML: {
      open: '<s class="wheelchair-strike">',
      close: '</s>',
    },
    /** 导出为 Markdown 时的处理 */
    toMarkdown: {
      open: '~~',
      close: '~~',
    },
    /** 从 Markdown 解析时的处理 */
    parseMarkdown: {
      pattern: /~~(.+?)~~/g,
      handler: (match: string, content: string) => ({ type: 'strike', content }),
    },
  },
};

// 默认导出
export default StrikeExtension;
