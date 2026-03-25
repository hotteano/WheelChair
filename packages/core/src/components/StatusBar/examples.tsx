import React, { useState } from 'react';
import { StatusBar, useWordCount } from './';

/**
 * 示例 1: 基础状态栏
 */
export function BasicStatusBarExample() {
  return (
    <StatusBar
      stats={{
        words: 1234,
        characters: 5678,
        charactersWithSpaces: 6789,
        paragraphs: 12,
        readingTime: 6,
      }}
    />
  );
}

/**
 * 示例 2: 带光标位置的状态栏
 */
export function WithCursorPositionExample() {
  return (
    <StatusBar
      stats={{
        words: 500,
        characters: 2500,
        charactersWithSpaces: 3000,
        paragraphs: 5,
        readingTime: 3,
      }}
      cursorPosition={{ line: 15, column: 32 }}
      currentStyle="正文"
    />
  );
}

/**
 * 示例 3: 只读模式状态栏
 */
export function ReadOnlyStatusBarExample() {
  return (
    <StatusBar
      stats={{
        words: 10000,
        characters: 50000,
        charactersWithSpaces: 60000,
        paragraphs: 50,
        readingTime: 50,
      }}
      readOnly={true}
      documentTitle="只读文档示例.pdf"
      currentStyle="标题 1"
    />
  );
}

/**
 * 示例 4: 带保存状态的状态栏
 */
export function WithSaveStatusExample() {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="space-y-4">
      <StatusBar
        stats={{
          words: 256,
          characters: 1024,
          charactersWithSpaces: 1280,
          paragraphs: 8,
          readingTime: 2,
        }}
        isSaved={isSaved}
        documentTitle="未命名文档"
        statOrder={['words', 'characters', 'readingTime', 'saveStatus', 'cursor']}
      />
      <div className="flex gap-2">
        <button
          onClick={() => setIsSaved(false)}
          className="px-3 py-1 bg-orange-500 text-white rounded text-sm"
        >
          标记为未保存
        </button>
        <button
          onClick={() => setIsSaved(true)}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          标记为已保存
        </button>
      </div>
    </div>
  );
}

/**
 * 示例 5: 自定义统计项顺序
 */
export function CustomStatOrderExample() {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">默认顺序:</h4>
      <StatusBar
        stats={{
          words: 100,
          characters: 500,
          charactersWithSpaces: 600,
          paragraphs: 3,
          readingTime: 1,
        }}
      />
      
      <h4 className="text-sm font-medium">自定义顺序（字符优先）:</h4>
      <StatusBar
        stats={{
          words: 100,
          characters: 500,
          charactersWithSpaces: 600,
          paragraphs: 3,
          readingTime: 1,
        }}
        statOrder={['characters', 'words', 'paragraphs', 'readingTime']}
      />
      
      <h4 className="text-sm font-medium">仅显示部分统计:</h4>
      <StatusBar
        stats={{
          words: 100,
          characters: 500,
          charactersWithSpaces: 600,
          paragraphs: 3,
          readingTime: 1,
        }}
        statOrder={['words', 'readingTime']}
      />
    </div>
  );
}

/**
 * 示例 6: 使用 useWordCount Hook
 */
export function UseWordCountExample() {
  const [content, setContent] = useState('这是一段示例文本。\n\n这是第二段。');
  const stats = useWordCount(content);

  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-32 p-3 border border-gray-300 rounded"
        placeholder="输入文本..."
      />
      <StatusBar stats={stats} />
    </div>
  );
}

/**
 * 示例 7: 英文本地化
 */
export function EnglishLocaleExample() {
  return (
    <StatusBar
      stats={{
        words: 1500,
        characters: 8000,
        charactersWithSpaces: 9500,
        paragraphs: 20,
        readingTime: 8,
      }}
      locale="en-US"
      currentStyle="Heading 1"
      cursorPosition={{ line: 5, column: 20 }}
      isSaved={true}
      statOrder={['words', 'characters', 'readingTime', 'style', 'cursor', 'saveStatus']}
    />
  );
}

/**
 * 示例 8: 完整编辑器状态栏
 */
export function FullEditorStatusBarExample() {
  const [content, setContent] = useState('');
  const stats = useWordCount(content);
  const [isSaved, setIsSaved] = useState(true);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    console.log('保存文档');
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <textarea
        value={content}
        onChange={handleContentChange}
        className="w-full h-40 p-4 outline-none resize-none"
        placeholder="开始写作..."
      />
      <StatusBar
        stats={stats}
        isSaved={isSaved}
        documentTitle="我的文档.md"
        currentStyle="正文"
        cursorPosition={{ line: 1, column: content.length + 1 }}
        statOrder={['words', 'characters', 'paragraphs', 'readingTime', 'cursor', 'saveStatus']}
        leftContent={
          <button
            onClick={handleSave}
            disabled={isSaved}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
          >
            保存
          </button>
        }
      />
    </div>
  );
}

/**
 * 示例 9: 大量文本统计
 */
export function LargeDocumentExample() {
  const stats = {
    words: 123456,
    characters: 654321,
    charactersWithSpaces: 789012,
    paragraphs: 500,
    readingTime: 617,
  };

  return (
    <StatusBar
      stats={stats}
      documentTitle="长篇小说.docx"
      isSaved={true}
      currentStyle="正文"
    />
  );
}
