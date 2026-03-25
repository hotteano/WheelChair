/**
 * WheelChair Editor - Table Extension
 * 
 * 表格容器扩展
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ToolbarButton } from '../../types';

export interface TableOptions {
  HTMLAttributes: Record<string, any>;
  resizable: boolean;
  handleWidth: number;
  cellMinWidth: number;
  lastColumnResizable: boolean;
  allowTableNodeSelection: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    table: {
      /**
       * Insert a table
       */
      insertTable: (options?: { rows?: number; cols?: number; withHeaderRow?: boolean }) => ReturnType;
      /**
       * Delete the current table
       */
      deleteTable: () => ReturnType;
      /**
       * Add a column before the current position
       */
      addColumnBefore: () => ReturnType;
      /**
       * Add a column after the current position
       */
      addColumnAfter: () => ReturnType;
      /**
       * Delete the current column
       */
      deleteColumn: () => ReturnType;
      /**
       * Add a row before the current position
       */
      addRowBefore: () => ReturnType;
      /**
       * Add a row after the current position
       */
      addRowAfter: () => ReturnType;
      /**
       * Delete the current row
       */
      deleteRow: () => ReturnType;
      /**
       * Merge selected cells
       */
      mergeCells: () => ReturnType;
      /**
       * Split the current cell
       */
      splitCell: () => ReturnType;
      /**
       * Toggle header row
       */
      toggleHeaderRow: () => ReturnType;
      /**
       * Toggle header column
       */
      toggleHeaderColumn: () => ReturnType;
      /**
       * Set cell background color
       */
      setCellAttribute: (name: string, value: any) => ReturnType;
      /**
       * Go to the next cell
       */
      goToNextCell: () => ReturnType;
      /**
       * Go to the previous cell
       */
      goToPreviousCell: () => ReturnType;
      /**
       * Fix all tables in the document
       */
      fixTables: () => ReturnType;
    };
  }
}

