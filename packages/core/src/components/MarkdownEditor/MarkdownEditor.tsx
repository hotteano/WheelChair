/**
 * WheelChair Editor - Markdown Editor Component
 * Markdown 编辑器组件 - 支持编辑模式和预览模式切换
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { MarkdownPreview } from '../MarkdownPreview';
import { SplitPane } from '../SplitPane';
import './MarkdownEditor.css';

// ============================================
// 类型定义
// ============================================

export type EditorMode = 'edit' | 'preview' | 'split';

export interface MarkdownEditorProps {
  /** 初始内容 */
  initialContent?: string;
  /** 当前模式 */
  mode?: EditorMode;
  /** 模式变化回调 */
  onModeChange?: (mode: EditorMode) => void;
  /** 内容变化回调 */
  onChange?: (content: string, markdown: string) => void;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自动保存间隔（毫秒），0 表示不自动保存 */
  autoSaveInterval?: number;
  /** 自定义类名 */
  className?: string;
  /** 工具栏渲染函数 */
  renderToolbar?: (props: {
    mode: EditorMode;
    setMode: (mode: EditorMode) => void;
    isDirty: boolean;
    wordCount: number;
  }) => React.ReactNode;
}

// ============================================
// 工具函数
// ============================================

/**
 * 将编辑器 JSON 内容转换为 Markdown 文本
 * 这是一个简化版本，实际项目中可能需要更完整的实现
 */
function jsonToMarkdown(node: any): string {
  if (!node) return '';
  
  switch (node.type) {
    case 'doc':
      return node.content?.map(jsonToMarkdown).join('\n\n') || '';
    
    case 'paragraph':
      return node.content?.map(jsonToMarkdown).join('') || '';
    
    case 'heading':
      const level = node.attrs?.level || 1;
      const headingText = node.content?.map(jsonToMarkdown).join('') || '';
      return `${'#'.repeat(level)} ${headingText}`;
    
    case 'blockquote':
      const quoteText = node.content?.map(jsonToMarkdown).join('\n') || '';
      return quoteText.split('\n').map((line: string) => `> ${line}`).join('\n');
    
    case 'bulletList':
      return node.content?.map((item: any) => {
        const itemText = item.content?.map(jsonToMarkdown).join('\n') || '';
        return itemText.split('\n').map((line: string, i: number) => 
          i === 0 ? `- ${line}` : `  ${line}`
        ).join('\n');
      }).join('\n');
    
    case 'orderedList':
      return node.content?.map((item: any, index: number) => {
        const itemText = item.content?.map(jsonToMarkdown).join('\n') || '';
        return itemText.split('\n').map((line: string, i: number) => 
          i === 0 ? `${index + 1}. ${line}` : `   ${line}`
        ).join('\n');
      }).join('\n');
    
    case 'codeBlock':
      const lang = node.attrs?.language || '';
      const code = node.content?.map(jsonToMarkdown).join('') || '';
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    
    case 'horizontalRule':
      return '---';
    
    case 'text':
      let text = node.text || '';
      // 应用 marks
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case 'bold':
            case 'strong':
              text = `**${text}**`;
              break;
            case 'italic':
            case 'em':
              text = `*${text}*`;
              break;
            case 'strike':
              text = `~~${text}~~`;
              break;
            case 'code':
              text = `\`${text}\``;
              break;
            case 'link':
              const href = mark.attrs?.href || '';
              text = `[${text}](${href})`;
              break;
          }
        });
      }
      return text;
    
    case 'hardBreak':
      return '\n';
    
    default:
      return node.content?.map(jsonToMarkdown).join('') || '';
  }
}

// ============================================
// 组件
// ============================================

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent = '',
  mode: controlledMode,
  onModeChange,
  onChange,
  readOnly = false,

  className = '',
  renderToolbar,
}) => {
  // 内部模式状态（非受控模式）
  const [internalMode, setInternalMode] = useState<EditorMode>('edit');
  const [isDirty, setIsDirty] = useState(false);
  
  // 使用受控或非受控模式
  const mode = controlledMode ?? internalMode;
  const setMode = useCallback((newMode: EditorMode) => {
    setInternalMode(newMode);
    onModeChange?.(newMode);
  }, [onModeChange]);
  
  // 创建编辑器
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editable: !readOnly && mode !== 'preview',
    onUpdate: ({ editor }) => {
      setIsDirty(true);
      const json = editor.getJSON();
      const markdown = jsonToMarkdown(json);
      onChange?.(JSON.stringify(json), markdown);
    },
  });
  
  // 计算字数
  const wordCount = useMemo(() => {
    if (!editor) return 0;
    const text = editor.getText();
    // 中文字符 + 英文单词
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }, [editor?.state]);
  
  // 获取 Markdown 内容用于预览
  const markdownContent = useMemo(() => {
    if (!editor) return '';
    return jsonToMarkdown(editor.getJSON());
  }, [editor?.state]);
  
  // 渲染工具栏
  const toolbar = renderToolbar?.({ mode, setMode, isDirty, wordCount });
  
  // 渲染编辑器内容
  const renderEditor = () => (
    <div className="wch-markdown-editor__editor">
      {toolbar && (
        <div className="wch-markdown-editor__toolbar">
          {toolbar}
        </div>
      )}
      <div className="wch-markdown-editor__content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
  
  // 渲染预览内容
  const renderPreview = () => (
    <div className="wch-markdown-editor__preview">
      {mode === 'preview' && toolbar && (
        <div className="wch-markdown-editor__toolbar">
          {toolbar}
        </div>
      )}
      <MarkdownPreview 
        content={markdownContent}
        theme="light"
      />
    </div>
  );
  
  // 根据模式渲染
  const renderContent = () => {
    switch (mode) {
      case 'edit':
        return renderEditor();
      
      case 'preview':
        return renderPreview();
      
      case 'split':
        return (
          <div className="wch-markdown-editor__split-wrapper">
            {toolbar && (
              <div className="wch-markdown-editor__toolbar">
                {toolbar}
              </div>
            )}
            <SplitPane
              direction="horizontal"
              defaultSplit={50}
              minSize={250}
              firstPane={
                <div className="wch-markdown-editor__content">
                  <EditorContent editor={editor} />
                </div>
              }
              secondPane={
                <MarkdownPreview 
                  content={markdownContent}
                  theme="light"
                />
              }
            />
          </div>
        );
      
      default:
        return renderEditor();
    }
  };
  
  return (
    <div className={`wch-markdown-editor wch-markdown-editor--${mode} ${className}`}>
      {renderContent()}
    </div>
  );
};

export default MarkdownEditor;
