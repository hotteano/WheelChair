/**
 * Paste Importer
 * 剪贴板内容导入器
 * 处理来自 Word、网页、纯文本等的粘贴内容
 */

import type { Node } from '../model/node';
import type { ExportFormat, ImportOptions } from '../utils/importExport';
import { HTMLImporter, HTMLImportOptions } from './HTMLImporter';
import { MarkdownImporter, MarkdownImportOptions } from './MarkdownImporter';
import { TextImporter, TextImportOptions } from './TextImporter';

export interface PasteImportOptions extends ImportOptions {
  /** HTML 导入选项 */
  htmlOptions?: HTMLImportOptions;
  /** Markdown 导入选项 */
  markdownOptions?: MarkdownImportOptions;
  /** 文本导入选项 */
  textOptions?: TextImportOptions;
  /** 是否优先使用 HTML */
  preferHTML?: boolean;
  /** 是否清理 Word 样式 */
  cleanWordStyles?: boolean;
  /** 图片处理函数 */
  imageHandler?: (dataURL: string) => string | Promise<string>;
  /** 链接处理函数 */
  linkHandler?: (href: string) => string;
  /** 自定义粘贴处理器 */
  customHandlers?: Record<string, (data: string) => Node[]>;
}

export interface PasteData {
  /** HTML 内容 */
  html?: string;
  /** 纯文本内容 */
  text?: string;
  /** Markdown 内容（某些应用支持） */
  markdown?: string;
  /** RTF 内容 */
  rtf?: string;
  /** 自定义数据 */
  custom?: Record<string, string>;
  /** 图片数据 */
  images?: Array<{
    type: string;
    data: Blob | string;
    name?: string;
  }>;
}

export interface PasteImportResult {
  /** 解析的节点 */
  nodes: Node[];
  /** 检测到的来源 */
  source?: 'word' | 'excel' | 'web' | 'markdown' | 'plain' | 'custom';
  /** 提取的格式 */
  formats?: string[];
  /** 警告信息 */
  warnings?: string[];
}

/**
 * 剪贴板导入器
 */
export class PasteImporter {
  private options: PasteImportOptions;
  private htmlImporter: HTMLImporter;
  private markdownImporter: MarkdownImporter;
  private textImporter: TextImporter;

  constructor(options: PasteImportOptions = {}) {
    this.options = {
      preferHTML: true,
      cleanWordStyles: true,
      ...options,
    };

    this.htmlImporter = new HTMLImporter(options.htmlOptions);
    this.markdownImporter = new MarkdownImporter(options.markdownOptions);
    this.textImporter = new TextImporter(options.textOptions);
  }

  /**
   * 从剪贴板数据导入
   */
  import(data: PasteData, options?: PasteImportOptions): PasteImportResult {
    const mergedOptions = { ...this.options, ...options };
    const warnings: string[] = [];
    const formats: string[] = [];

    // 检测可用的格式
    if (data.html) formats.push('html');
    if (data.markdown) formats.push('markdown');
    if (data.text) formats.push('text');
    if (data.rtf) formats.push('rtf');
    if (data.images?.length) formats.push('images');
    if (data.custom) formats.push(...Object.keys(data.custom));

    // 检测来源
    const source = this.detectSource(data);

    // 优先处理自定义格式
    if (data.custom && mergedOptions.customHandlers) {
      for (const [format, handler] of Object.entries(mergedOptions.customHandlers)) {
        if (data.custom[format]) {
          try {
            const nodes = handler(data.custom[format]);
            return { nodes, source: 'custom', formats, warnings };
          } catch (error) {
            warnings.push(`Custom handler for ${format} failed: ${error}`);
          }
        }
      }
    }

    // 处理图片
    if (data.images?.length) {
      const imageNodes = this.processImages(data.images, mergedOptions);
      if (imageNodes.length && !data.html && !data.text) {
        return { nodes: imageNodes, source: 'plain', formats, warnings };
      }
    }

    // 选择最佳格式
    let nodes: Node[] = [];

    if (mergedOptions.preferHTML && data.html) {
      // 清理 Word 样式
      let html = data.html;
      if (mergedOptions.cleanWordStyles && source === 'word') {
        html = this.cleanWordHTML(html);
      }

      const result = this.htmlImporter.import(html, {
        ...mergedOptions.htmlOptions,
        imageHandler: mergedOptions.imageHandler
          ? (src: string) => {
              const transformed = mergedOptions.imageHandler?.(src);
              return typeof transformed === 'string' ? transformed : src;
            }
          : undefined,
        linkHandler: mergedOptions.linkHandler,
      });
      nodes = result.nodes;
    } else if (data.markdown) {
      const result = this.markdownImporter.import(data.markdown, mergedOptions.markdownOptions);
      nodes = result.nodes;
    } else if (data.text) {
      const result = this.textImporter.import(data.text, mergedOptions.textOptions);
      nodes = result.nodes;
    } else {
      warnings.push('No recognizable content found');
      nodes = [];
    }

    // 处理内嵌图片
    if (data.images?.length) {
      const imageNodes = this.processImages(data.images, mergedOptions);
      nodes = [...nodes, ...imageNodes];
    }

    return { nodes, source, formats, warnings };
  }

