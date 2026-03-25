import { Node, mergeAttributes } from '@tiptap/core';
import { ToolbarButton, ToolbarDropdown } from '../../types';

export interface HeadingOptions {
  levels: number[];
  HTMLAttributes: Record<string, any>;
}

export interface HeadingAttributes {
  level: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    heading: {
      /**
       * Set a heading node
       */
      setHeading: (attributes: HeadingAttributes) => ReturnType;
      /**
       * Toggle a heading node
       */
      toggleHeading: (attributes: HeadingAttributes) => ReturnType;
      /**
       * Unset a heading node
       */
      unsetHeading: () => ReturnType;
    };
  }
}

export const Heading = Node.create<HeadingOptions>({
  name: 'heading',

  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {},
    };
  },

  content: 'inline*',

  group: 'block',

  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false,
      },
    };
  },

  parseHTML() {
    return this.options.levels
      .map((level: number) => ({
        tag: `h${level}`,
        attrs: { level },
      }));
  },

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];

    return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setHeading: (attributes: HeadingAttributes) => ({ commands }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false;
        }

        return commands.setNode(this.name, attributes);
      },
      toggleHeading: (attributes: HeadingAttributes) => ({ commands }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false;
        }

        return commands.toggleNode(this.name, 'paragraph', attributes);
      },
      unsetHeading: () => ({ commands }) => {
        return commands.lift(this.name);
      },
    };
  },

  addKeyboardShortcuts() {
    return this.options.levels.reduce(
      (items: Record<string, () => boolean>, level: number) => ({
        ...items,
        ...{
          [`Mod-${level}`]: () => this.editor.commands.toggleHeading({ level }),
        },
      }),
      {},
    );
  },

  renderToolbarButton(): ToolbarDropdown {
    const levelTitles: Record<number, string> = {
      1: '标题 1',
      2: '标题 2',
      3: '标题 3',
      4: '标题 4',
      5: '标题 5',
      6: '标题 6',
    };

    return {
      type: 'dropdown',
      name: this.name,
      title: '标题',
      icon: 'heading',
      items: this.options.levels.map((level: number): ToolbarButton => ({
        name: `heading-${level}`,
        title: levelTitles[level] || `H${level}`,
        icon: `h${level}`,
        action: () => this.editor.commands.toggleHeading({ level }),
        isActive: () => this.editor.isActive(this.name, { level }),
        shortcut: `Ctrl+${level}`,
      })),
      isActive: () => this.editor.isActive(this.name),
    };
  },
});

export default Heading;
