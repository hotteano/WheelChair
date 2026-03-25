/**
 * TextColor Extension - 文字颜色扩展
 * 
 * 使用 @tiptap/extension-color 和 @tiptap/extension-text-style
 * 提供文字颜色选择和设置功能
 */

import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import type { Editor } from '@tiptap/core';
import type { ToolbarButtonConfig } from './Bold';

/**
 * 颜色选项
 */
export interface TextColorOption {
  /** 颜色名称 */
  name: string;
  /** 颜色值 */
  value: string;
  /** 显示标签 */
  label: string;
}

/**
 * 默认文字颜色列表
 */
export const DEFAULT_TEXT_COLORS: TextColorOption[] = [
  { name: 'default', value: 'inherit', label: '默认' },
  { name: 'black', value: '#000000', label: '黑色' },
  { name: 'gray', value: '#6b7280', label: '灰色' },
  { name: 'red', value: '#ef4444', label: '红色' },
  { name: 'orange', value: '#f97316', label: '橙色' },
  { name: 'yellow', value: '#eab308', label: '黄色' },
  { name: 'green', value: '#22c55e', label: '绿色' },
  { name: 'blue', value: '#3b82f6', label: '蓝色' },
  { name: 'indigo', value: '#6366f1', label: '靛蓝' },
  { name: 'purple', value: '#a855f7', label: '紫色' },
  { name: 'pink', value: '#ec4899', label: '粉色' },
];

// 扩展选项接口
export interface TextColorExtensionOptions {
  /** 自定义颜色列表 */
  colors?: TextColorOption[];
  /** 是否支持自定义颜色输入 */
  allowCustomColor?: boolean;
}

/**
 * 创建文字颜色扩展
 * @param options - 扩展配置选项
 * @returns 包含 TextStyle 和 Color 扩展的数组
 */
export const createTextColorExtension = (options: TextColorExtensionOptions = {}) => {
  const { colors = DEFAULT_TEXT_COLORS } = options;

  // TextStyle 扩展必须先于 Color 扩展加载
  return [
    TextStyle,
    Color.configure({
      types: ['textStyle'],
    }),
  ];
};

/**
 * 文字颜色扩展对象
 */
export const TextColorExtension = {
  /** 扩展名称 */
  name: 'textColor',
  
  /** 依赖的扩展 */
  dependencies: ['textStyle', 'color'],
  
  /** 可用颜色列表 */
  colors: DEFAULT_TEXT_COLORS,
  
  /**
   * 创建扩展实例
   */
  createExtension: createTextColorExtension,
  
  /**
   * 渲染工具栏按钮配置
   * @param options - 可选的颜色配置
   * @returns 工具栏按钮配置对象
   */
  renderToolbarButton: (options?: { colors?: TextColorOption[] }): ToolbarButtonConfig & {
    type: 'color-picker' | 'dropdown';
    colorOptions?: TextColorOption[];
    allowCustomColor?: boolean;
  } => {
    const colors = options?.colors || DEFAULT_TEXT_COLORS;
    
    return {
      name: 'textColor',
      label: '文字颜色',
      type: 'color-picker',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 20h16"></path>
        <path d="m6 16 6-12 6 12"></path>
        <path d="M8 12h8"></path>
      </svg>`,
      tooltip: '文字颜色',
      isActive: (editor: Editor) => editor.isActive('textStyle'),
      onClick: (editor: Editor) => {
        // 默认设置为黑色
        editor.chain().focus().setColor('#000000').run();
      },
      isDisabled: (editor: Editor) => !editor.can().chain().focus().setColor().run(),
      colorOptions: colors,
      allowCustomColor: true,
    };
  },
  
  /**
   * 设置文字颜色
   * @param editor - 编辑器实例
   * @param color - 颜色值 (CSS 颜色值或 inherit 重置为默认)
   */
  setColor: (editor: Editor, color: string) => {
    if (color === 'inherit' || color === 'default') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
  },
  
  /**
   * 取消文字颜色（重置为默认）
   * @param editor - 编辑器实例
   */
  unsetColor: (editor: Editor) => {
    editor.chain().focus().unsetColor().run();
  },
  
  /**
   * 获取当前选区的文字颜色
   * @param editor - 编辑器实例
   * @returns 当前颜色值，如果没有则返回 undefined
   */
  getCurrentColor: (editor: Editor): string | undefined => {
    const { color } = editor.getAttributes('textStyle');
    return color;
  },
  
  /**
   * 序列化配置
   */
  serializeConfig: {
    /** 导出为 HTML 时的处理 */
    toHTML: {
      open: (attrs: { color?: string }) => attrs.color ? `<span style="color: ${attrs.color}">` : '<span>',
      close: '</span>',
    },
    /** 导出为 Markdown 时的处理 (使用 HTML 标签) */
    toMarkdown: {
      open: (attrs: { color?: string }) => attrs.color ? `<span style="color: ${attrs.color}">` : '',
      close: '</span>',
    },
    /** 从 HTML 解析时的处理 */
    parseHTML: {
      tag: 'span[style]',
      getAttrs: (element: HTMLElement) => {
        const color = element.style.color;
        return color ? { color } : false;
      },
    },
  },
};

// 默认导出
export default TextColorExtension;