  /**
   * 从 Clipboard API 事件导入
   */
  async importFromClipboardEvent(
    event: ClipboardEvent,
    options?: PasteImportOptions
  ): Promise<PasteImportResult> {
    const mergedOptions = { ...this.options, ...options };
    const data: PasteData = {};
    const clipboardData = event.clipboardData;

    if (!clipboardData) {
      return { nodes: [], warnings: ['No clipboard data available'] };
    }

    // 获取所有可用类型
    const types = Array.from(clipboardData.types);

    // 读取 HTML
    if (types.includes('text/html')) {
      data.html = clipboardData.getData('text/html');
    }

    // 读取文本
    if (types.includes('text/plain')) {
      data.text = clipboardData.getData('text/plain');
    }

    // 读取 Markdown（某些编辑器支持）
    if (types.includes('text/markdown') || types.includes('text/x-markdown')) {
      data.markdown = clipboardData.getData('text/markdown') || 
                     clipboardData.getData('text/x-markdown');
    }

    // 读取 RTF
    if (types.includes('text/rtf')) {
      data.rtf = clipboardData.getData('text/rtf');
    }

    // 读取文件（图片）
    const files = Array.from(clipboardData.files);
    if (files.length > 0) {
      data.images = await this.processFiles(files);
    }

    // 读取自定义类型
    data.custom = {};
    for (const type of types) {
      if (!type.startsWith('text/')) {
        try {
          data.custom[type] = clipboardData.getData(type);
        } catch {
          // 忽略无法读取的类型
        }
      }
    }

    return this.import(data, mergedOptions);
  }

  /**
   * 从 DataTransfer 导入（拖放）
   */
  async importFromDataTransfer(
    dataTransfer: DataTransfer,
    options?: PasteImportOptions
  ): Promise<PasteImportResult> {
    const mergedOptions = { ...this.options, ...options };
    const data: PasteData = {};

    // 读取 HTML
    data.html = dataTransfer.getData('text/html') || undefined;
    data.text = dataTransfer.getData('text/plain') || undefined;

    // 处理文件
    const files = Array.from(dataTransfer.files);
    if (files.length > 0) {
      data.images = await this.processFiles(files);
    }

    return this.import(data, mergedOptions);
  }

  /**
   * 检测内容来源
   */
  private detectSource(data: PasteData): PasteImportResult['source'] {
    if (data.html) {
      // Word 检测
      if (data.html.includes('urn:schemas-microsoft-com:office') ||
          data.html.includes('xmlns:o="urn:schemas-microsoft-com:office:office"') ||
          data.html.includes('class="Mso')) {
        return 'word';
      }

      // Excel 检测
      if (data.html.includes('application/vnd.ms-excel') ||
          data.html.includes('xmlns:x="urn:schemas-microsoft-com:office:excel"')) {
        return 'excel';
      }

      // 网页检测
      if (data.html.includes('<!DOCTYPE') || 
          data.html.includes('<html') ||
          data.html.includes('class="') ||
          data.html.includes('id="')) {
        return 'web';
      }
    }

    if (data.markdown) {
      return 'markdown';
    }

    return 'plain';
  }

