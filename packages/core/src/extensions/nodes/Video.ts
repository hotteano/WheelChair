import {
  Node,
  mergeAttributes,
  type KeyboardShortcutCommand,
} from '@tiptap/core';
import type { VideoAttributes, VideoUploadOptions } from '../../types/upload';

export interface VideoOptions {
  /** HTML属性 */
  HTMLAttributes: Record<string, any>;
  /** 上传配置 */
  uploadOptions?: VideoUploadOptions;
  /** 是否允许本地上传 */
  allowUpload: boolean;
  /** 是否允许嵌入 */
  allowEmbed: boolean;
  /** 支持的嵌入平台 */
  embedPlatforms: ('youtube' | 'bilibili' | 'vimeo' | 'youku')[];
  /** 默认播放器控制 */
  controls: boolean;
  /** 默认自动播放 */
  autoplay: boolean;
  /** 默认循环播放 */
  loop: boolean;
  /** 默认静音 */
  muted: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      /**
       * 设置视频
       */
      setVideo: (options: VideoAttributes) => ReturnType;
      /**
       * 设置 YouTube 视频
       */
      setYoutubeVideo: (videoId: string, options?: Partial<VideoAttributes>) => ReturnType;
      /**
       * 设置 Bilibili 视频
       */
      setBilibiliVideo: (videoId: string, options?: Partial<VideoAttributes>) => ReturnType;
      /**
       * 更新视频属性
       */
      updateVideo: (options: Partial<VideoAttributes>) => ReturnType;
      /**
       * 删除视频
       */
      deleteVideo: () => ReturnType;
    };
  }
}

// YouTube URL 解析
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\s]{11})/i;

// Bilibili URL 解析
const BILIBILI_REGEX = /(?:bilibili\.com\/(?:video\/)?|b23\.tv\/)([a-zA-Z0-9]+)/i;

// Vimeo URL 解析
const VIMEO_REGEX = /vimeo\.com\/(\d+)/i;

// Youku URL 解析
const YOUKU_REGEX = /youku\.com\/v_show\/id_([a-zA-Z0-9=]+)/i;

export const Video = Node.create<VideoOptions>({
  name: 'video',

  addOptions() {
    return {
      HTMLAttributes: {},
      allowUpload: true,
      allowEmbed: true,
      embedPlatforms: ['youtube', 'bilibili'],
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
    };
  },

  group: 'block',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          const src = element.getAttribute('src');
          const dataSrc = element.getAttribute('data-src');
          return src || dataSrc;
        },
        renderHTML: (attributes) => {
          const { type, src } = attributes;
          if (type === 'youtube' || type === 'bilibili') {
            return { 'data-src': src };
          }
          return { src };
        },
      },
      type: {
        default: 'local',
        parseHTML: (element) => element.getAttribute('data-type') || 'local',
        renderHTML: (attributes) => ({
          'data-type': attributes.type,
        }),
      },
      poster: {
        default: null,
        parseHTML: (element) => element.getAttribute('poster'),
        renderHTML: (attributes) => {
          if (!attributes.poster) return {};
          return { poster: attributes.poster };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
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
          return { height: attributes.height };
        },
      },
      controls: {
        default: true,
        parseHTML: (element) => element.hasAttribute('controls'),
        renderHTML: (attributes) => {
          if (!attributes.controls) return {};
          return { controls: '' };
        },
      },
      autoplay: {
        default: false,
        parseHTML: (element) => element.hasAttribute('autoplay'),
        renderHTML: (attributes) => {
          if (!attributes.autoplay) return {};
          return { autoplay: '' };
        },
      },
      loop: {
        default: false,
        parseHTML: (element) => element.hasAttribute('loop'),
        renderHTML: (attributes) => {
          if (!attributes.loop) return {};
          return { loop: '' };
        },
      },
      muted: {
        default: false,
        parseHTML: (element) => element.hasAttribute('muted'),
        renderHTML: (attributes) => {
          if (!attributes.muted) return {};
          return { muted: '' };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return false;
          const element = dom as HTMLVideoElement;
          return {
            src: element.getAttribute('src'),
            type: 'local',
            poster: element.getAttribute('poster'),
            width: element.getAttribute('width'),
            height: element.getAttribute('height'),
            controls: element.hasAttribute('controls'),
            autoplay: element.hasAttribute('autoplay'),
            loop: element.hasAttribute('loop'),
            muted: element.hasAttribute('muted'),
          };
        },
      },
      {
        tag: 'div[data-video-embed]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return false;
          const element = dom as HTMLElement;
          return {
            src: element.getAttribute('data-src'),
            type: element.getAttribute('data-type'),
            width: element.getAttribute('data-width'),
            height: element.getAttribute('data-height'),
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { type, src, ...attrs } = HTMLAttributes;

    // 本地视频
    if (type === 'local' || type === 'url') {
      return [
        'video',
        mergeAttributes(this.options.HTMLAttributes, attrs, {
          src,
          class: 'wheelchair-video',
        }),
      ];
    }

    // 嵌入视频（YouTube, Bilibili 等）
    const embedUrl = getEmbedUrl(type, src);
    const iframeAttrs = {
      src: embedUrl,
      width: attrs.width || 640,
      height: attrs.height || 360,
      frameborder: '0',
      allowfullscreen: 'true',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      class: 'wheelchair-video-embed',
    };

    return [
      'div',
      {
        class: `video-embed-wrapper video-${type}`,
        'data-video-embed': '',
        'data-type': type,
        'data-src': src,
        style: `position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;`,
      },
      [
        'iframe',
        mergeAttributes(iframeAttrs, {
          style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options: VideoAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },

      setYoutubeVideo:
        (videoId: string, options: Partial<VideoAttributes> = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: videoId,
              type: 'youtube',
              ...this.options,
              ...options,
            },
          });
        },

      setBilibiliVideo:
        (videoId: string, options: Partial<VideoAttributes> = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: videoId,
              type: 'bilibili',
              ...this.options,
              ...options,
            },
          });
        },

      updateVideo:
        (options: Partial<VideoAttributes>) =>
        ({ chain }) => {
          return chain()
            .updateAttributes(this.name, options)
            .run();
        },

      deleteVideo:
        () =>
        ({ chain }) => {
          return chain()
            .deleteNode(this.name)
            .run();
        },
    };
  },
});

