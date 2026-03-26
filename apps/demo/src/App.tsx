import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  useDocumentManager, 
  EditorLayout,
  type JSONContent 
} from '@wheelchair/core';
import { useTheme } from '@wheelchair/core/context/ThemeContext';
import './App.css';

// 图标组件
const BoldIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></svg>;
const ItalicIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const UnderlineIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>;
const StrikeIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 11.5c.3 2.3-1.2 4.3-3.5 4.8-3.3.7-6.8-.2-9.5-2.4"/><path d="M17 5.2c1.7 1.5 2.5 3.6 2 5.8"/><path d="M4 12h16"/></svg>;
const H1Icon = () => <span className="icon-text">H1</span>;
const H2Icon = () => <span className="icon-text">H2</span>;
const H3Icon = () => <span className="icon-text">H3</span>;
const ListIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const OrderedListIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>;
const QuoteIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>;
const CodeIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const LinkIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
const ImageIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const UndoIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9.003 9.003 0 00-9-9 9.003 9.003 0 00-8 4.95"/></svg>;
const RedoIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9.003 9.003 0 019-9 9.003 9.003 0 018 4.95"/></svg>;
const ClearIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, isActive, disabled, title, children }) => (
  <button
    className={`toolbar-btn ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
  >
    {children}
  </button>
);

const Divider = () => <div className="toolbar-divider" />;

function App() {
  const { theme, toggleTheme } = useTheme();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  
  // 使用文档管理器
  const documentManager = useDocumentManager();
  const { 
    activeDocument, 
    updateDocumentContent,
    isLoading,
  } = documentManager;

  // 编辑器实例
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
    ],
    content: activeDocument?.content || '',
    editable: true,
    autofocus: 'end',
    onUpdate: useCallback(({ editor }) => {
      if (activeDocument) {
        updateDocumentContent(activeDocument.id, editor.getJSON());
        setLastSaved(new Date());
      }
    }, [activeDocument, updateDocumentContent]),
  });

  // 当切换文档时，更新编辑器内容
  useEffect(() => {
    if (editor && activeDocument) {
      // 只有当内容不同时才更新，避免光标跳动
      const currentContent = editor.getJSON();
      const newContent = activeDocument.content;
      
      if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
        editor.commands.setContent(newContent, false);
      }
    }
  }, [editor, activeDocument?.id]); // 只在文档ID变化时触发

  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const handleSave = useCallback(() => {
    setLastSaved(new Date());
    console.log('保存内容:', editor?.getHTML());
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('请输入图片 URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
    } else {
      setShowLinkInput(true);
    }
  }, [editor]);

  const confirmLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  }, [editor, linkUrl]);

  const wordCount = editor ? {
    words: editor.getText().trim().split(/\s+/).filter(w => w.length > 0).length,
    characters: editor.getText().length,
  } : { words: 0, characters: 0 };

  // 如果还在加载中
  if (isLoading) {
    return (
      <div className={`app ${theme}`}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>正在加载文档...</p>
        </div>
      </div>
    );
  }

  // 头部内容
  const header = (
    <>
      <div className="header-left">
        <div className="logo-wrapper">
          <span className="logo-icon">🦽</span>
          <h1 className="app-title">WheelChair</h1>
        </div>
        <span className="app-subtitle">
          {activeDocument ? activeDocument.title : '富文本编辑器'}
        </span>
      </div>
      <div className="header-right">
        <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? '切换到亮色' : '切换到暗色'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="btn-primary" onClick={handleSave}>
          <span>💾</span>
          <span>保存</span>
        </button>
      </div>
    </>
  );

  // 工具栏内容
  const toolbar = editor ? (
    <>
      <div className="toolbar">
        <div className="toolbar-section">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="粗体 (Ctrl+B)"
          >
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="斜体 (Ctrl+I)"
          >
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="下划线 (Ctrl+U)"
          >
            <UnderlineIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="删除线"
          >
            <StrikeIcon />
          </ToolbarButton>
        </div>

        <Divider />

        <div className="toolbar-section">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="标题 1"
          >
            <H1Icon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="标题 2"
          >
            <H2Icon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="标题 3"
          >
            <H3Icon />
          </ToolbarButton>
        </div>

        <Divider />

        <div className="toolbar-section">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="无序列表"
          >
            <ListIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="有序列表"
          >
            <OrderedListIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="引用"
          >
            <QuoteIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="代码块"
          >
            <CodeIcon />
          </ToolbarButton>
        </div>

        <Divider />

        <div className="toolbar-section">
          <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="链接">
            <LinkIcon />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title="图片">
            <ImageIcon />
          </ToolbarButton>
        </div>

        <div className="toolbar-spacer" />

        <div className="toolbar-section">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="撤销"
          >
            <UndoIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做"
          >
            <RedoIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="清除格式"
          >
            <ClearIcon />
          </ToolbarButton>
        </div>
      </div>

      {showLinkInput && (
        <div className="link-input-bar">
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="输入链接地址..."
            onKeyDown={(e) => e.key === 'Enter' && confirmLink()}
          />
          <button onClick={confirmLink}>确定</button>
          <button onClick={() => setShowLinkInput(false)}>取消</button>
        </div>
      )}
    </>
  ) : null;

  // 底部状态栏
  const footer = (
    <div className="statusbar">
      <div className="statusbar-left">
        <span className={`status-indicator ${editor?.isFocused ? 'active' : ''}`}>
          {editor?.isFocused ? '● 编辑中' : '○ 就绪'}
        </span>
        {lastSaved && (
          <span className="last-saved">
            上次保存: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="statusbar-right">
        <div className="word-count">
          <span>{wordCount.words} 词</span>
          <span>{wordCount.characters} 字符</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`app ${theme}`}>
      <EditorLayout
        documentManager={documentManager}
        header={header}
        toolbar={toolbar}
        footer={footer}
        showSidebar={true}
      >
        <div className="editor-card">
          <div className="editor-content-wrapper">
            <EditorContent editor={editor} className="editor-content" />
          </div>
        </div>
      </EditorLayout>
    </div>
  );
}

export default App;
