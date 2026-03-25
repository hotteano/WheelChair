/**
 * ExportMenu Component
 * 导出菜单组件 - 支持导出为 Markdown, HTML, JSON, 纯文本
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Node } from '../../model/node';
import type { ExportFormat, ExportOptions } from '../../utils/importExport';
import { ExportFormat as ExportFormatEnum } from '../../utils/importExport';

// 导出器
import { MarkdownExporter, MarkdownExportOptions } from '../../exporters/MarkdownExporter';
import { HTMLExporter, HTMLExportOptions } from '../../exporters/HTMLExporter';
import { TextExporter, TextExportOptions } from '../../exporters/TextExporter';
import { JSONExporter, JSONExportOptions } from '../../exporters/JSONExporter';

import './ExportMenu.css';

export interface ExportMenuProps {
  /** 编辑器节点 */
  nodes: Node[];
  /** 文档标题 */
  title?: string;
  /** 触发按钮 */
  trigger?: React.ReactNode;
  /** 导出回调 */
  onExport?: (format: ExportFormat, content: string) => void;
  /** 关闭回调 */
  onClose?: () => void;
  /** 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 是否显示选项 */
  showOptions?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

export interface ExportFormatInfo {
  format: ExportFormat;
  name: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
  mimeType: string;
}

export const EXPORT_FORMATS: ExportFormatInfo[] = [
  {
    format: ExportFormatEnum.MARKDOWN,
    name: 'Markdown',
    description: '导出为 Markdown 格式，适合文档共享',
    icon: '📝',
    extension: 'md',
    mimeType: 'text/markdown',
  },
  {
    format: ExportFormatEnum.HTML,
    name: 'HTML',
    description: '导出为 HTML 格式，保留样式',
    icon: '🌐',
    extension: 'html',
    mimeType: 'text/html',
  },
  {
    format: ExportFormatEnum.JSON,
    name: 'JSON',
    description: '导出为 JSON 格式，结构化数据',
    icon: '📊',
    extension: 'json',
    mimeType: 'application/json',
  },
  {
    format: ExportFormatEnum.TEXT,
    name: '纯文本',
    description: '导出为纯文本格式，去除所有格式',
    icon: '📄',
    extension: 'txt',
    mimeType: 'text/plain',
  },
];

/**
 * 导出菜单组件
 */