// 获取嵌入 URL
function getEmbedUrl(type: string, src: string): string {
  switch (type) {
    case 'youtube':
      // 如果 src 是完整 URL，提取 videoId
      const youtubeMatch = src.match(YOUTUBE_REGEX);
      const videoId = youtubeMatch ? youtubeMatch[1] : src;
      return `https://www.youtube.com/embed/${videoId}`;

    case 'bilibili':
      // 如果 src 是完整 URL，提取 BV/AV 号
      const bilibiliMatch = src.match(BILIBILI_REGEX);
      const bvid = bilibiliMatch ? bilibiliMatch[1] : src;
      return `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1`;

    case 'vimeo':
      const vimeoMatch = src.match(VIMEO_REGEX);
      const vimeoId = vimeoMatch ? vimeoMatch[1] : src;
      return `https://player.vimeo.com/video/${vimeoId}`;

    case 'youku':
      const youkuMatch = src.match(YOUKU_REGEX);
      const youkuId = youkuMatch ? youkuMatch[1] : src;
      return `https://player.youku.com/embed/${youkuId}`;

    default:
      return src;
  }
}

// 解析视频 URL 类型
export function parseVideoUrl(url: string): { type: VideoAttributes['type']; id: string } | null {
  // YouTube
  const youtubeMatch = url.match(YOUTUBE_REGEX);
  if (youtubeMatch) {
    return { type: 'youtube', id: youtubeMatch[1] };
  }

  // Bilibili
  const bilibiliMatch = url.match(BILIBILI_REGEX);
  if (bilibiliMatch) {
    return { type: 'bilibili', id: bilibiliMatch[1] };
  }

  // Vimeo
  const vimeoMatch = url.match(VIMEO_REGEX);
  if (vimeoMatch) {
    return { type: 'vimeo', id: vimeoMatch[1] };
  }

  // Youku
  const youkuMatch = url.match(YOUKU_REGEX);
  if (youkuMatch) {
    return { type: 'youku', id: youkuMatch[1] };
  }

  // 直接视频链接
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return { type: 'url', id: url };
  }

  return null;
}

// 验证视频文件
export function isValidVideoFile(file: File, accept?: string): boolean {
  if (accept) {
    const acceptedTypes = accept.split(',').map(t => t.trim());
    return acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });
  }
  return file.type.startsWith('video/');
}

export default Video;
