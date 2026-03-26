/**
 * WheelChair Editor - Math Input Rules
 * 数学公式输入规则
 */

import { InputRule } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

/**
 * 行内公式输入规则: $...$
 * 输入 $E=mc^2$ 后按空格或回车自动转换
 */
export function createInlineMathRule(inlineMathType: any): InputRule {
  return new InputRule({
    // 匹配 $...$ 格式，内部不包含 $ 和换行
    find: /\$([^$\n]+)\$$/,
    handler: ({ state, range, match }) => {
      const { from, to } = range;
      const latex = match[1];
      
      // 创建 transaction
      const tr = state.tr;
      
      // 删除匹配的文本
      tr.delete(from, to);
      
      // 插入行内公式节点
      const node = inlineMathType.create({ latex });
      tr.insert(from, node);
      
      // 设置光标位置到节点后
      const newPos = from + 1;
      tr.setSelection(TextSelection.create(tr.doc, newPos));
      
      return;
    },
  });
}

/**
 * 块级公式输入规则: $$...$$
 * 输入 $$...$$ 后按回车自动转换
 */
export function createBlockMathRule(blockMathType: any): InputRule {
  return new InputRule({
    // 匹配行首的 $$...$$
    find: /^\$\$([^$]+)\$\$$/,
    handler: ({ state, range, match }) => {
      const { from, to } = range;
      const latex = match[1].trim();
      
      const tr = state.tr;
      
      // 删除匹配的文本
      tr.delete(from, to);
      
      // 插入块级公式节点
      const node = blockMathType.create({ latex });
      tr.insert(from, node);
      
      // 在后面插入空段落
      const paragraph = state.schema.nodes.paragraph?.create();
      if (paragraph) {
        tr.insert(from + node.nodeSize, paragraph);
        // 设置光标到空段落
        tr.setSelection(TextSelection.create(tr.doc, from + node.nodeSize + 1));
      }
      
      return;
    },
  });
}

/**
 * 获取所有数学公式输入规则
 */
export function getMathInputRules(options: {
  inlineMath: any;
  blockMath: any;
}): InputRule[] {
  return [
    createInlineMathRule(options.inlineMath),
    createBlockMathRule(options.blockMath),
  ];
}

export default getMathInputRules;
