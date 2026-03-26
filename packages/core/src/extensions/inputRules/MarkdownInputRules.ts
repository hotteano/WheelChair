/**
 * WheelChair Editor - Markdown Input Rules
 * Markdown 输入规则 - 实现类似 Typora/Notion 的即时 Markdown 转换
 */

import { Extension, InputRule } from '@tiptap/core';
import { NodeType, MarkType } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';

// ============================================
// 类型定义
// ============================================

export interface InputRuleConfig {
  /** 是否启用标题规则 */
  enableHeadings?: boolean;
  /** 是否启用列表规则 */
  enableLists?: boolean;
  /** 是否启用代码块规则 */
  enableCodeBlocks?: boolean;
  /** 是否启用引用规则 */
  enableBlockquotes?: boolean;
  /** 是否启用分割线规则 */
  enableHorizontalRules?: boolean;
  /** 是否启用标记规则（粗体、斜体等） */
  enableMarks?: boolean;
}

// ============================================
// 输入规则定义
// ============================================

/**
 * 创建标题输入规则
 */
function createHeadingRules(headingType: NodeType): InputRule[] {
  return [1, 2, 3, 4, 5, 6].map((level) =>
    new InputRule({
      find: new RegExp(`^(#{1,${level}})\\s$`),
      handler: ({ state, range }) => {
        const { tr } = state;
        const { from, to } = range;
        
        // 删除 "## " 等标记
        tr.delete(from, to);
        
        // 设置为标题
        tr.setBlockType(from, from, headingType, { level });
        
        return;
      },
    })
  );
}

/**
 * 创建无序列表规则
 */
function createBulletListRule(listItemType: NodeType, bulletListType: NodeType): InputRule {
  return new InputRule({
    find: /^[-+*]\s$/,
    handler: ({ state, range }) => {
      const { tr } = state;
      const { from, to } = range;
      
      // 删除 "- " 或 "* " 或 "+ "
      tr.delete(from, to);
      
      // 获取当前位置
      const $pos = tr.doc.resolve(from);
      const startPos = $pos.before($pos.depth);
      const endPos = $pos.after($pos.depth);
      
      // 将段落转换为列表项
      const rangeObj = startPos === endPos 
        ? { from, to: from + 1 }
        : { from: startPos, to: endPos };
      tr.wrap(
        rangeObj as any,
        [{ type: bulletListType }, { type: listItemType }]
      );
      
      return;
    },
  });
}

/**
 * 创建有序列表规则
 */
function createOrderedListRule(listItemType: NodeType, orderedListType: NodeType): InputRule {
  return new InputRule({
    find: /^(\d+)\.\s$/,
    handler: ({ state, range, match }) => {
      const { tr } = state;
      const { from, to } = range;
      const startNumber = parseInt(match[1], 10);
      
      // 删除 "1. " 等
      tr.delete(from, to);
      
      // 获取当前位置
      const $pos = tr.doc.resolve(from);
      const startPos = $pos.before($pos.depth);
      const endPos = $pos.after($pos.depth);
      
      // 将段落转换为有序列表项
      const rangeObj = startPos === endPos 
        ? { from, to: from + 1 }
        : { from: startPos, to: endPos };
      tr.wrap(
        rangeObj as any,
        [{ type: orderedListType, attrs: { start: startNumber } }, { type: listItemType }]
      );
      
      return;
    },
  });
}

/**
 * 创建代码块规则
 */
function createCodeBlockRule(codeBlockType: NodeType): InputRule {
  return new InputRule({
    find: /^```(\w*)\s$/,
    handler: ({ state, range, match }) => {
      const { tr } = state;
      const { from, to } = range;
      const language = match[1] || null;
      
      // 删除 "```" 和语言标识
      tr.delete(from, to);
      
      // 设置为代码块
      tr.setBlockType(from, from, codeBlockType, { language });
      
      return;
    },
  });
}

/**
 * 创建引用块规则
 */
