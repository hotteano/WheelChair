/**
 * WheelChair Importer
 * WheelChair 专属格式 (.wc) 导入器
 */

import type { Node } from '../model/node';
import type { ImportOptions } from '../utils/importExport';
import { ExportFormat } from '../utils/importExport';
import type { WCFileStructure } from '../exporters/WCExporter';

export interface WCImportOptions extends ImportOptions {
  /** 是否验证文件结构 */
  validate?: boolean;
  /** 版本不兼容时的处理策略 */
  versionPolicy?: 'strict' | 'loose' | 'upgrade';
}

export interface WCImportResult {
  /** 解析的节点 */
  nodes: Node[];
  /** 文档标题 */
  title: string;
  /** 元数据 */
  metadata: WCFileStructure['metadata'];
  /** 文件信息 */
  fileInfo: {
    format: string;
    version: string;
    createdAt: Date;
    modifiedAt: Date;
  };
  /** 是否成功解压 */
  decompressed: boolean;
}

export class WCImporter {
  readonly format = ExportFormat.WC;
  readonly name = 'WheelChair Document';
  readonly extensions = ['wc'];
  readonly mimeType = 'application/wheelchair+json';

  private options: WCImportOptions;

  constructor(options: WCImportOptions = {}) {
    this.options = {
      validate: true,
      versionPolicy: 'loose',
      ...options,
    };
  }

  /**
   * 导入 .wc 文件内容
   */
  import(content: string, options?: WCImportOptions): WCImportResult {
    const mergedOptions = { ...this.options, ...options };

    try {
      // 检查是否是压缩格式
      let jsonContent = content;
      let decompressed = false;

      if (content.startsWith('COMPRESSED:')) {
        jsonContent = this.decompressContent(content);
        decompressed = true;
      }

      // 解析 JSON
      const wcFile: WCFileStructure = JSON.parse(jsonContent);

      // 验证文件结构
      if (mergedOptions.validate) {
        this.validateWCFile(wcFile, mergedOptions.versionPolicy);
      }

      // 提取内容节点
      const nodes = Array.isArray(wcFile.document.content)
        ? wcFile.document.content
        : [wcFile.document.content];

      return {
        nodes,
        title: wcFile.document.title,
        metadata: wcFile.metadata,
        fileInfo: {
          format: wcFile.format,
          version: wcFile.version,
          createdAt: new Date(wcFile.createdAt),
          modifiedAt: new Date(wcFile.modifiedAt),
        },
        decompressed,
      };
    } catch (error) {
      throw new Error(`Failed to import .wc file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 从文件导入
   */
  async importFromFile(file: File, options?: WCImportOptions): Promise<WCImportResult> {
    const content = await this.readFile(file);
    return this.import(content, options);
  }

  /**
   * 验证 .wc 文件结构
   */
  private validateWCFile(
    wcFile: WCFileStructure,
    versionPolicy?: 'strict' | 'loose' | 'upgrade'
  ): void {
    // 检查必需字段
    if (!wcFile.format || wcFile.format !== 'wheelchair') {
      throw new Error('Invalid .wc file: missing or invalid format field');
    }

    if (!wcFile.version) {
      throw new Error('Invalid .wc file: missing version field');
    }

    if (!wcFile.document) {
      throw new Error('Invalid .wc file: missing document field');
    }

    if (!wcFile.document.title) {
      throw new Error('Invalid .wc file: missing document title');
    }

    if (!wcFile.document.content) {
      throw new Error('Invalid .wc file: missing document content');
    }

    // 版本检查
    const supportedVersion = '1.0.0';
    const fileVersion = wcFile.version;

    if (versionPolicy === 'strict' && fileVersion !== supportedVersion) {
      throw new Error(`Version mismatch: file version ${fileVersion} is not supported (requires ${supportedVersion})`);
    }

    // 简单的版本兼容性检查（主版本号必须相同）
    if (versionPolicy === 'loose') {
      const fileMajor = fileVersion.split('.')[0];
      const supportedMajor = supportedVersion.split('.')[0];
      if (fileMajor !== supportedMajor) {
        throw new Error(`Major version mismatch: file version ${fileVersion} is incompatible with supported version ${supportedVersion}`);
      }
    }
  }

  /**
   * 解压内容
   */
  private decompressContent(content: string): string {
    try {
      if (!content.startsWith('COMPRESSED:')) {
        return content;
      }

      const compressed = content.slice('COMPRESSED:'.length);
      
      // 在浏览器环境中使用 atob 进行 Base64 解码
      if (typeof window !== 'undefined') {
        return decodeURIComponent(escape(atob(compressed)));
      }
      
      return compressed;
    } catch (error) {
      throw new Error(`Failed to decompress content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 读取文件内容
   */
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error(`Failed to read file: ${e}`));
      reader.readAsText(file);
    });
  }

  /**
   * 检测内容是否为有效的 .wc 格式
   */
  static isWCContent(content: string): boolean {
    try {
      // 检查是否是压缩格式
      let jsonContent = content;
      if (content.startsWith('COMPRESSED:')) {
        jsonContent = atob(content.slice('COMPRESSED:'.length));
      }

      const parsed = JSON.parse(jsonContent);
      return parsed.format === 'wheelchair' && !!parsed.document;
    } catch {
      return false;
    }
  }

  /**
   * 从导入结果创建文档对象
   */
  createDocumentFromImport(result: WCImportResult): {
    title: string;
    content: unknown;
    wordCount: number;
    metadata: Record<string, unknown>;
  } {
    return {
      title: result.title,
      content: result.nodes,
      wordCount: result.nodes.reduce((count, node) => count + this.countWords(node), 0),
      metadata: {
        ...result.metadata,
        importedFrom: 'wc',
        importedAt: new Date().toISOString(),
        originalCreatedAt: result.fileInfo.createdAt.toISOString(),
        originalModifiedAt: result.fileInfo.modifiedAt.toISOString(),
      },
    };
  }

  /**
   * 计算字数
   */
  private countWords(node: Node & { text?: string; children?: Node[] }): number {
    let count = 0;

    if (node.type === 'text' && node.text) {
      const text = node.text;
      const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      const englishWords = text
        .replace(/[\u4e00-\u9fa5]/g, '')
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0).length;
      count += chineseChars + englishWords;
    }

    if (node.children) {
      node.children.forEach(child => {
        count += this.countWords(child);
      });
    }

    return count;
  }
}

export default WCImporter;