export const Table = Node.create<TableOptions>({
  name: 'table',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'wheelchair-table',
      },
      resizable: false,
      handleWidth: 5,
      cellMinWidth: 100,
      lastColumnResizable: true,
      allowTableNodeSelection: false,
    };
  },

  content: 'tableRow+',

  group: 'block',

  isolating: true,

  parseHTML() {
    return [
      { tag: 'table' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'table',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ['tbody', 0],
    ];
  },

  addCommands() {
    return {
      insertTable: ({ rows = 3, cols = 3, withHeaderRow = true } = {}) => ({ chain, editor }) => {
        const nodes = [];
        
        // 创建表头行
        if (withHeaderRow) {
          const headerCells = [];
          for (let c = 0; c < cols; c++) {
            headerCells.push({
              type: 'tableHeader',
              content: [{ type: 'paragraph' }],
            });
          }
          nodes.push({
            type: 'tableRow',
            content: headerCells,
          });
        }
        
        // 创建数据行
        for (let r = 0; r < (withHeaderRow ? rows - 1 : rows); r++) {
          const cells = [];
          for (let c = 0; c < cols; c++) {
            cells.push({
              type: 'tableCell',
              content: [{ type: 'paragraph' }],
            });
          }
          nodes.push({
            type: 'tableRow',
            content: cells,
          });
        }

        return chain()
          .insertContent({
            type: this.name,
            content: nodes,
          })
          .focus()
          .run();
      },

      deleteTable: () => ({ state, dispatch }) => {
        const { $from } = state.selection;
        const tablePos = $from.before(1);
        const tableNode = $from.node(1);
        
        if (tableNode && tableNode.type.name === 'table') {
          if (dispatch) {
            const tr = state.tr.delete(tablePos, tablePos + tableNode.nodeSize);
            dispatch(tr);
          }
          return true;
        }
        return false;
      },

      addColumnBefore: () => ({ state, dispatch }) => {
        const { $from } = state.selection;
        const tableDepth = $from.depth - 1;
        const tablePos = $from.start(tableDepth) - 1;
        const tableNode = $from.node(tableDepth);
        const cellIndex = $from.index($from.depth - 1);
        
        if (!tableNode || tableNode.type.name !== 'table') return false;
        
        if (dispatch) {
          const tr = state.tr;
          
          tableNode.content.forEach((row, rowIndex) => {
            const rowPos = tr.doc.resolve(tablePos + 1).start(rowIndex + 1) - 1;
            const cellType = row.child(cellIndex).type.name === 'tableHeader' ? 'tableHeader' : 'tableCell';
            const newCell = state.schema.nodes[cellType].createAndFill();
            if (newCell) {
              const insertPos = rowPos + 1;
              for (let i = 0; i < cellIndex; i++) {
                tr.doc.nodeAt(rowPos + 1 + i * 2)?.nodeSize;
              }
              tr.insert(rowPos + 1 + (cellIndex * 2), newCell);
            }
          });
          
          dispatch(tr);
        }
        return true;
      },

      addColumnAfter: () => ({ state, dispatch }) => {
        const { $from } = state.selection;
        const tableDepth = $from.depth - 1;
        const tablePos = $from.start(tableDepth) - 1;
        const tableNode = $from.node(tableDepth);
        const cellIndex = $from.index($from.depth - 1);
        
        if (!tableNode || tableNode.type.name !== 'table') return false;
        
        if (dispatch) {
          const tr = state.tr;
          
          tableNode.content.forEach((row, rowIndex) => {
            const rowStart = tablePos + 1;
            let currentPos = rowStart;
            
            for (let i = 0; i < rowIndex; i++) {
              currentPos += tableNode.child(i).nodeSize;
            }
            currentPos += 1; // row tag
            
            for (let i = 0; i <= cellIndex; i++) {
              currentPos += row.child(i).nodeSize;
            }
            
            const cellType = rowIndex === 0 && tableNode.child(0).child(0).type.name === 'tableHeader' 
              ? 'tableHeader' 
              : 'tableCell';
            const newCell = state.schema.nodes[cellType].createAndFill();
            if (newCell) {
              tr.insert(currentPos, newCell);
            }
          });
          
          dispatch(tr);
        }
        return true;
      },

      deleteColumn: () => ({ state, dispatch }) => {
        const { $from } = state.selection;
        const tablePos = $from.before(1);
        const tableNode = $from.node(1);
        const cellIndex = $from.index($from.depth - 1);
        
        if (!tableNode || tableNode.type.name !== 'table') return false;
        
        if (dispatch) {
          const tr = state.tr;
          let pos = tablePos + 2; // 跳过 table 和 tbody 标签
          
          tableNode.content.forEach((row) => {
            let cellPos = pos + 1; // 跳过 tr 标签
            for (let i = 0; i < cellIndex; i++) {
              cellPos += row.child(i).nodeSize;
            }
            tr.delete(cellPos, cellPos + row.child(cellIndex).nodeSize);
            pos += row.nodeSize;
          });
          
          dispatch(tr);
        }
        return true;
      },

      addRowBefore: () => ({ state, dispatch }) => {
        const { $from } = state.selection;
        const tableDepth = $from.depth - 1;
        const tableNode = $from.node(tableDepth);
        const rowIndex = $from.index(tableDepth);
        
        if (!tableNode || tableNode.type.name !== 'table') return false;
        
        if (dispatch) {
          const tr = state.tr;
          const rowPos = $from.before(tableDepth);
          const firstRow = tableNode.child(0);
          const cells = [];
          
          for (let i = 0; i < firstRow.childCount; i++) {
            const cellType = firstRow.child(i).type.name === 'tableHeader' ? 'tableHeader' : 'tableCell';
            cells.push(state.schema.nodes[cellType].createAndFill()!);
          }
          
          const newRow = state.schema.nodes.tableRow.create(null, cells);
          tr.insert(rowPos, newRow);
          dispatch(tr);
        }
        return true;
      },

      addRowAfter: () => ({ state, dispatch }) => {
        const { $from } = state.selection;
        const tableDepth = $from.depth - 1;
        const tableNode = $from.node(tableDepth);
        const rowIndex = $from.index(tableDepth);
        
        if (!tableNode || tableNode.type.name !== 'table') return false;
        
        if (dispatch) {
          const tr = state.tr;
          const rowPos = $from.after(tableDepth);
          const firstRow = tableNode.child(0);
          const cells = [];
          
          for (let i = 0; i < firstRow.childCount; i++) {
            cells.push(state.schema.nodes.tableCell.createAndFill()!);
          }
          
          const newRow = state.schema.nodes.tableRow.create(null, cells);
          tr.insert(rowPos, newRow);
          dispatch(tr);
        }
        return true;
      },

      deleteRow: () => ({ state, dispatch }) => {
        const { $from } = state.selection;
        const rowDepth = $from.depth - 1;
        const rowPos = $from.before(rowDepth);
        const rowNode = $from.node(rowDepth);
        
        if (!rowNode || rowNode.type.name !== 'tableRow') return false;
        
        if (dispatch) {
          const tr = state.tr.delete(rowPos, rowPos + rowNode.nodeSize);
          dispatch(tr);
        }
        return true;
      },

      mergeCells: () => ({ state, dispatch }) => {
        // 简化实现：不支持合并单元格
        return false;
      },

      splitCell: () => ({ state, dispatch }) => {
        // 简化实现：不支持拆分单元格
        return false;
      },

      toggleHeaderRow: () => ({ state, dispatch }) => {
        const { $from } = state.selection;
        const tableNode = $from.node(1);
        
        if (!tableNode || tableNode.type.name !== 'table') return false;
        
        const firstRow = tableNode.child(0);
        const isHeader = firstRow.child(0).type.name === 'tableHeader';
        
        if (dispatch) {
          const tr = state.tr;
          const tablePos = $from.before(1);
          
          // 遍历第一行的所有单元格
          let pos = tablePos + 3; // table + tbody + tr
          firstRow.forEach((cell) => {
            const newType = isHeader ? 'tableCell' : 'tableHeader';
            const newCell = state.schema.nodes[newType].create(
              cell.attrs,
              cell.content
            );
            tr.replaceWith(pos, pos + cell.nodeSize, newCell);
            pos += newCell.nodeSize;
          });
          
          dispatch(tr);
        }
        return true;
      },

      toggleHeaderColumn: () => () => {
        // 简化实现
        return false;
      },

      setCellAttribute: (name, value) => ({ state, dispatch }) => {
        const { $from } = state.selection;
        const cellNode = $from.node($from.depth);
        const cellPos = $from.before($from.depth);
        
        if (!cellNode || (cellNode.type.name !== 'tableCell' && cellNode.type.name !== 'tableHeader')) {
          return false;
        }
        
        if (dispatch) {
          const attrs = { ...cellNode.attrs, [name]: value };
          const tr = state.tr.setNodeMarkup(cellPos, null, attrs);
          dispatch(tr);
        }
        return true;
      },

      goToNextCell: () => ({ state, dispatch }) => {
        const { $from } = state.selection;
        const rowNode = $from.node($from.depth - 1);
        const cellIndex = $from.index($from.depth - 1);
        
        if (cellIndex < rowNode.childCount - 1) {
          // 移动到下一个单元格
          const nextCell = rowNode.child(cellIndex + 1);
          const pos = $from.after($from.depth - 1) + 1;
          if (dispatch) {
            dispatch(state.tr.setSelection(state.selection.constructor.near(state.doc.resolve(pos))));
          }
        }
        return true;
      },

      goToPreviousCell: () => () => {
        return false;
      },

      fixTables: () => () => {
        return false;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Tab 键移动到下一个单元格
      Tab: ({ editor }) => {
        if (!editor.isActive('table')) return false;
        return editor.commands.goToNextCell();
      },
      // Shift+Tab 移动到上一个单元格
      'Shift-Tab': ({ editor }) => {
        if (!editor.isActive('table')) return false;
        return editor.commands.goToPreviousCell();
      },
      // Backspace 在空单元格中不删除行
      Backspace: ({ editor }) => {
        if (!editor.isActive('table')) return false;
        const { empty } = editor.state.selection;
        if (!empty) return false;
        // 允许默认行为
        return false;
      },
    };
  },

  renderToolbarButton(): ToolbarButton {
    return {
      name: this.name,
      title: '插入表格',
      icon: 'table',
      action: () => this.editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
      isActive: () => this.editor.isActive(this.name),
    };
  },
});

export default Table;
