/**
 * WheelChair Editor - Table Row Extension
 * 
 * 表格行扩展
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface TableRowOptions {
  HTMLAttributes: Record<string, any>;
}

export const TableRow = Node.create<TableRowOptions>({
  name: 'tableRow',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: '(tableCell | tableHeader)*',

  group: 'tableRow',

  parseHTML() {
    return [
      { tag: 'tr' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});

export default TableRow;
