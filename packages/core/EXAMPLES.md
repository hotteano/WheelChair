# WheelChair 编辑器核心 - 使用示例

## 基础用法

### 1. 基本编辑器

```tsx
import { useWheelChairEditor, useEditorState } from '@wheelchair/core';
import 'highlight.js/styles/github.css';

function BasicEditor() {
  const { ref, editor, isReady } = useWheelChairEditorRef({
    content: '<p>Hello <strong>WheelChair</strong>!</p>',
    editable: true,
    placeholder: '请输入内容...',
    onChange: (content) => {
      console.log('Content changed:', content);
    },
  });

  const { html, wordCount, isFocused } = useEditorState({ editor });

  return (
    <div className="editor-container">
      <div 
        ref={ref} 
        className={`editor-content ${isFocused ? 'focused' : ''}`}
      />
      
      {isReady && (
        <div className="editor-footer">
          <span>字数: {wordCount.words}</span>
          <span>字符: {wordCount.characters}</span>
        </div>
      )}
    </div>
  );
}
```

### 2. 使用 WheelChairEditor 类

```tsx
import { WheelChairEditor } from '@wheelchair/core';
import { useEffect, useRef } from 'react';

function ClassBasedEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<WheelChairEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建编辑器实例
    const editor = new WheelChairEditor({
      content: '<p>欢迎使用 WheelChair 编辑器</p>',
      editable: true,
      onChange: (content) => {
        console.log('Content:', content);
      },
      onSelectionChange: (selection) => {
        console.log('Selection:', selection);
      },
    });

    // 初始化到 DOM
    editor.init(containerRef.current);
    editorRef.current = editor;

    // 监听事件
    const unsubscribe = editor.on('update', ({ editor }) => {
      console.log('Editor updated:', editor.getHTML());
    });

    return () => {
      unsubscribe();
      editor.destroy();
    };
  }, []);

  return <div ref={containerRef} className="editor" />;
}
```

### 3. 工具栏集成

```tsx
import { useWheelChairEditor, useEditorState } from '@wheelchair/core';
import { Editor } from '@tiptap/core';

interface ToolbarProps {
  editor: Editor | null;
}

function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  return (
    <div className="toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'active' : ''}
      >
        粗体
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'active' : ''}
      >
        斜体
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'active' : ''}
      >
        下划线
      </button>
      
      <span className="divider" />
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
      >
        H1
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
      >
        H2
      </button>
      
      <span className="divider" />
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'active' : ''}
      >
        无序列表
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'active' : ''}
      >
        有序列表
      </button>
      
      <span className="divider" />
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        撤销
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        重做
      </button>
    </div>
  );
}

function EditorWithToolbar() {
  const { ref, editor, isReady } = useWheelChairEditorRef({
    content: '<p>带工具栏的编辑器</p>',
    extensions: [
      // 添加扩展...
    ],
  });

  return (
    <div className="editor-wrapper">
      <Toolbar editor={editor} />
      <div ref={ref} className="editor-content" />
    </div>
  );
}
```

### 4. 状态管理

```tsx
import { useWheelChairEditor, StateManager } from '@wheelchair/core';

function EditorWithState() {
  const { wheelChairEditor, ref, isReady } = useWheelChairEditorRef({
    content: '<p>状态管理示例</p>',
  });

  useEffect(() => {
    if (!wheelChairEditor) return;

    const stateManager = wheelChairEditor.getStateManager();

    // 订阅各种状态变化
    const unsubContent = stateManager.onContentChange((content) => {
      console.log('Content:', content);
    });

    const unsubSelection = stateManager.onSelectionChange((selection) => {
      console.log('Selection:', selection);
    });

    const unsubFocus = stateManager.onFocusChange((isFocused) => {
      console.log('Focused:', isFocused);
    });

    const unsubWordCount = stateManager.onWordCountChange((wordCount) => {
      console.log('Words:', wordCount.words);
    });

    return () => {
      unsubContent();
      unsubSelection();
      unsubFocus();
      unsubWordCount();
    };
  }, [wheelChairEditor]);

  return <div ref={ref} className="editor" />;
}
```

