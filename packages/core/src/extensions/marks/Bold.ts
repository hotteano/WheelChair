/**
 * Bold Extension - 粗体扩展
 * 
 * 继承自 @tiptap/extension-bold，提供粗体文本格式化功能
 * 支持快捷键 Ctrl+B
 */

import Bold from '@tiptap/extension-bold';
import type { Editor } from '@tiptap/core';

// 工具栏按钮配置接口
export interface ToolbarButtonConfig {
  /** 按钮唯一标识 */
  name: string;
  /** 按钮显示文本 */
  label: string;
  /** 按钮图标 (SVG字符串或组件名) */
  icon: string;
  /** 按钮提示文本 */
  tooltip: string;
  /** 快捷键说明 */
  shortcut?: string;
  /** 按钮是否激活状态检测函数 */
  isActive: (editor: Editor) => boolean;
  /** 点击执行命令 */
  onClick: (editor: Editor) => void;
  /** 按钮禁用状态检测 */
  isDisabled?: (editor: Editor) => boolean;
}

// 扩展选项接口
export interface BoldExtensionOptions {
  /** HTML属性 */
  HTMLAttributes?: Record<string, any>;
}

/**
 * 创建粗体扩展
 * @param options - 扩展配置选项
 * @returns 配置后的 Bold 扩展
 */
export const createBoldExtension = (options: BoldExtensionOptions = {}) => {
  return Bold.configure({
    HTMLAttributes: {
      class: 'wheelchair-bold',
      ...options.HTMLAttributes,
    },
  });
};

/**
 * 粗体扩展对象（包含扩展和工具栏按钮配置）
 */
export const BoldExtension = {
  /** 扩展名称 */
  name: 'bold',
  
  /** Tiptap 扩展实例 */
  extension: createBoldExtension(),
  
  /**
   * 渲染工具栏按钮配置
   * @returns 工具栏按钮配置对象
   */
  renderToolbarButton: (): ToolbarButtonConfig => ({
    name: 'bold',
    label: '粗体',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
    </svg>`,
    tooltip: '粗体 (Ctrl+B)',
    shortcut: 'Ctrl+B',
    isActive: (editor: Editor) => editor.isActive('bold'),
    onClick: (editor: Editor) => editor.chain().focus().toggleBold().run(),
    isDisabled: (editor: Editor) => !editor.can().chain().focus().toggleBold().run(),
  }),
  
  /**
   * 快捷键配置
   * 返回快捷键映射对象
   */
  getKeyboardShortcuts: () => ({
    'Mod-b': () => {
      // 快捷键处理会在扩展的 addKeyboardShortcuts 中注册
      return true;
    },
  }),
  
  /**
   * 序列化配置
   */
  serializeConfig: {
    /** 导出为 HTML 时的处理 */
    toHTML: {
      open: '<strong class="wheelchair-bold">',
      close: '</strong>',
    },
    /** 导出为 Markdown 时的处理 */
    toMarkdown: {
      open: '**',
      close: '**',
    },
    /** 从 Markdown 解析时的处理 */
    parseMarkdown: {
      pattern: /\*\*(.+?)\*\*/g,
      handler: (match: string, content: string) => ({ type: 'bold', content }),
    },
  },
};

// 默认导出
export default BoldExtension;
