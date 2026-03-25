import { Extension } from '@tiptap/core';
import { ToolbarButton, ToolbarDropdown } from '../../types';

export interface TextAlignOptions {
  types: string[];
  alignments: string[];
  defaultAlignment: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textAlign: {
      /**
       * Set the text alignment
       */
      setTextAlign: (alignment: string) => ReturnType;
      /**
       * Unset the text alignment
       */
      unsetTextAlign: () => ReturnType;
    };
  }
}

export const TextAlign = Extension.create<TextAlignOptions>({
  name: 'textAlign',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element) => {
              const alignment = element.style.textAlign || this.options.defaultAlignment;
              return this.options.alignments.includes(alignment) ? alignment : this.options.defaultAlignment;
            },
            renderHTML: (attributes) => {
              if (attributes.textAlign === this.options.defaultAlignment) {
                return {};
              }

              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign: (alignment: string) => ({ commands }) => {
        if (!this.options.alignments.includes(alignment)) {
          return false;
        }

        return this.options.types.every((type) => commands.updateAttributes(type, { textAlign: alignment }));
      },
      unsetTextAlign: () => ({ commands }) => {
        return this.options.types.every((type) => commands.resetAttributes(type, 'textAlign'));
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-l': () => this.editor.commands.setTextAlign('left'),
      'Mod-e': () => this.editor.commands.setTextAlign('center'),
      'Mod-r': () => this.editor.commands.setTextAlign('right'),
      'Mod-j': () => this.editor.commands.setTextAlign('justify'),
    };
  },

  renderToolbarButton(): ToolbarDropdown {
    const alignmentIcons: Record<string, string> = {
      left: 'align-left',
      center: 'align-center',
      right: 'align-right',
      justify: 'align-justify',
    };

    const alignmentTitles: Record<string, string> = {
      left: '左对齐',
      center: '居中对齐',
      right: '右对齐',
      justify: '两端对齐',
    };

    const shortcuts: Record<string, string> = {
      left: 'Ctrl+L',
      center: 'Ctrl+E',
      right: 'Ctrl+R',
      justify: 'Ctrl+J',
    };

    return {
      type: 'dropdown',
      name: this.name,
      title: '对齐',
      icon: 'align-left',
      items: this.options.alignments.map((alignment): ToolbarButton => ({
        name: `align-${alignment}`,
        title: alignmentTitles[alignment] || alignment,
        icon: alignmentIcons[alignment] || 'align-left',
        action: () => this.editor.commands.setTextAlign(alignment),
        isActive: () => this.editor.isActive({ textAlign: alignment }),
        shortcut: shortcuts[alignment],
      })),
      isActive: () => this.options.alignments.some((alignment) => 
        this.editor.isActive({ textAlign: alignment })
      ),
    };
  },
});

export default TextAlign;
