/**
 * Highlight Extension - 高亮扩展
 * 
 * 继承自 @tiptap/extension-highlight，提供文本高亮功能
 * 支持多种颜色配置
 */

import Highlight from '@tiptap/extension-highlight';
import type { Editor } from '@tiptap/core';
import type { ToolbarButtonConfig } from './Bold';

/**
 * 高亮颜色选项
 */
export interface HighlightColorOption {
  /** 颜色名称 */
  name: string;
  /** 颜色值 */
  value: string;
  /** 显示标签 */
  label: string;
}

/**
 * 默认高亮颜色列表
 */
export const DEFAULT_HIGHLIGHT_COLORS: HighlightColorOption[] = [
  { name: 'yellow', value: '#fef08a', label: '黄色' },
  { name: 'orange', value: '#fed7aa', label: '橙色' },
  { name: 'red', value: '#fecaca', label: '红色' },
  { name: 'green', value: '#bbf7d0', label: '绿色' },
  { name: 'blue', value: '#bfdbfe', label: '蓝色' },
  { name: 'purple', value: '#e9d5ff', label: '紫色' },
  { name: 'pink', value: '#fbcfe8', label: '粉色' },
  { name: 'gray', value: '#e5e7eb', label: '灰色' },
];

// 扩展选项接口
export interface HighlightExtensionOptions {
  /** 是否支持多颜色 */
  multicolor?: boolean;
  /** 自定义颜色列表 */
  colors?: HighlightColorOption[];
  /** HTML属性 */
  HTMLAttributes?: Record<string, any>;
}

/**
 * 创建高亮扩展
 * @param options - 扩展配置选项
 * @returns 配置后的 Highlight 扩展
 */
export const createHighlightExtension = (options: HighlightExtensionOptions = {}) => {
  const { 
    multicolor = true, 
    colors = DEFAULT_HIGHLIGHT_COLORS,
    HTMLAttributes = {} 
  } = options;

  return Highlight.configure({
    multicolor,
    HTMLAttributes: {
      class: 'wheelchair-highlight',
      ...HTMLAttributes,
    },
  });
};

/**
 * 高亮扩展对象（包含扩展和工具栏按钮配置）
 */
export const HighlightExtension = {
  /** 扩展名称 */
  name: 'highlight',
  
  /** 可用颜色列表 */
  colors: DEFAULT_HIGHLIGHT_COLORS,
  
  /**
   * 创建带配置的扩展实例
   */
  createExtension: createHighlightExtension,
  
  /**
   * 渲染工具栏按钮配置
   * @param options - 可选的颜色配置
   * @returns 工具栏按钮配置对象
   */
  renderToolbarButton: (options?: { colors?: HighlightColorOption[] }): ToolbarButtonConfig & { 
    type: 'dropdown' | 'button';
    dropdownItems?: Array<{ name: string; label: string; value: string; color: string }>;
  } => {
    const colors = options?.colors || DEFAULT_HIGHLIGHT_COLORS;
    
    return {
      name: 'highlight',
      label: '高亮',
      type: 'dropdown',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 11-6 6v3h9l3-3"></path>
        <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path>
        <path d="M15 5h6v6"></path>
      </svg>`,
      tooltip: '文本高亮',
      isActive: (editor: Editor) => editor.isActive('highlight'),
      onClick: (editor: Editor) => {
        // 默认使用黄色高亮
        editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run();
      },
      isDisabled: (editor: Editor) => !editor.can().chain().focus().toggleHighlight().run(),
      dropdownItems: colors.map(color => ({
        name: color.name,
        label: color.label,
        value: color.value,
        color: color.value,
      })),
    };
  },
  
  /**
   * 设置高亮颜色
   * @param editor - 编辑器实例
   * @param color - 颜色值
   */
  setHighlight: (editor: Editor, color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
  },
  
  /**
   * 取消高亮
   * @param editor - 编辑器实例
   */
  unsetHighlight: (editor: Editor) => {
    editor.chain().focus().unsetHighlight().run();
  },
  
  /**
   * 切换高亮
   * @param editor - 编辑器实例
   * @param color - 可选的颜色值
   */
  toggleHighlight: (editor: Editor, color?: string) => {
    if (color) {
      editor.chain().focus().toggleHighlight({ color }).run();
    } else {
      editor.chain().focus().toggleHighlight().run();
    }
  },
  
  /**
   * 序列化配置
   */
  serializeConfig: {
    /** 导出为 HTML 时的处理 */
    toHTML: {
      open: '<mark class="wheelchair-highlight">',
      close: '</mark>',
    },
    /** 导出为 Markdown 时的处理 (使用 HTML 标签) */
    toMarkdown: {
      open: '<mark>',
      close: '</mark>',
    },
    /** 从 HTML 解析时的处理 */
    parseHTML: {
      tag: 'mark',
    },
  },
};

// 默认导出
export default HighlightExtension;
