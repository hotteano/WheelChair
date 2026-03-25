import { Node, mergeAttributes, wrappingInputRule } from '@tiptap/core';
import { ToolbarButton } from '../../types';

export interface BlockquoteOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockquote: {
      /**
       * Set a blockquote node
       */
      setBlockquote: () => ReturnType;
      /**
       * Toggle a blockquote node
       */
      toggleBlockquote: () => ReturnType;
      /**
       * Unset a blockquote node
       */
      unsetBlockquote: () => ReturnType;
    };
  }
}

export const inputRegex = /^>\s$/;

export const Blockquote = Node.create<BlockquoteOptions>({
  name: 'blockquote',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'block+',

  group: 'block',

  defining: true,

  parseHTML() {
    return [
      { tag: 'blockquote' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['blockquote', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setBlockquote: () => ({ commands }) => {
        return commands.wrapIn(this.name);
      },
      toggleBlockquote: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
      unsetBlockquote: () => ({ commands }) => {
        return commands.lift(this.name);
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-q': () => this.editor.commands.toggleBlockquote(),
    };
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ];
  },

  renderToolbarButton(): ToolbarButton {
    return {
      name: this.name,
      title: '引用',
      icon: 'quote',
      action: () => this.editor.commands.toggleBlockquote(),
      isActive: () => this.editor.isActive(this.name),
      shortcut: 'Ctrl+Shift+Q',
    };
  },
});

export default Blockquote;