### 5. 历史管理

```tsx
import { useWheelChairEditor } from '@wheelchair/core';
import { useCallback } from 'react';

function EditorWithHistory() {
  const { wheelChairEditor, ref, isReady } = useWheelChairEditorRef({
    content: '<p>历史管理示例</p>',
  });

  const handleUndo = useCallback(() => {
    wheelChairEditor?.undo();
  }, [wheelChairEditor]);

  const handleRedo = useCallback(() => {
    wheelChairEditor?.redo();
  }, [wheelChairEditor]);

  const historyState = wheelChairEditor?.getHistoryState();

  return (
    <div className="editor-wrapper">
      <div className="history-controls">
        <button 
          onClick={handleUndo}
          disabled={!historyState?.canUndo}
        >
          撤销 ({historyState?.undoDepth || 0})
        </button>
        <button 
          onClick={handleRedo}
          disabled={!historyState?.canRedo}
        >
          重做 ({historyState?.redoDepth || 0})
        </button>
      </div>
      <div ref={ref} className="editor-content" />
    </div>
  );
}
```

### 6. 自定义扩展

```tsx
import { useWheelChairEditor } from '@wheelchair/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

function EditorWithExtensions() {
  const { ref, editor, isReady } = useWheelChairEditorRef({
    content: '<p>扩展示例</p>',
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: '请输入内容...',
      }),
    ],
  });

  const handleImageUpload = async (file: File) => {
    if (!editor) return;
    
    // 上传图片并获取 URL
    const url = await uploadImage(file);
    
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="editor-wrapper">
      <div className="toolbar">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
      </div>
      <div ref={ref} className="editor-content" />
    </div>
  );
}
```

### 7. 只读模式

```tsx
import { useWheelChairEditor, useEditorState } from '@wheelchair/core';

function ReadOnlyEditor({ content }: { content: string }) {
  const { ref, editor, isReady } = useWheelChairEditorRef({
    content,
    editable: false, // 只读模式
  });

  return (
    <div 
      ref={ref} 
      className="editor-content readonly"
    />
  );
}
```

### 8. 受控组件

```tsx
import { useState } from 'react';
import { WheelChairEditor } from '@wheelchair/core';

function ControlledEditor() {
  const [content, setContent] = useState('<p>受控编辑器</p>');
  const editorRef = useRef<WheelChairEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = new WheelChairEditor({
      content,
      onChange: (newContent) => {
        setContent(JSON.stringify(newContent));
      },
    });

    editor.init(containerRef.current);
    editorRef.current = editor;

    return () => {
      editor.destroy();
    };
  }, []);

  // 外部更新内容
  const updateContent = (newContent: string) => {
    editorRef.current?.setContent(newContent);
    setContent(newContent);
  };

  return (
    <div>
      <button onClick={() => updateContent('<p>新内容</p>')}>
        更新内容
      </button>
      <div ref={containerRef} />
    </div>
  );
}
```

## 完整示例：富文本编辑器组件

```tsx
import React from 'react';
import {
  useWheelChairEditor,
  useEditorState,
  WheelChairEditor,
} from '@wheelchair/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  const { ref, editor, isReady } = useWheelChairEditorRef({
    content: value || '',
    editable: !disabled,
    placeholder,
    extensions: [StarterKit, Image, Link],
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const { wordCount, isFocused } = useEditorState({ editor });

  return (
    <div className="rich-text-editor">
      {isReady && <Toolbar editor={editor} />}
      
      <div
        ref={ref}
        className={`editor-content ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}
      />
      
      {isReady && (
        <div className="editor-footer">
          <span>{wordCount.words} 词</span>
          <span>{wordCount.characters} 字符</span>
        </div>
      )}
    </div>
  );
};
```
