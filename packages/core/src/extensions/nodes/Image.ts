import {
  Node,
  nodeInputRule,
  nodePasteRule,
  mergeAttributes,
  type KeyboardShortcutCommand,
} from '@tiptap/core';
import { type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { type EditorView } from '@tiptap/pm/view';
import type { ImageAttributes, ImageUploadOptions, ImageAlignment } from '../../types/upload';

export interface ImageOptions {
  /** HTML属性 */
  HTMLAttributes: Record<string, any>;
  /** 上传配置 */
  uploadOptions?: ImageUploadOptions;
  /** 是否允许拖拽上传 */
  allowDragUpload: boolean;
  /** 是否允许粘贴上传 */
  allowPasteUpload: boolean;
  /** 是否允许点击上传 */
  allowClickUpload: boolean;
  /** 是否允许调整大小 */
  allowResize: boolean;
  /** 是否允许对齐 */
  allowAlignment: boolean;
  /** 是否显示标题 */
  allowCaption: boolean;
  /** 内联模式 */
  inline: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /**
       * 设置图片
       */
      setImage: (options: ImageAttributes) => ReturnType;
      /**
       * 更新图片属性
       */
      updateImage: (options: Partial<ImageAttributes>) => ReturnType;
      /**
       * 设置图片对齐
       */
      setImageAlignment: (alignment: ImageAlignment) => ReturnType;
      /**
       * 设置图片大小
       */
      setImageSize: (width: number, height?: number) => ReturnType;
      /**
       * 切换图片标题
       */
      toggleImageCaption: () => ReturnType;
      /**
       * 删除图片
       */
      deleteImage: () => ReturnType;
    };
  }
}

export const inputRegex = /(?:^|\s)(!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const pasteRegex = /(?:^|\s)(!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))/g;

export const Image = Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      HTMLAttributes: {},
      allowDragUpload: true,
      allowPasteUpload: true,
      allowClickUpload: true,
      allowResize: true,
      allowAlignment: true,
      allowCaption: true,
      inline: false,
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => ({
          src: attributes.src,
        }),
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => ({
          alt: attributes.alt,
        }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) => ({
          title: attributes.title,
        }),
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return {
            height: attributes.height,
          };
        },
      },
      alignment: {
        default: 'center',
        parseHTML: (element) => {
          const className = element.className || '';
          if (className.includes('align-left')) return 'left';
          if (className.includes('align-right')) return 'right';
          return 'center';
        },
        renderHTML: (attributes) => {
          const alignment = attributes.alignment || 'center';
          return {
            class: `image-align-${alignment}`,
            'data-alignment': alignment,
          };
        },
      },
      caption: {
        default: null,
        parseHTML: (element) => {
          const figcaption = element.querySelector('figcaption');
          return figcaption?.textContent || null;
        },
        renderHTML: (attributes) => ({
          'data-caption': attributes.caption,
        }),
      },
      loading: {
        default: false,
        parseHTML: () => false,
        renderHTML: (attributes) => ({
          'data-loading': attributes.loading,
        }),
      },
      error: {
        default: null,
        parseHTML: () => null,
        renderHTML: (attributes) => ({
          'data-error': attributes.error,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return false;
          const element = dom as HTMLElement;
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            title: element.getAttribute('title'),
            width: element.getAttribute('width'),
            height: element.getAttribute('height'),
          };
        },
      },
      {
        tag: 'figure',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return false;
          const element = dom as HTMLElement;
          const img = element.querySelector('img');
          if (!img) return false;
          const figcaption = element.querySelector('figcaption');
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            caption: figcaption?.textContent,
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { caption, alignment, loading, error, ...imgAttributes } = HTMLAttributes;
    const hasCaption = caption && this.options.allowCaption;
    
    const imgAttrs = mergeAttributes(
      this.options.HTMLAttributes,
      imgAttributes,
      {
        class: `wheelchair-image ${this.options.allowResize ? 'resizable' : ''} ${loading ? 'loading' : ''} ${error ? 'error' : ''}`.trim(),
      }
    );

    if (hasCaption) {
      return [
        'figure',
        {
          class: `image-figure align-${alignment}`,
          'data-alignment': alignment,
        },
        ['img', imgAttrs],
        ['figcaption', {}, caption],
      ];
    }

    return ['img', imgAttrs];
  },

  addCommands() {
    return {
      setImage:
        (options: ImageAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },

      updateImage:
        (options: Partial<ImageAttributes>) =>
        ({ chain }) => {
          return chain()
            .updateAttributes(this.name, options)
            .run();
        },

      setImageAlignment:
        (alignment: ImageAlignment) =>
        ({ chain }) => {
          return chain()
            .updateAttributes(this.name, { alignment })
            .run();
        },

      setImageSize:
        (width: number, height?: number) =>
        ({ chain }) => {
          return chain()
            .updateAttributes(this.name, { width, height })
            .run();
        },

      toggleImageCaption:
        () =>
        ({ chain, editor }) => {
          const { from, to } = editor.state.selection;
          const node = editor.state.doc.nodeAt(from);
          
          if (!node || node.type.name !== this.name) {
            return false;
          }

          const currentCaption = node.attrs.caption;
          const newCaption = currentCaption ? null : '';

          return chain()
            .updateAttributes(this.name, { caption: newCaption })
            .run();
        },

      deleteImage:
        () =>
        ({ chain }) => {
          return chain()
            .deleteNode(this.name)
            .run();
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title] = match;
          return {
            src,
            alt,
            title,
          };
        },
      }),
    ];
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: pasteRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title] = match;
          return {
            src,
            alt,
            title,
          };
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    const options = this.options;
    const type = this.type;

    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          // 拖拽上传处理
          handleDrop(view: EditorView, event: DragEvent, slice, moved) {
            if (!options.allowDragUpload || !options.uploadOptions) {
              return false;
            }

            const files = event.dataTransfer?.files;
            if (!files || files.length === 0) {
              return false;
            }

            const imageFiles = Array.from(files).filter((file) =>
              file.type.startsWith('image/')
            );

            if (imageFiles.length === 0) {
              return false;
            }

            event.preventDefault();

            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            if (!coordinates) {
              return false;
            }

            imageFiles.forEach(async (file) => {
              await handleImageUpload(
                view,
                file,
                coordinates.pos,
                options.uploadOptions!,
                type
              );
            });

            return true;
          },

          // 粘贴上传处理
          handlePaste(view: EditorView, event: ClipboardEvent, slice) {
            if (!options.allowPasteUpload || !options.uploadOptions) {
              return false;
            }

            const items = event.clipboardData?.items;
            if (!items) {
              return false;
            }

            const imageItems = Array.from(items).filter((item) =>
              item.type.startsWith('image/')
            );

            if (imageItems.length === 0) {
              return false;
            }

            event.preventDefault();

            imageItems.forEach(async (item) => {
              const file = item.getAsFile();
              if (file) {
                const { from } = view.state.selection;
                await handleImageUpload(
                  view,
                  file,
                  from,
                  options.uploadOptions!,
                  type
                );
              }
            });

            return true;
          },
        },
      }),
    ];
  },
});

