/**
 * WheelChair Editor - Math Extension
 * 数学公式扩展 - 支持 LaTeX 公式输入
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import katex from 'katex';

// ============================================
// 行内数学公式: $...$
// ============================================
export const InlineMath = Node.create({
  name: 'inlineMath',
  group: 'inline math',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes) => {
          if (!attributes.latex) {
            return {};
          }
          return { 'data-latex': attributes.latex };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="inline-math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': 'inline-math' },
        HTMLAttributes
      ),
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('span');
      dom.className = 'math-inline';
      dom.contentEditable = 'false';
      dom.style.cursor = 'pointer';
      
      const latex = (node.attrs.latex as string) || '';
      
      try {
        katex.render(latex, dom, {
          throwOnError: false,
          displayMode: false,
          strict: false,
        });
      } catch (e) {
        dom.textContent = `$${latex}$`;
        dom.classList.add('math-error');
      }

      // 双击编辑
      dom.addEventListener('dblclick', () => {
        const event = new CustomEvent('math:edit', {
          detail: {
            type: 'inlineMath',
            latex,
            pos: getPos(),
          },
          bubbles: true,
        });
        dom.dispatchEvent(event);
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false;
          
          const newLatex = (updatedNode.attrs.latex as string) || '';
          if (newLatex !== latex) {
            try {
              dom.innerHTML = '';
              katex.render(newLatex, dom, {
                throwOnError: false,
                displayMode: false,
                strict: false,
              });
              dom.classList.remove('math-error');
            } catch (e) {
              dom.textContent = `$${newLatex}$`;
              dom.classList.add('math-error');
            }
          }
          return true;
        },
      };
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-m': () => {
        const { from, to } = this.editor.state.selection;
        const text = this.editor.state.doc.textBetween(from, to);
        
        if (text) {
          // 如果有选中文本，将其转换为公式
          this.editor
            .chain()
            .deleteSelection()
            .insertContent({
              type: this.name,
              attrs: { latex: text },
            })
            .run();
          return true;
        }
        
        // 否则触发编辑事件
        const event = new CustomEvent('math:insert', {
          detail: { type: 'inlineMath' },
          bubbles: true,
        });
        document.dispatchEvent(event);
        return true;
      },
    };
  },
});

// ============================================
// 块级数学公式: $$...$$
// ============================================
export const BlockMath = Node.create({
  name: 'blockMath',
  group: 'block math',
  selectable: true,
  atom: true,
  isolating: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes) => {
          if (!attributes.latex) {
            return {};
          }
          return { 'data-latex': attributes.latex };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="block-math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        { 'data-type': 'block-math' },
        HTMLAttributes
      ),
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'math-block';
      dom.contentEditable = 'false';
      dom.style.cursor = 'pointer';
      
      const latex = (node.attrs.latex as string) || '';
      
      try {
        katex.render(latex, dom, {
          throwOnError: false,
          displayMode: true,
          strict: false,
        });
      } catch (e) {
        dom.textContent = `$$${latex}$$`;
        dom.classList.add('math-error');
      }

      // 双击编辑
      dom.addEventListener('dblclick', () => {
        const event = new CustomEvent('math:edit', {
          detail: {
            type: 'blockMath',
            latex,
            pos: getPos(),
          },
          bubbles: true,
        });
        dom.dispatchEvent(event);
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false;
          
          const newLatex = (updatedNode.attrs.latex as string) || '';
          if (newLatex !== latex) {
            try {
              dom.innerHTML = '';
              katex.render(newLatex, dom, {
                throwOnError: false,
                displayMode: true,
                strict: false,
              });
              dom.classList.remove('math-error');
            } catch (e) {
              dom.textContent = `$$${newLatex}$$`;
              dom.classList.add('math-error');
            }
          }
          return true;
        },
      };
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-m': () => {
        // 触发插入块级公式事件
        const event = new CustomEvent('math:insert', {
          detail: { type: 'blockMath' },
          bubbles: true,
        });
        document.dispatchEvent(event);
        return true;
      },
    };
  },
});

// ============================================
// 公式插件 - 处理点击编辑
// ============================================
export const MathPlugin = new Plugin({
  key: new PluginKey('math'),
  props: {
    handleDoubleClick(view, pos, event) {
      const target = event.target as HTMLElement;
      if (target.closest('.math-inline, .math-block')) {
        // 阻止默认行为，让 NodeView 处理
        return true;
      }
      return false;
    },
  },
});

// 导出扩展数组
export const MathExtensions = [InlineMath, BlockMath];

export default MathExtensions;
