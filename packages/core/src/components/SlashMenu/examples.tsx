import React, { useState, useRef } from 'react';
import { SlashMenu, defaultSlashCommands, SlashCommand } from './';

/**
 * 示例 1: 基础斜杠菜单
 */
export function BasicSlashMenuExample() {
  const [visible, _setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCommandSelect = (command: SlashCommand) => {
    console.log('选择命令:', command.label);
    _setVisible(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 border border-gray-200 p-4"
    >
      <p>输入 / 触发斜杠菜单...</p>
      <SlashMenu
        visible={visible}
        position={{ top: 60, left: 20 }}
        containerRef={containerRef}
        onCommandSelect={handleCommandSelect}
        onClose={() => _setVisible(false)}
      />
      <button
        onClick={() => _setVisible(!visible)}
        className="mt-40 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {visible ? '隐藏' : '显示'} 菜单
      </button>
    </div>
  );
}

/**
 * 示例 2: 带搜索过滤的斜杠菜单
 */
export function FilteredSlashMenuExample() {
  const [visible, _setVisible] = useState(true);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 border border-gray-200 p-4"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">搜索过滤:</label>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="输入关键词过滤..."
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      <SlashMenu
        visible={visible}
        filter={filter}
        position={{ top: 120, left: 20 }}
        containerRef={containerRef}
        onCommandSelect={(cmd) => {
          console.log('选择:', cmd.label);
          setFilter('');
        }}
        showCategories={!filter}
      />
    </div>
  );
}

/**
 * 示例 3: 自定义命令
 */
export function CustomCommandsExample() {
  const [visible, _setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const customCommands: SlashCommand[] = [
    {
      id: 'ai-write',
      label: 'AI 写作',
      description: '使用 AI 辅助写作',
      type: 'embed',
      icon: <span>🤖</span>,
      keywords: ['ai', 'gpt', 'generate'],
      onExecute: () => console.log('启动 AI 写作'),
    },
    {
      id: 'ai-improve',
      label: '改进文本',
      description: '优化和润色当前文本',
      type: 'embed',
      icon: <span>✨</span>,
      keywords: ['improve', 'polish', 'optimize'],
      onExecute: () => console.log('改进文本'),
    },
    {
      id: 'embed-youtube',
      label: 'YouTube 视频',
      description: '嵌入 YouTube 视频',
      type: 'embed',
      icon: <span>📺</span>,
      keywords: ['youtube', 'video', 'embed'],
      onExecute: () => console.log('嵌入 YouTube'),
    },
    {
      id: 'embed-figma',
      label: 'Figma 设计',
      description: '嵌入 Figma 设计文件',
      type: 'embed',
      icon: <span>🎨</span>,
      keywords: ['figma', 'design', 'embed'],
      onExecute: () => console.log('嵌入 Figma'),
    },
    ...defaultSlashCommands,
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 border border-gray-200 p-4"
    >
      <p>自定义命令示例（包含 AI 和嵌入命令）...</p>
      <SlashMenu
        visible={visible}
        commands={customCommands}
        position={{ top: 60, left: 20 }}
        containerRef={containerRef}
        onCommandSelect={(cmd) => console.log('执行:', cmd.label)}
        maxHeight={350}
      />
    </div>
  );
}

/**
 * 示例 4: 完整集成示例 - 模拟编辑器中的斜杠命令
 */
export function IntegratedSlashMenuExample() {
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    const selection = window.getSelection();
    
    // 检查是否输入了 "/"
    const beforeCursor = text.slice(0, selection?.focusOffset || 0);
    const lastSlashIndex = beforeCursor.lastIndexOf('/');
    
    if (lastSlashIndex !== -1) {
      const afterSlash = beforeCursor.slice(lastSlashIndex + 1);
      // 如果没有空格，显示斜杠菜单
      if (!afterSlash.includes(' ')) {
        setFilter(afterSlash);
        setVisible(true);
        
        // 获取光标位置
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        if (rect && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          setPosition({
            top: rect.bottom - containerRect.top,
            left: rect.left - containerRect.left,
          });
        }
      } else {
        setVisible(false);
      }
    } else {
      setVisible(false);
    }
  };

  const handleCommandSelect = (command: SlashCommand) => {
    console.log('执行命令:', command.label);
    setVisible(false);
    setFilter('');
    // 这里可以执行实际的编辑器命令
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-60 border border-gray-200"
    >
      <div
        ref={contentRef}
        contentEditable
        className="w-full h-full p-4 outline-none"
        onInput={handleInput}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setVisible(false);
          }
        }}
        // placeholder="输入 / 查看可用命令..."
      >
        输入 / 试试...
      </div>
      <SlashMenu
        visible={visible}
        filter={filter}
        position={position}
        containerRef={containerRef}
        onCommandSelect={handleCommandSelect}
        onClose={() => {
          setVisible(false);
          setFilter('');
        }}
      />
    </div>
  );
}

/**
 * 示例 5: 无分类显示
 */
export function NoCategoryExample() {
  return (
    <div className="relative w-full h-80 border border-gray-200 p-4">
      <p>无分类标题的简洁模式...</p>
      <SlashMenu
        visible={true}
        position={{ top: 60, left: 20 }}
        showCategories={false}
        maxHeight={300}
      />
    </div>
  );
}
