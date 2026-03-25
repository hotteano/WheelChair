/**
 * WheelChair Editor - Table Cell Extension
 * 
 * 表格单元格扩展
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface TableCellOptions {
  HTMLAttributes: Record<string, any>;
}

export interface TableCellAttributes {
  colspan?: number;
  rowspan?: number;
  colwidth?: number[];
  backgroundColor?: string;
  borderColor?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableCell = Node.create<TableCellOptions>({
  name: 'tableCell',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'block+',

  group: 'tableCell',

  isolating: true,

  addAttributes() {
    return {
      colspan: {
        default: 1,
        parseHTML: element => {
          const colspan = element.getAttribute('colspan');
          return colspan ? parseInt(colspan, 10) : 1;
        },
      },
      rowspan: {
        default: 1,
        parseHTML: element => {
          const rowspan = element.getAttribute('rowspan');
          return rowspan ? parseInt(rowspan, 10) : 1;
        },
      },
      colwidth: {
        default: null,
        parseHTML: element => {
          const colwidth = element.getAttribute('colwidth');
          return colwidth ? colwidth.split(',').map(w => parseInt(w, 10)) : null;
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || element.getAttribute('data-background-color'),
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {};
          return {
            style: `background-color: ${attributes.backgroundColor}`,
            'data-background-color': attributes.backgroundColor,
          };
        },
      },
      borderColor: {
        default: null,
        parseHTML: element => element.style.borderColor || element.getAttribute('data-border-color'),
        renderHTML: attributes => {
          if (!attributes.borderColor) return {};
          return {
            style: `border-color: ${attributes.borderColor}`,
            'data-border-color': attributes.borderColor,
          };
        },
      },
      align: {
        default: 'left',
        parseHTML: element => {
          const align = element.style.textAlign || element.getAttribute('align');
          return ['left', 'center', 'right'].includes(align) ? align : 'left';
        },
        renderHTML: attributes => {
          if (!attributes.align || attributes.align === 'left') return {};
          return {
            style: `text-align: ${attributes.align}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'td' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { colspan, rowspan } = node.attrs;
    
    return [
      'td',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        colspan: colspan > 1 ? colspan : undefined,
        rowspan: rowspan > 1 ? rowspan : undefined,
      }),
      0,
    ];
  },
});

export default TableCell;
