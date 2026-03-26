/**
 * WheelChair Editor - Math Commands
 * 数学公式相关命令
 */

import { Editor, ChainedCommands } from '@tiptap/core';

export interface MathCommands {
  /**
   * 插入行内公式
   * @param latex LaTeX 代码
   */
  insertInlineMath: (latex?: string) => ChainedCommands;
  
  /**
   * 插入块级公式
   * @param latex LaTeX 代码
   */
  insertBlockMath: (latex?: string) => ChainedCommands;
  
  /**
   * 更新公式
   * @param pos 公式位置
   * @param latex 新的 LaTeX 代码
   */
  updateMath: (pos: number, latex: string) => ChainedCommands;
  
  /**
   * 删除公式
   * @param pos 公式位置
   */
  deleteMath: (pos: number) => ChainedCommands;
}

/**
 * 插入行内公式
 */
export const insertInlineMath = (
  editor: Editor,
  latex: string = ''
): boolean => {
  return editor
    .chain()
    .focus()
    .insertContent({
      type: 'inlineMath',
      attrs: { latex },
    })
    .run();
};

/**
 * 插入块级公式
 */
export const insertBlockMath = (
  editor: Editor,
  latex: string = ''
): boolean => {
  return editor
    .chain()
    .focus()
    .insertContent({
      type: 'blockMath',
      attrs: { latex },
    })
    .insertContent({ type: 'paragraph' }) // 插入空段落
    .run();
};

/**
 * 更新公式
 */
export const updateMath = (
  editor: Editor,
  pos: number,
  latex: string
): boolean => {
  const node = editor.state.doc.nodeAt(pos);
  if (!node || (node.type.name !== 'inlineMath' && node.type.name !== 'blockMath')) {
    return false;
  }
  
  return editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.setNodeMarkup(pos, undefined, { latex });
      return true;
    })
    .run();
};

/**
 * 删除公式
 */
export const deleteMath = (editor: Editor, pos: number): boolean => {
  const node = editor.state.doc.nodeAt(pos);
  if (!node || (node.type.name !== 'inlineMath' && node.type.name !== 'blockMath')) {
    return false;
  }
  
  return editor
    .chain()
    .focus()
    .deleteRange({ from: pos, to: pos + node.nodeSize })
    .run();
};

/**
 * 检查当前位置是否是公式
 */
export const isMath = (editor: Editor): boolean => {
  return editor.isActive('inlineMath') || editor.isActive('blockMath');
};

/**
 * 获取当前公式内容
 */
export const getMathContent = (editor: Editor): string | null => {
  const { from } = editor.state.selection;
  const node = editor.state.doc.nodeAt(from);
  
  if (node && (node.type.name === 'inlineMath' || node.type.name === 'blockMath')) {
    return (node.attrs.latex as string) || '';
  }
  
  return null;
};

export default {
  insertInlineMath,
  insertBlockMath,
  updateMath,
  deleteMath,
  isMath,
  getMathContent,
};
