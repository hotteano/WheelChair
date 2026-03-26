/**
 * WheelChair Editor - Code Block Extension
 * 
 * 代码块扩展，支持语法高亮、语言选择和复制功能
 */

import { Node, mergeAttributes, textblockTypeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ToolbarButton } from '../../types';
import { CodeBlockView } from '../../components/CodeBlock/CodeBlockView';

export interface CodeBlockOptions {
  HTMLAttributes: Record<string, any>;
  languages: string[];
  defaultLanguage: string | null | undefined;
  showLineNumbers: boolean;
}

export interface CodeBlockAttributes {
  language?: string;
  showLineNumbers?: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeBlock: {
      /**
       * Set a code block
       */
      setCodeBlock: (attributes?: { language: string }) => ReturnType;
      /**
       * Toggle a code block
       */
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType;
    };
  }
}

/**
 * 支持的编程语言列表
 */
export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: 'js' },
  { value: 'typescript', label: 'TypeScript', icon: 'ts' },
  { value: 'python', label: 'Python', icon: 'py' },
  { value: 'html', label: 'HTML', icon: 'html' },
  { value: 'css', label: 'CSS', icon: 'css' },
  { value: 'json', label: 'JSON', icon: 'json' },
  { value: 'markdown', label: 'Markdown', icon: 'md' },
  { value: 'sql', label: 'SQL', icon: 'sql' },
  { value: 'bash', label: 'Bash/Shell', icon: 'sh' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['value'];

/**
 * 代码块输入规则正则表达式
 * 匹配 ```language 或 ``` 开头的行
 */
export const codeBlockInputRegex = /^```([a-zA-Z0-9]+)?\s$/;

export const CodeBlock = Node.create<CodeBlockOptions>({
  name: 'codeBlock',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'code-block',
      },
      languages: SUPPORTED_LANGUAGES.map(l => l.value),
      defaultLanguage: null,
      showLineNumbers: false,
    };
  },

  content: 'text*',

  marks: '',

  group: 'block',

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: this.options.defaultLanguage,
        parseHTML: element => element.getAttribute('data-language') || element.querySelector('code')?.getAttribute('class')?.replace(/^language-/, ''),
        renderHTML: attributes => ({
          'data-language': attributes.language,
        }),
      },
      showLineNumbers: {
        default: this.options.showLineNumbers,
        parseHTML: element => element.hasAttribute('data-line-numbers'),
        renderHTML: attributes => attributes.showLineNumbers ? { 'data-line-numbers': '' } : {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      [
        'code',
        {
          class: node.attrs.language ? `language-${node.attrs.language}` : null,
        },
        0,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },

  addCommands() {
    return {
      setCodeBlock: (attributes) => ({ commands }) => {
        return commands.setNode(this.name, attributes);
      },
      toggleCodeBlock: (attributes) => ({ commands }) => {
        return commands.toggleNode(this.name, 'paragraph', attributes);
      },
      unsetCodeBlock: () => ({ commands }) => {
        return commands.lift(this.name);
      },
      updateCodeBlockLanguage: (language) => ({ chain }) => {
        return chain()
          .focus()
          .updateAttributes(this.name, { language })
          .run();
      },
      toggleCodeBlockLineNumbers: () => ({ chain, editor }) => {
        const isActive = editor.isActive(this.name);
        if (!isActive) return false;
        
        const currentValue = editor.getAttributes(this.name).showLineNumbers || false;
        return chain()
          .focus()
          .updateAttributes(this.name, { showLineNumbers: !currentValue })
          .run();
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => this.editor.commands.toggleCodeBlock(),
      'Mod-Shift-C': () => this.editor.commands.toggleCodeBlock(),
      // 在代码块内按 Enter 创建新行而不是新段落
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty || $from.parent.type.name !== this.name) {
          return false;
        }

        return editor.commands.insertContent('\n');
      },
      // 在代码块开头按 Backspace 解除代码块
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty || $from.parent.type.name !== this.name) {
          return false;
        }

        const isAtStart = $from.parentOffset === 0;
        const isEmpty = $from.parent.textContent.length === 0;

        if (isAtStart && isEmpty) {
          return editor.commands.toggleCodeBlock();
        }

        return false;
      },
    };
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: codeBlockInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1] || this.options.defaultLanguage,
        }),
      }),
    ];
  },

  renderToolbarButton(): ToolbarButton {
    return {
      name: this.name,
      title: '代码块',
      icon: 'code',
      action: () => this.editor.commands.toggleCodeBlock(),
      isActive: () => this.editor.isActive(this.name),
      shortcut: 'Ctrl+Shift+C',
    };
  },
});

export default CodeBlock;
