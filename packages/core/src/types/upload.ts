export interface ImageUploadOptions {
  /** 接受的文件类型 */
  accept?: string;
  /** 最大文件大小（字节） */
  maxSize?: number;
  /** 上传处理函数，返回图片 URL */
  onUpload: (file: File) => Promise<string>;
  /** 上传失败处理 */
  onError?: (error: Error) => void;
}

export interface VideoUploadOptions {
  /** 接受的文件类型 */
  accept?: string;
  /** 最大文件大小（字节） */
  maxSize?: number;
  /** 上传处理函数，返回视频 URL */
  onUpload: (file: File) => Promise<string>;
  /** 上传失败处理 */
  onError?: (error: Error) => void;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  url?: string;
}

export type ImageAlignment = 'left' | 'center' | 'right';

export interface ImageAttributes {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  alignment?: ImageAlignment;
  caption?: string;
}

export interface VideoAttributes {
  src: string;
  type?: 'local' | 'youtube' | 'bilibili' | 'vimeo' | 'youku' | 'url';
  poster?: string;
  width?: number;
  height?: number;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export interface LinkAttributes {
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  title?: string;
  class?: string;
}

export interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  url: string;
  domain: string;
}
