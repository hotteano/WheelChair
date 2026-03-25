import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTheme } from '@wheelchair/core/context/ThemeContext';
import './App.css';

// 示例文档内容
const INITIAL_CONTENT = `
<h1>欢迎使用 WheelChair 编辑器</h1>
<p>这是一个<strong>现代化</strong>的富文本编辑器，具有<em>丰富的功能</em>。</p>
<h2>主要特性</h2>
<ul>
  <li>🎨 支持多种文本格式</li>
  <li>🖼️ 图片和媒体插入</li>
  <li>📊 表格支持</li>
  <li>🔗 链接和引用</li>
  <li>💻 代码块高亮</li>
  <li>📱 响应式设计</li>
</ul>
<blockquote>
  <p>WheelChair 让富文本编辑变得简单而强大！</p>
</blockquote>
<p>立即开始你的创作之旅吧！</p>
`;

function App() {
  const { theme, toggleTheme } = useTheme();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: INITIAL_CONTENT,
    editable: true,
    autofocus: true,
    onUpdate: useCallback(({ editor }) => {
      console.log('内容已更新');
    }, []),
  });

  const handleSave = useCallback(() => {
    setLastSaved(new Date());
    console.log('保存内容:', editor?.getHTML());
  }, [editor]);

  const wordCount = editor ? {
    words: editor.getText().trim().split(/\s+/).filter(w => w.length > 0).length,
    characters: editor.getText().length,
  } : { words: 0, characters: 0 };

  return (
    <div className={`app ${theme}`}>
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">🦽 WheelChair</h1>
          <span className="app-subtitle">富文本编辑器</span>
        </div>
        <div className="header-right">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="editor-wrapper">
          {/* 工具栏 */}
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <button 
                className={`toolbar-button ${editor?.isActive('bold') ? 'active' : ''}`}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                title="粗体 (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button 
                className={`toolbar-button ${editor?.isActive('italic') ? 'active' : ''}`}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                title="斜体 (Ctrl+I)"
              >
                <em>I</em>
              </button>
              <button 
                className={`toolbar-button ${editor?.isActive('strike') ? 'active' : ''}`}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                title="删除线"
              >
                <s>S</s>
              </button>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-group">
              <button 
                className={`toolbar-button ${editor?.isActive('heading', { level: 1 }) ? 'active' : ''}`}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                title="标题 1"
              >
                H1
              </button>
              <button 
                className={`toolbar-button ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                title="标题 2"
              >
                H2
              </button>
              <button 
                className={`toolbar-button ${editor?.isActive('bulletList') ? 'active' : ''}`}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                title="无序列表"
              >
                • List
              </button>
              <button 
                className={`toolbar-button ${editor?.isActive('orderedList') ? 'active' : ''}`}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                title="有序列表"
              >
                1. List
              </button>
              <button 
                className={`toolbar-button ${editor?.isActive('blockquote') ? 'active' : ''}`}
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                title="引用"
              >
                "Quote
              </button>
              <button 
                className={`toolbar-button ${editor?.isActive('codeBlock') ? 'active' : ''}`}
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                title="代码块"
              >
                {'</>'}
              </button>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-group">
              <button 
                className="toolbar-button"
                onClick={() => editor?.chain().focus().undo().run()}
                title="撤销"
                disabled={!editor?.can().undo()}
              >
                ↩️
              </button>
              <button 
                className="toolbar-button"
                onClick={() => editor?.chain().focus().redo().run()}
                title="重做"
                disabled={!editor?.can().redo()}
              >
                ↪️
              </button>
            </div>
          </div>
          
          {/* 编辑器内容区域 */}
          <div className="editor-container">
            <EditorContent editor={editor} className="editor-content" />
          </div>
          
          {/* 状态栏 */}
          <div className="editor-statusbar">
            <div className="status-left">
              {editor?.isFocused ? '编辑中' : '就绪'}
              {lastSaved && ` • 上次保存: ${lastSaved.toLocaleTimeString()}`}
            </div>
            <div className="status-right">
              <span>字数: {wordCount.words}</span>
              <span>字符: {wordCount.characters}</span>
            </div>
          </div>
        </div>

        <div className="editor-sidebar">
          <div className="panel">
            <h3>操作</h3>
            <div className="panel-content">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  const html = editor?.getHTML();
                  console.log('HTML:', html);
                  alert('HTML 已输出到控制台');
                }}
              >
                查看 HTML
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  const json = editor?.getJSON();
                  console.log('JSON:', json);
                  alert('JSON 已输出到控制台');
                }}
              >
                查看 JSON
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>WheelChair Editor © 2024 - 基于 Tiptap 构建</p>
      </footer>
    </div>
  );
}

export default App;
