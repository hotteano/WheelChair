import {
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { LinkAttributes, LinkPreviewData } from '../../types/upload';

export interface LinkOptions {
  /** 是否自动检测链接 */
  autolink: boolean;
  /** 打开链接的协议 */
  protocols: string[];
  /** 默认是否在新窗口打开 */
  openOnClick: boolean;
  /** HTML属性 */
  HTMLAttributes: Record<string, any>;
  /** 是否显示链接编辑弹窗 */
  showEditPopup: boolean;
  /** 是否启用链接预览 */
  enablePreview: boolean;
  /** 获取链接预览数据 */
  getPreviewData?: (url: string) => Promise<LinkPreviewData>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    link: {
      /**
       * 设置链接
       */
      setLink: (attributes: LinkAttributes) => ReturnType;
      /**
       * 切换链接
       */
      toggleLink: (attributes?: LinkAttributes) => ReturnType;
      /**
       * 取消链接
       */
      unsetLink: () => ReturnType;
      /**
       * 打开链接
       */
      openLink: () => ReturnType;
    };
  }
}

export const inputRegex = /(?:^|\s)\[(.+?)\]\((.+?)\)$/;

export const pasteRegex = /(?:^|\s)\[(.+?)\]\((.+?)\)/g;

// URL 自动检测正则
const AUTO_LINK_REGEX = /(https?:\/\/|www\.)[^\s<>\"{}|\\^`\[\]]+/gi;

export const Link = Mark.create<LinkOptions>({
  name: 'link',

  priority: 1000,

  keepOnSplit: false,

  exitable: true,

  addOptions() {
    return {
      autolink: true,
      protocols: ['http', 'https', 'ftp', 'mailto'],
      openOnClick: true,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      },
      showEditPopup: true,
      enablePreview: false,
    };
  },

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML: (element) => element.getAttribute('href'),
        renderHTML: (attributes) => ({
          href: attributes.href,
        }),
      },
      target: {
        default: this.options.HTMLAttributes.target,
        parseHTML: (element) => element.getAttribute('target'),
        renderHTML: (attributes) => {
          if (!attributes.target) {
            return {};
          }
          return {
            target: attributes.target,
          };
        },
      },
      rel: {
        default: this.options.HTMLAttributes.rel,
        parseHTML: (element) => element.getAttribute('rel'),
        renderHTML: (attributes) => {
          if (!attributes.rel) {
            return {};
          }
          return {
            rel: attributes.rel,
          };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }
          return {
            title: attributes.title,
          };
        },
      },
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
        renderHTML: (attributes) => {
          if (!attributes.class) {
            return {};
          }
          return {
            class: attributes.class,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[href]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return false;
          const element = dom as HTMLAnchorElement;
          return {
            href: element.getAttribute('href'),
            target: element.getAttribute('target'),
            rel: element.getAttribute('rel'),
            title: element.getAttribute('title'),
            class: element.getAttribute('class'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'wheelchair-link',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setLink:
        (attributes) =>
        ({ chain }) => {
          return chain()
            .setMark(this.name, attributes)
            .setMeta('preventAutolink', true)
            .run();
        },

      toggleLink:
        (attributes) =>
        ({ chain }) => {
          return chain()
            .toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
            .setMeta('preventAutolink', true)
            .run();
        },

      unsetLink:
        () =>
        ({ chain }) => {
          return chain()
            .unsetMark(this.name, { extendEmptyMarkRange: true })
            .setMeta('preventAutolink', true)
            .run();
        },

      openLink:
        () =>
        ({ editor }) => {
          const { from, to } = editor.state.selection;
          const marks = editor.state.doc.rangeHasMark(from, to, this.type);
          
          if (!marks) {
            return false;
          }

          let href = '';
          editor.state.doc.nodesBetween(from, to, (node) => {
            node.marks.forEach((mark) => {
              if (mark.type.name === this.name) {
                href = mark.attrs.href;
              }
            });
            return true;
          });

          if (href) {
            window.open(href, '_blank', 'noopener,noreferrer');
            return true;
          }

          return false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => {
        const { editor } = this;
        const { from, to } = editor.state.selection;
        
        // 检查是否有选中的链接
        const hasLink = editor.isActive('link');
        
        if (hasLink) {
          // 如果已有链接，取消链接
          return editor.chain().focus().unsetLink().run();
        } else {
          // 如果没有链接且没有选中内容，提示输入链接
          if (from === to) {
            // 触发链接编辑弹窗事件
            const event = new CustomEvent('wheelchair:showLinkMenu', {
              detail: { editor, from, to },
            });
            document.dispatchEvent(event);
            return true;
          }
          
          // 如果有选中内容，直接打开链接编辑弹窗
          const event = new CustomEvent('wheelchair:showLinkMenu', {
            detail: { editor, from, to },
          });
          document.dispatchEvent(event);
          return true;
        }
      },
      'Mod-Shift-k': () => {
        return this.editor.commands.openLink();
      },
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, text, href] = match;
          return {
            href,
            title: text,
          };
        },
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, text, href] = match;
          return {
            href,
            title: text,
          };
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin({
        key: new PluginKey('autolink'),
        appendTransaction: (transactions, oldState, newState) => {
          if (!options.autolink) {
            return null;
          }

          const docChanges = transactions.some((transaction) => transaction.docChanged);
          const preventAutolink = transactions.some((transaction) =>
            transaction.getMeta('preventAutolink')
          );

          if (!docChanges || preventAutolink) {
            return null;
          }

          const { tr } = newState;
          let modified = false;

          // 遍历文档查找需要自动链接的文本
          newState.doc.descendants((node, pos) => {
            if (!node.isText) {
              return true;
            }

            const text = node.text || '';
            let match;

            AUTO_LINK_REGEX.lastIndex = 0;

            while ((match = AUTO_LINK_REGEX.exec(text)) !== null) {
              const start = pos + match.index;
              const end = start + match[0].length;

              // 检查是否已经在链接内
              const marks = node.marks;
              const isAlreadyLinked = marks.some((mark) => mark.type.name === 'link');

              if (isAlreadyLinked) {
                continue;
              }

              // 规范化 URL
              let href = match[0].trim();
              if (href.startsWith('www.')) {
                href = 'https://' + href;
              }

              // 添加链接标记
              tr.addMark(start, end, this.type.create({ href }));
              modified = true;
            }

            return true;
          });

          return modified ? tr : null;
        },
      }),

      // 点击链接处理
      new Plugin({
        key: new PluginKey('linkClick'),
        props: {
          handleClick: (view, pos, event) => {
            if (!options.openOnClick) {
              return false;
            }

            const target = event.target as HTMLElement;
            if (target.tagName !== 'A') {
              return false;
            }

            const anchor = target as HTMLAnchorElement;
            const href = anchor.getAttribute('href');

            if (!href) {
              return false;
            }

            // 检查是否是内部锚点
            if (href.startsWith('#')) {
              return false;
            }

            // 在新窗口打开
            event.preventDefault();
            window.open(href, '_blank', 'noopener,noreferrer');
            return true;
          },
        },
      }),
    ];
  },
});

// 验证 URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // 尝试添加 https:// 再验证
    try {
      new URL('https://' + url);
      return true;
    } catch {
      return false;
    }
  }
}

// 规范化 URL
export function normalizeUrl(url: string): string {
  if (url.match(/^https?:\/\//i)) {
    return url;
  }
  if (url.match(/^www\./i)) {
    return 'https://' + url;
  }
  return 'https://' + url;
}

// 获取域名
export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(normalizeUrl(url));
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default Link;