export const ExportMenu: React.FC<ExportMenuProps> = ({
  nodes,
  title,
  trigger,
  onExport,
  onClose,
  position = 'bottom',
  showPreview = false,
  showOptions = false,
  className = '',
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 切换菜单显示
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
    if (isOpen) {
      onClose?.();
    }
  }, [isOpen, onClose]);

  // 生成文件名
  const generateFilename = useCallback((format: ExportFormat): string => {
    const baseName = title || 'document';
    const formatInfo = EXPORT_FORMATS.find(f => f.format === format);
    const extension = formatInfo?.extension || format;
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${baseName}-${timestamp}.${extension}`;
  }, [title]);

  // 导出为 Markdown
  const exportMarkdown = useCallback((options?: MarkdownExportOptions): string => {
    const exporter = new MarkdownExporter({
      frontmatter: true,
      metadata: title ? { title } : undefined,
      ...options,
    });
    return exporter.export(nodes, options);
  }, [nodes, title]);

  // 导出为 HTML
  const exportHTML = useCallback((options?: HTMLExportOptions): string => {
    const exporter = new HTMLExporter({
      fullDocument: true,
      title,
      syntaxHighlight: true,
      ...options,
    });
    return exporter.export(nodes, options);
  }, [nodes, title]);

  // 导出为 JSON
  const exportJSON = useCallback((options?: JSONExportOptions): string => {
    const exporter = new JSONExporter({
      includeMetadata: true,
      metadata: title ? { title } : undefined,
      includeVersion: true,
      ...options,
    });
    return exporter.export(nodes, options);
  }, [nodes, title]);

  // 导出为纯文本
  const exportText = useCallback((options?: TextExportOptions): string => {
    const exporter = new TextExporter({
      preserveEmptyLines: true,
      paragraphSpacing: true,
      ...options,
    });
    return exporter.export(nodes, options);
  }, [nodes]);

  // 处理导出
  const handleExport = useCallback(async (format: ExportFormat, download: boolean = true) => {
    setIsLoading(true);
    setSelectedFormat(format);

    try {
      let content = '';

      switch (format) {
        case ExportFormatEnum.MARKDOWN:
          content = exportMarkdown();
          break;
        case ExportFormatEnum.HTML:
          content = exportHTML();
          break;
        case ExportFormatEnum.JSON:
          content = exportJSON();
          break;
        case ExportFormatEnum.TEXT:
          content = exportText();
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // 更新预览
      if (showPreview) {
        setPreviewContent(content);
      }

      // 调用回调
      onExport?.(format, content);

      // 下载文件
      if (download) {
        downloadFile(content, generateFilename(format), format);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [exportMarkdown, exportHTML, exportJSON, exportText, generateFilename, onExport, showPreview]);

  // 快速导出（直接下载）
  const handleQuickExport = useCallback((format: ExportFormat) => {
    handleExport(format, true);
    setIsOpen(false);
  }, [handleExport]);

  // 复制到剪贴板
  const handleCopy = useCallback(async (format: ExportFormat) => {
    setIsLoading(true);

    try {
      let content = '';

      switch (format) {
        case ExportFormatEnum.MARKDOWN:
          content = exportMarkdown();
          break;
        case ExportFormatEnum.HTML:
          content = exportHTML();
          break;
        case ExportFormatEnum.JSON:
          content = exportJSON();
          break;
        case ExportFormatEnum.TEXT:
          content = exportText();
          break;
      }

      await navigator.clipboard.writeText(content);
      
      // 显示提示
      showToast('已复制到剪贴板');
    } catch (error) {
      console.error('Copy failed:', error);
      showToast('复制失败');
    } finally {
      setIsLoading(false);
    }
  }, [exportMarkdown, exportHTML, exportJSON, exportText]);

  // 获取位置样式
  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'top':
        return { bottom: '100%', left: 0, marginBottom: 8 };
      case 'bottom':
        return { top: '100%', left: 0, marginTop: 8 };
      case 'left':
        return { right: '100%', top: 0, marginRight: 8 };
      case 'right':
        return { left: '100%', top: 0, marginLeft: 8 };
      default:
        return { top: '100%', left: 0, marginTop: 8 };
    }
  };

  return (
    <div ref={menuRef} className={`export-menu-container ${className}`} style={style}>
      {/* 触发按钮 */}
      <button
        className="export-menu-trigger"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger || (
          <>
            <span className="export-icon">⬇️</span>
            <span>导出</span>
          </>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="export-menu-dropdown" style={getPositionStyles()}>
          <div className="export-menu-header">
            <h4>导出为</h4>
          </div>

          <div className="export-menu-list">
            {EXPORT_FORMATS.map((format) => (
              <div key={format.format} className="export-menu-item">
                <button
                  className="export-menu-button"
                  onClick={() => handleQuickExport(format.format)}
                  disabled={isLoading}
                >
                  <span className="export-format-icon">{format.icon}</span>
                  <div className="export-format-info">
                    <span className="export-format-name">{format.name}</span>
                    <span className="export-format-desc">{format.description}</span>
                  </div>
                </button>

                <div className="export-menu-actions">
                  <button
                    className="export-action-btn"
                    onClick={() => handleCopy(format.format)}
                    title="复制"
                    disabled={isLoading}
                  >
                    📋
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 预览区域 */}
          {showPreview && selectedFormat && (
            <div className="export-preview">
              <div className="export-preview-header">
                <span>预览</span>
                <button
                  className="export-preview-close"
                  onClick={() => setSelectedFormat(null)}
                >
                  ✕
                </button>
              </div>
              <pre className="export-preview-content">{previewContent}</pre>
            </div>
          )}

          {/* 选项区域 */}
          {showOptions && (
            <div className="export-options">
              <label className="export-option">
                <input type="checkbox" />
                <span>包含元数据</span>
              </label>
              <label className="export-option">
                <input type="checkbox" />
                <span>美化输出</span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 下载文件
 */
function downloadFile(content: string, filename: string, format: ExportFormat): void {
  const formatInfo = EXPORT_FORMATS.find(f => f.format === format);
  const mimeType = formatInfo?.mimeType || 'text/plain';

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * 显示提示
 */
function showToast(message: string): void {
  const toast = document.createElement('div');
  toast.className = 'export-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}

// 便捷导出函数
export { exportToFile };

interface ExportToFileOptions {
  nodes: Node[];
  format: ExportFormat;
  filename?: string;
  title?: string;
}

/**
 * 导出到文件
 */
function exportToFile(options: ExportToFileOptions): { content: string; filename: string } {
  const { nodes, format, title } = options;
  let content = '';
  let extension = '';

  switch (format) {
    case ExportFormatEnum.MARKDOWN:
      const mdExporter = new MarkdownExporter({ frontmatter: !!title, metadata: title ? { title } : undefined });
      content = mdExporter.export(nodes);
      extension = 'md';
      break;
    case ExportFormatEnum.HTML:
      const htmlExporter = new HTMLExporter({ fullDocument: true, title });
      content = htmlExporter.export(nodes);
      extension = 'html';
      break;
    case ExportFormatEnum.JSON:
      const jsonExporter = new JSONExporter({ includeMetadata: true, metadata: title ? { title } : undefined });
      content = jsonExporter.export(nodes);
      extension = 'json';
      break;
    case ExportFormatEnum.TEXT:
      const textExporter = new TextExporter();
      content = textExporter.export(nodes);
      extension = 'txt';
      break;
  }

  const baseName = title || 'document';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = options.filename || `${baseName}-${timestamp}.${extension}`;

  // 触发下载
  const formatInfo = EXPORT_FORMATS.find(f => f.format === format);
  const blob = new Blob([content], { type: formatInfo?.mimeType || 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { content, filename };
}

export default ExportMenu;
