import { Node, mergeAttributes, wrappingInputRule } from '@tiptap/core';
import { ToolbarButton } from '../../types';

export interface BulletListOptions {
  itemTypeName: string;
  HTMLAttributes: Record<string, any>;
  keepMarks: boolean;
  keepAttributes: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bulletList: {
      /**
       * Toggle a bullet list
       */
      toggleBulletList: () => ReturnType;
    };
  }
}

export const inputRegex = /^\s*[*-]\s$/;

export const BulletList = Node.create<BulletListOptions>({
  name: 'bulletList',

  addOptions() {
    return {
      itemTypeName: 'listItem',
      HTMLAttributes: {},
      keepMarks: false,
      keepAttributes: false,
    };
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`;
  },

  parseHTML() {
    return [
      { tag: 'ul' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'bullet-list' }), 0];
  },

  addCommands() {
    return {
      toggleBulletList: () => ({ commands, chain }) => {
        if (this.options.keepAttributes) {
          return chain()
            .toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
            .updateAttributes(ListItem.name, this.editor.getAttributes('textStyle'))
            .run();
        }

        return commands.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks);
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-u': () => this.editor.commands.toggleBulletList(),
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
      title: '无序列表',
      icon: 'list-unordered',
      action: () => this.editor.commands.toggleBulletList(),
      isActive: () => this.editor.isActive(this.name),
      shortcut: 'Ctrl+Shift+U',
    };
  },
});

// Import ListItem for type reference
import { ListItem } from './ListItem';

export default BulletList;