function createBlockquoteRule(blockquoteType: NodeType): InputRule {
  return new InputRule({
    find: /^>\s$/,
    handler: ({ state, range }) => {
      const { tr } = state;
      const { from, to } = range;
      
      // 删除 "> "
      tr.delete(from, to);
      
      // 获取当前段落范围
      const $pos = tr.doc.resolve(from);
      const startPos = $pos.before($pos.depth);
      const endPos = $pos.after($pos.depth);
      
      // 包裹为引用块
      const rangeObj = startPos === endPos 
        ? { from, to: from + 1 }
        : { from: startPos, to: endPos };
      tr.wrap(
        rangeObj as any,
        [{ type: blockquoteType }]
      );
      
      return;
    },
  });
}

/**
 * 创建水平分割线规则
 */
function createHorizontalRuleRule(hrType: NodeType, paragraphType: NodeType): InputRule {
  return new InputRule({
    find: /^(?:---|___|\*\*\*)\s$/,
    handler: ({ state, range }) => {
      const { tr } = state;
      const { from, to } = range;
      
      // 替换为水平分割线
      const hrNode = hrType.create();
      tr.replaceWith(from, to, hrNode);
      
      // 在后面插入新段落
      const paragraph = paragraphType.create();
      tr.insert(from + hrNode.nodeSize, paragraph);
      tr.setSelection(TextSelection.create(tr.doc, from + hrNode.nodeSize + 1));
      
      return;
    },
  });
}

/**
 * 创建粗体标记规则（行内）
 */
function createBoldRule(boldType: MarkType): InputRule {
  return new InputRule({
    find: /(?:^|\s)(\*\*|__)([^*_]+)\1$/,
    handler: ({ state, range, match }) => {
      const { tr } = state;
      const text = match[2];
      const start = range.from;
      
      const actualStart = start + (match[0].startsWith(' ') ? 1 : 0);
      
      // 删除标记并应用粗体
      tr.delete(actualStart + text.length + 2, actualStart + text.length + 4);
      tr.delete(actualStart, actualStart + 2);
      tr.addMark(actualStart, actualStart + text.length, boldType.create());
      
      return;
    },
  });
}

/**
 * 创建斜体标记规则（行内）
 */
function createItalicRule(italicType: MarkType): InputRule {
  return new InputRule({
    find: /(?:^|\s)(\*|_)([^*_]+)\1$/,
    handler: ({ state, range, match }) => {
      const { tr } = state;
      const text = match[2];
      const start = range.from;
      
      const actualStart = start + (match[0].startsWith(' ') ? 1 : 0);
      
      // 删除前后的 * 标记
      tr.delete(actualStart + text.length + 1, actualStart + text.length + 2);
      tr.delete(actualStart, actualStart + 1);
      
      // 应用斜体标记
      tr.addMark(actualStart, actualStart + text.length, italicType.create());
      
      return;
    },
  });
}

/**
 * 创建行内代码规则
 */
function createInlineCodeRule(codeType: MarkType): InputRule {
  return new InputRule({
    find: /(?:^|\s)`([^`]+)`$/,
    handler: ({ state, range, match }) => {
      const { tr } = state;
      const text = match[1];
      const start = range.from;
      
      const actualStart = start + (match[0].startsWith(' ') ? 1 : 0);
      
      // 删除前后的 ` 标记
      tr.delete(actualStart + text.length + 1, actualStart + text.length + 2);
      tr.delete(actualStart, actualStart + 1);
      
      // 应用代码标记
      tr.addMark(actualStart, actualStart + text.length, codeType.create());
      
      return;
    },
  });
}

/**
 * 创建删除线规则
 */
function createStrikeRule(strikeType: MarkType): InputRule {
  return new InputRule({
    find: /(?:^|\s)~~([^~]+)~~$/,
    handler: ({ state, range, match }) => {
      const { tr } = state;
      const text = match[1];
      const start = range.from;
      
      const actualStart = start + (match[0].startsWith(' ') ? 1 : 0);
      
      // 删除前后的 ~~ 标记
      tr.delete(actualStart + text.length + 2, actualStart + text.length + 4);
      tr.delete(actualStart, actualStart + 2);
      
      // 应用删除线标记
      tr.addMark(actualStart, actualStart + text.length, strikeType.create());
      
      return;
    },
  });
}

// ============================================
// 主函数
// ============================================

