import { Node, mergeAttributes, wrappingInputRule } from '@tiptap/core';
import { ToolbarButton } from '../../types';

export interface OrderedListOptions {
  itemTypeName: string;
  HTMLAttributes: Record<string, any>;
  keepMarks: boolean;
  keepAttributes: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    orderedList: {
      /**
       * Toggle an ordered list
       */
      toggleOrderedList: () => ReturnType;
    };
  }
}

export const inputRegex = /^(\d+)\.\s$/;

export const OrderedList = Node.create<OrderedListOptions>({
  name: 'orderedList',

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

  addAttributes() {
    return {
      order: {
        default: 1,
        parseHTML: (element) => {
          const order = element.getAttribute('start');
          return order ? parseInt(order, 10) : 1;
        },
        renderHTML: (attributes) => {
          if (attributes.order === 1) {
            return {};
          }

          return {
            start: attributes.order,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'ol' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { start, ...rest } = HTMLAttributes;
    return ['ol', mergeAttributes(this.options.HTMLAttributes, rest, { start, class: 'ordered-list' }), 0];
  },

  addCommands() {
    return {
      toggleOrderedList: () => ({ commands, chain }) => {
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
      'Mod-Shift-o': () => this.editor.commands.toggleOrderedList(),
    };
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => ({ order: parseInt(match[1], 10) }),
        joinPredicate: (match, node) => node.childCount + node.attrs.order === parseInt(match[1], 10),
      }),
    ];
  },

  renderToolbarButton(): ToolbarButton {
    return {
      name: this.name,
      title: '有序列表',
      icon: 'list-ordered',
      action: () => this.editor.commands.toggleOrderedList(),
      isActive: () => this.editor.isActive(this.name),
      shortcut: 'Ctrl+Shift+O',
    };
  },
});

// Import ListItem for type reference
import { ListItem } from './ListItem';

export default OrderedList;
