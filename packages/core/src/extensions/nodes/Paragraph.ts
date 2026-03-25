import { Node, mergeAttributes } from '@tiptap/core';
import { ToolbarButton } from '../../types';

export interface ParagraphOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraph: {
      /**
       * Toggle paragraph
       */
      setParagraph: () => ReturnType;
    };
  }
}

export const Paragraph = Node.create<ParagraphOptions>({
  name: 'paragraph',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      { tag: 'p' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setParagraph: () => ({ commands }) => {
        return commands.setNode(this.name);
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.setParagraph(),
    };
  },

  renderToolbarButton(): ToolbarButton {
    return {
      name: this.name,
      title: '段落',
      icon: 'paragraph',
      action: () => this.editor.commands.setParagraph(),
      isActive: () => this.editor.isActive(this.name),
      shortcut: 'Ctrl+Alt+0',
    };
  },
});

export default Paragraph;
