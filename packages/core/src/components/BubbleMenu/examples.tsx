import { useState, useRef } from 'react';
import { BubbleMenu } from './';

/**
 * 示例 1: 基础浮动工具栏
 */
export function BasicBubbleMenuExample() {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const buttons = [
    {
      id: 'bold',
      icon: <span className="font-bold">B</span>,
      label: '粗体',
      shortcut: 'Ctrl+B',
      active: true,
      onClick: () => console.log('Bold'),
    },
    {
      id: 'italic',
      icon: <span className="italic">I</span>,
      label: '斜体',
      shortcut: 'Ctrl+I',
      onClick: () => console.log('Italic'),
    },
    {
      id: 'underline',
      icon: <span className="underline">U</span>,
      label: '下划线',
      shortcut: 'Ctrl+U',
      onClick: () => console.log('Underline'),
    },
    {
      id: 'link',
      icon: <span>🔗</span>,
      label: '链接',
      shortcut: 'Ctrl+K',
      onClick: () => console.log('Link'),
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-40 border border-gray-200 p-4"
    >
      <p>选中文本时显示浮动工具栏...</p>
      <BubbleMenu
        visible={visible}
        buttons={buttons}
        containerRef={containerRef}
        offset={{ x: 100, y: 50 }}
      />
      <button
        onClick={() => setVisible(!visible)}
        className="mt-20 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {visible ? '隐藏' : '显示'} 工具栏
      </button>
    </div>
  );
}

/**
 * 示例 2: 链接编辑模式
 */
export function LinkEditBubbleMenuExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [linkMode, setLinkMode] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('https://example.com');

  return (
    <div
      ref={containerRef}
      className="relative w-full h-40 border border-gray-200 p-4"
    >
      <p>链接编辑模式示例...</p>
      <BubbleMenu
        visible={true}
        linkMode={linkMode}
        currentLinkUrl={currentUrl}
        containerRef={containerRef}
        offset={{ x: 100, y: 50 }}
        onLinkSave={(url) => {
          console.log('保存链接:', url);
          setCurrentUrl(url);
          setLinkMode(false);
        }}
        onLinkCancel={() => {
          console.log('取消编辑');
          setLinkMode(false);
        }}
        onLinkRemove={() => {
          console.log('删除链接');
          setCurrentUrl('');
          setLinkMode(false);
        }}
      />
      <button
        onClick={() => setLinkMode(!linkMode)}
        className="mt-20 px-4 py-2 bg-green-500 text-white rounded"
      >
        {linkMode ? '退出' : '进入'} 链接编辑模式
      </button>
    </div>
  );
}

/**
 * 示例 3: 完整编辑器集成示例
 */
export function IntegratedBubbleMenuExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectionRange(selection.getRangeAt(0));
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const buttons = [
    {
      id: 'bold',
      icon: <BoldIcon />,
      label: '粗体',
      onClick: () => document.execCommand('bold'),
    },
    {
      id: 'italic',
      icon: <ItalicIcon />,
      label: '斜体',
      onClick: () => document.execCommand('italic'),
    },
    {
      id: 'underline',
      icon: <UnderlineIcon />,
      label: '下划线',
      onClick: () => document.execCommand('underline'),
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-60 border border-gray-200 p-4"
      onMouseUp={handleMouseUp}
    >
      <div
        contentEditable
        className="w-full h-full outline-none"
        onBlur={() => setTimeout(() => setVisible(false), 200)}
      >
        <p>选中这段文字试试看...</p>
        <p>这是一个富文本编辑器的演示。</p>
      </div>
      <BubbleMenu
        visible={visible}
        buttons={buttons}
        selectionRange={selectionRange}
        containerRef={containerRef}
        onClose={() => setVisible(false)}
      />
    </div>
  );
}

// 图标组件
function BoldIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  );
}