export interface GetMarkdownInputRulesOptions {
  nodes: {
    heading?: NodeType;
    bulletList?: NodeType;
    orderedList?: NodeType;
    listItem?: NodeType;
    codeBlock?: NodeType;
    blockquote?: NodeType;
    horizontalRule?: NodeType;
    paragraph?: NodeType;
  };
  marks: {
    bold?: MarkType;
    italic?: MarkType;
    code?: MarkType;
    strike?: MarkType;
  };
  config?: InputRuleConfig;
}

/**
 * 获取所有 Markdown 输入规则
 */
export function getMarkdownInputRules(options: GetMarkdownInputRulesOptions): InputRule[] {
  const { nodes, marks, config = {} } = options;
  const rules: InputRule[] = [];
  
  const {
    enableHeadings = true,
    enableLists = true,
    enableCodeBlocks = true,
    enableBlockquotes = true,
    enableHorizontalRules = true,
    enableMarks = true,
  } = config;
  
  // 标题规则
  if (enableHeadings && nodes.heading) {
    rules.push(...createHeadingRules(nodes.heading));
  }
  
  // 列表规则
  if (enableLists && nodes.listItem) {
    if (nodes.bulletList) {
      rules.push(createBulletListRule(nodes.listItem, nodes.bulletList));
    }
    if (nodes.orderedList) {
      rules.push(createOrderedListRule(nodes.listItem, nodes.orderedList));
    }
  }
  
  // 代码块规则
  if (enableCodeBlocks && nodes.codeBlock) {
    rules.push(createCodeBlockRule(nodes.codeBlock));
  }
  
  // 引用块规则
  if (enableBlockquotes && nodes.blockquote) {
    rules.push(createBlockquoteRule(nodes.blockquote));
  }
  
  // 水平分割线规则
  if (enableHorizontalRules && nodes.horizontalRule && nodes.paragraph) {
    rules.push(createHorizontalRuleRule(nodes.horizontalRule, nodes.paragraph));
  }
  
  // 标记规则（行内）
  if (enableMarks) {
    if (marks.bold) {
      rules.push(createBoldRule(marks.bold));
    }
    if (marks.italic) {
      rules.push(createItalicRule(marks.italic));
    }
    if (marks.code) {
      rules.push(createInlineCodeRule(marks.code));
    }
    if (marks.strike) {
      rules.push(createStrikeRule(marks.strike));
    }
  }
  
  return rules;
}

// ============================================
// Tiptap 扩展
// ============================================

export interface MarkdownInputRulesOptions {
  config?: InputRuleConfig;
}

/**
 * Markdown 输入规则扩展
 * 使用方式：
 * ```ts
 * const editor = new Editor({
 *   extensions: [
 *     StarterKit,
 *     MarkdownInputRules.configure({
 *       config: {
 *         enableHeadings: true,
 *         enableLists: true,
 *       }
 *     })
 *   ]
 * })
 * ```
 */
export const MarkdownInputRules = Extension.create<MarkdownInputRulesOptions>({
  name: 'markdownInputRules',
  
  addOptions() {
    return {
      config: {
        enableHeadings: true,
        enableLists: true,
        enableCodeBlocks: true,
        enableBlockquotes: true,
        enableHorizontalRules: true,
        enableMarks: true,
      },
    };
  },
  
  addInputRules() {
    const nodes = {
      heading: this.editor.schema.nodes.heading,
      bulletList: this.editor.schema.nodes.bulletList,
      orderedList: this.editor.schema.nodes.orderedList,
      listItem: this.editor.schema.nodes.listItem,
      codeBlock: this.editor.schema.nodes.codeBlock,
      blockquote: this.editor.schema.nodes.blockquote,
      horizontalRule: this.editor.schema.nodes.horizontalRule,
      paragraph: this.editor.schema.nodes.paragraph,
    };
    
    const marks = {
      bold: this.editor.schema.marks.bold,
      italic: this.editor.schema.marks.italic,
      code: this.editor.schema.marks.code,
      strike: this.editor.schema.marks.strike,
    };
    
    return getMarkdownInputRules({
      nodes,
      marks,
      config: this.options.config,
    });
  },
});

export default MarkdownInputRules;