// 处理图片上传
async function handleImageUpload(
  view: EditorView,
  file: File,
  pos: number,
  uploadOptions: ImageUploadOptions,
  type: any
) {
  const { maxSize, accept, onUpload, onError } = uploadOptions;

  // 检查文件类型
  if (accept && !file.type.match(accept.replace(/\*/g, '.*'))) {
    const error = new Error(`不支持的文件类型: ${file.type}`);
    onError?.(error);
    return;
  }

  // 检查文件大小
  if (maxSize && file.size > maxSize) {
    const error = new Error(`文件大小超过限制: ${file.size} > ${maxSize}`);
    onError?.(error);
    return;
  }

  // 创建临时节点（显示加载状态）
  const tempId = `upload-${Date.now()}`;
  const tr = view.state.tr;
  const node = type.create({
    src: '',
    alt: file.name,
    loading: true,
  });
  tr.insert(pos, node);
  view.dispatch(tr);

  try {
    // 上传图片
    const url = await onUpload(file);

    // 更新节点为实际图片
    const { state } = view;
    const nodePos = findNodePosition(state.doc, tempId);
    
    if (nodePos !== null) {
      const updateTr = state.tr;
      updateTr.setNodeMarkup(nodePos, undefined, {
        src: url,
        alt: file.name,
        loading: false,
      });
      view.dispatch(updateTr);
    }
  } catch (error) {
    // 更新节点为错误状态
    const { state } = view;
    const nodePos = findNodePosition(state.doc, tempId);
    
    if (nodePos !== null) {
      const errorTr = state.tr;
      errorTr.setNodeMarkup(nodePos, undefined, {
        src: '',
        alt: file.name,
        loading: false,
        error: error instanceof Error ? error.message : '上传失败',
      });
      view.dispatch(errorTr);
    }

    onError?.(error instanceof Error ? error : new Error('上传失败'));
  }
}

// 查找节点位置
function findNodePosition(doc: ProseMirrorNode, id: string): number | null {
  let foundPos: number | null = null;

  doc.descendants((node, pos) => {
    if (node.attrs.id === id) {
      foundPos = pos;
      return false;
    }
    return true;
  });

  return foundPos;
}

export default Image;
