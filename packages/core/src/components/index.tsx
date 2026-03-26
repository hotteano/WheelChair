import React from 'react';

// ============================================
// 工具栏组件
// ============================================
export { Toolbar } from './Toolbar/Toolbar';
export { ToolbarButton } from './Toolbar/ToolbarButton';
export { ToolbarDropdown } from './Toolbar/ToolbarDropdown';
export { ToolbarDivider } from './Toolbar/ToolbarDivider';

// ============================================
// 浮动菜单
// ============================================
export { BubbleMenu } from './BubbleMenu';

// ============================================
// 斜杠菜单
// ============================================
export { SlashMenu } from './SlashMenu';

// ============================================
// 状态栏
// ============================================
export { StatusBar } from './StatusBar';

// ============================================
// 图片上传组件
// ============================================
export {
  ImageUpload,
  ImageResize,
  ImageMenu,
  useImageUpload,
} from './ImageUpload';

// ============================================
// 链接菜单组件
// ============================================
export {
  LinkMenu,
  LinkPreview,
} from './LinkMenu';

// ============================================
// 代码块组件
// ============================================
export {
  CodeBlockView,
  LanguageSelector,
} from './CodeBlock';

// ============================================
// 表格菜单
// ============================================
export {
  TableMenu,
  TableGrid,
} from './TableMenu';

// ============================================
// 导出菜单
// ============================================
export { ExportMenu } from './ExportMenu';

// ============================================
// 侧边栏组件
// ============================================
export {
  Sidebar,
  SearchBox,
  NewDocumentButton,
  DocumentList,
  DocumentItem,
} from './Sidebar';

// ============================================
// 编辑器布局组件
// ============================================
export { EditorLayout } from './EditorLayout';

// ============================================
// 编辑器专用组件（为演示应用提供）
// ============================================

// 工具栏（编辑器专用）
export const EditorToolbar = ({ editor }: { editor: any }) => {
  // 简化的工具栏组件
  if (!editor) return null;
  
  return (
    <div className="editor-toolbar">
      <Toolbar>
        <ToolbarButton 
          icon={<span>B</span>} 
          label="粗体"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton 
          icon={<span>I</span>} 
          label="斜体"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton 
          icon={<span>U</span>} 
          label="下划线"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarDivider />
        <ToolbarDropdown
          label="标题"
          value={editor.isActive('heading', { level: 1 }) ? 'h1' : 
                 editor.isActive('heading', { level: 2 }) ? 'h2' :
                 editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
          options={[
            { value: 'p', label: '正文' },
            { value: 'h1', label: '标题 1' },
            { value: 'h2', label: '标题 2' },
            { value: 'h3', label: '标题 3' },
          ]}
          onChange={(value) => {
            if (value === 'p') {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(value.replace('h', '')) as 1 | 2 | 3;
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
        />
      </Toolbar>
    </div>
  );
};

// 状态栏（编辑器专用）
export const EditorStatusBar = ({ 
  editor, 
  lastSaved 
}: { 
  editor: any; 
  lastSaved: Date | null;
}) => {
  if (!editor) return null;
  
  const wordCount = editor.storage.characterCount?.words || 0;
  const charCount = editor.storage.characterCount?.characters || 0;
  
  return (
    <StatusBar
      stats={{
        words: wordCount,
        characters: charCount,
        paragraphs: 0,
        readingTime: Math.ceil(wordCount / 200),
      }}
      currentStyle={editor.isActive('heading', { level: 1 }) ? '标题 1' :
                    editor.isActive('heading', { level: 2 }) ? '标题 2' :
                    editor.isActive('heading', { level: 3 }) ? '标题 3' : '正文'}
      isSaved={!!lastSaved}
    />
  );
};

// 导出按钮
export const ExportButton = ({ getContent }: { getContent: () => string }) => {
  const handleExport = () => {
    const content = getContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <button className="btn btn-secondary" onClick={handleExport}>
      导出 HTML
    </button>
  );
};

// 导入按钮
export const ImportButton = ({ onImport }: { onImport: (content: string) => void }) => {
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.md,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onImport(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  return (
    <button className="btn btn-secondary" onClick={handleImport}>
      导入
    </button>
  );
};

// 主题切换按钮
export const ThemeToggle = ({ 
  theme, 
  onToggle 
}: { 
  theme: string; 
  onToggle: () => void;
}) => {
  return (
    <button 
      className="theme-toggle" 
      onClick={onToggle}
      title={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
};

// 简单的图标组件
const BoldIcon = () => <span style={{ fontWeight: 'bold' }}>B</span>;
const ItalicIcon = () => <span style={{ fontStyle: 'italic' }}>I</span>;
const UnderlineIcon = () => <span style={{ textDecoration: 'underline' }}>U</span>;
