import { Node, mergeAttributes } from '@tiptap/core';
import { ToolbarButton } from '../../types';

export interface ListItemOptions {
  HTMLAttributes: Record<string, any>;
  bulletListTypeName: string;
  orderedListTypeName: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    listItem: {
      /**
       * Split list item
       */
      splitListItem: () => ReturnType;
      /**
       * Sink list item (indent)
       */
      sinkListItem: () => ReturnType;
      /**
       * Lift list item (unindent)
       */
      liftListItem: () => ReturnType;
    };
  }
}

export const ListItem = Node.create<ListItemOptions>({
  name: 'listItem',

  addOptions() {
    return {
      HTMLAttributes: {},
      bulletListTypeName: 'bulletList',
      orderedListTypeName: 'orderedList',
    };
  },

  content: 'paragraph block*',

  defining: true,

  parseHTML() {
    return [
      { tag: 'li' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      splitListItem: () => ({ state, dispatch }) => {
        const { selection, tr } = state;
        const { $from, $to } = selection;
        const node = state.doc.nodeAt($from.pos);

        if (!node || !node.type.name.includes(this.name)) {
          return false;
        }

        if (dispatch) {
          if ($from.parent.childCount === 0 && $from.parentOffset === 0) {
            // Remove empty list item
            return this.editor.commands.liftListItem();
          }

          // Split the list item
          tr.split($from.pos, 1, [{ type: this.type }]);
          dispatch(tr);
        }

        return true;
      },
      sinkListItem: () => ({ state, dispatch }) => {
        const { selection } = state;
        const { $from } = selection;

        const parentList = $from.node(-1);
        const currentItem = $from.node(-1);

        if (!parentList || !currentItem) {
          return false;
        }

        // Check if we can sink (there's a previous item to wrap into)
        const previousItemIndex = $from.index(-1) - 1;
        if (previousItemIndex < 0) {
          return false;
        }

        if (dispatch) {
          // Wrap the current item into a new list inside the previous item
          const listType = parentList.type;
          const tr = state.tr;

          // Create a new list in the previous item if it doesn't have one
          const previousItemEnd = $from.start(-1) + $from.node(-1).child(previousItemIndex).nodeSize;
          tr.wrap(tr.doc.resolve(previousItemEnd - 1).blockRange()!, [listType]);

          dispatch(tr);
        }

        return true;
      },
      liftListItem: () => ({ state, dispatch }) => {
        const { selection } = state;
        const { $from } = selection;

        const currentItem = $from.node(-1);

        if (!currentItem) {
          return false;
        }

        if (dispatch) {
          const tr = state.tr;
          const range = $from.blockRange();

          if (range) {
            tr.lift(range, 0);
            dispatch(tr);
          }
        }

        return true;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(),
      Tab: () => this.editor.commands.sinkListItem(),
      'Shift-Tab': () => this.editor.commands.liftListItem(),
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        const { $from, empty } = selection;

        if (!empty || $from.parentOffset !== 0) {
          return false;
        }

        // If at the start of a list item, lift it
        if ($from.node(-1)?.type.name === this.name) {
          return editor.commands.liftListItem();
        }

        return false;
      },
    };
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('li');
      const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);
      
      Object.entries(attrs).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          dom.setAttribute(key, String(value));
        }
      });

      // Add nesting level indicator class
      let depth = 0;
      let $pos = editor.state.doc.resolve(getPos());
      for (let i = $pos.depth; i > 0; i--) {
        if ($pos.node(i).type.name === this.options.bulletListTypeName ||
            $pos.node(i).type.name === this.options.orderedListTypeName) {
          depth++;
        }
      }
      
      if (depth > 1) {
        dom.classList.add(`list-item-level-${depth}`);
      }

      return {
        dom,
        contentDOM: dom,
      };
    };
  },

  renderToolbarButton(): ToolbarButton {
    return {
      name: this.name,
      title: '列表项',
      icon: 'list-item',
      action: () => {
        // List items are created automatically when creating lists
        return true;
      },
      isActive: () => this.editor.isActive(this.name),
      disabled: true, // List items can't be created directly
    };
  },
});

export default ListItem;