  /**
   * 清理 Word HTML
   */
  private cleanWordHTML(html: string): string {
    let cleaned = html;

    // 移除 Word 命名空间
    cleaned = cleaned.replace(/xmlns:o="[^"]*"/g, '');
    cleaned = cleaned.replace(/xmlns:w="[^"]*"/g, '');
    cleaned = cleaned.replace(/xmlns:m="[^"]*"/g, '');

    // 移除 Word 特定标签
    cleaned = cleaned.replace(/<o:[^>]*>.*?<\/o:[^>]*>/gi, '');
    cleaned = cleaned.replace(/<w:[^>]*>.*?<\/w:[^>]*>/gi, '');

    // 移除 Mso 类
    cleaned = cleaned.replace(/class="Mso[^"]*"/gi, '');

    // 移除样式属性中的 Word 特定内容
    cleaned = cleaned.replace(/style="[^"]*mso-[^;]*;?[^"]*"/gi, '');
    cleaned = cleaned.replace(/style="[^"]*tab-stops:[^;]*;?[^"]*"/gi, '');

    // 移除 lang 属性
    cleaned = cleaned.replace(/lang="[^"]*"/gi, '');

    // 移除空的 style 属性
    cleaned = cleaned.replace(/style="\s*"/gi, '');

    // 移除空的 span
    cleaned = cleaned.replace(/<span\s*>\s*<\/span>/gi, '');

    // 移除多余的换行
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');

    return cleaned;
  }

  /**
   * 处理文件列表
   */
  private async processFiles(files: File[]): Promise<PasteData['images']> {
    const images: PasteData['images'] = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        images.push({
          type: file.type,
          data: file,
          name: file.name,
        });
      }
    }

    return images;
  }

  /**
   * 处理图片
   */
  private processImages(
    images: PasteData['images'],
    options: PasteImportOptions
  ): Node[] {
    const nodes: Node[] = [];

    for (const image of images || []) {
      const src = typeof image.data === 'string' 
        ? image.data 
        : URL.createObjectURL(image.data);

      nodes.push({
        type: 'element',
        nodeType: 'image',
        children: [],
        attrs: {
          src,
          alt: image.name || 'Pasted image',
        },
      });
    }

    return nodes;
  }

  /**
   * 序列化图片为 DataURL
   */
  private async fileToDataURL(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 创建纯文本粘贴处理器
   */
  static createPlainTextHandler(): (data: PasteData) => PasteImportResult {
    const importer = new PasteImporter({ preferHTML: false });
    
    return (data: PasteData) => {
      const result = importer.import({
        text: data.text || '',
      });
      return { ...result, source: 'plain' };
    };
  }

  /**
   * 创建仅保留文本的处理器（安全粘贴）
   */
  static createSafeHandler(): (data: PasteData) => PasteImportResult {
    const textImporter = new TextImporter({
      detectLists: true,
      detectHeadings: true,
    });

    return (data: PasteData) => {
      const text = data.text || '';
      const result = textImporter.import(text);
      return {
        nodes: result.nodes,
        source: 'plain',
        formats: ['text'],
      };
    };
  }
}

// 便捷函数
export function importFromPaste(
  data: PasteData,
  options?: PasteImportOptions
): PasteImportResult {
  const importer = new PasteImporter(options);
  return importer.import(data, options);
}

export async function importFromClipboardEvent(
  event: ClipboardEvent,
  options?: PasteImportOptions
): Promise<PasteImportResult> {
  const importer = new PasteImporter(options);
  return importer.importFromClipboardEvent(event, options);
}

export async function importFromDataTransfer(
  dataTransfer: DataTransfer,
  options?: PasteImportOptions
): Promise<PasteImportResult> {
  const importer = new PasteImporter(options);
  return importer.importFromDataTransfer(dataTransfer, options);
}

export default PasteImporter;
