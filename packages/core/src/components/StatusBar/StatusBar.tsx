import React from 'react';
import { cn } from '../../utils/cn';

export interface StatusBarStats {
  /** 单词数 */
  words: number;
  /** 字符数（不含空格） */
  characters: number;
  /** 字符数（含空格） */
  charactersWithSpaces: number;
  /** 段落数 */
  paragraphs: number;
  /** 阅读时间（分钟） */
  readingTime: number;
}

export interface StatusBarProps {
  /** 统计信息 */
  stats?: StatusBarStats;
  /** 当前段落样式 */
  currentStyle?: string;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 当前光标位置 */
  cursorPosition?: {
    line: number;
    column: number;
  };
  /** 文档标题 */
  documentTitle?: string;
  /** 是否已保存 */
  isSaved?: boolean;
  /** 保存状态文本 */
  saveStatusText?: string;
  /** 自定义左侧内容 */
  leftContent?: React.ReactNode;
  /** 自定义右侧内容 */
  rightContent?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 统计项显示顺序 */
  statOrder?: Array<keyof StatusBarStats | 'cursor' | 'style' | 'saveStatus'>;
  /** 点击统计项回调 */
  onStatClick?: (stat: keyof StatusBarStats) => void;
  /** 语言/本地化 */
  locale?: 'zh-CN' | 'en-US';
}

// 本地化文本
const i18n = {
  'zh-CN': {
    words: '字数',
    characters: '字符',
    charactersWithSpaces: '字符（含空格）',
    paragraphs: '段落',
    readingTime: '阅读时间',
    readOnly: '只读模式',
    line: '行',
    column: '列',
    saved: '已保存',
    unsaved: '未保存',
    saving: '保存中...',
    minutes: '分钟',
    currentStyle: '当前样式',
  },
  'en-US': {
    words: 'words',
    characters: 'characters',
    charactersWithSpaces: 'chars (with spaces)',
    paragraphs: 'paragraphs',
    readingTime: 'read time',
    readOnly: 'Read-only',
    line: 'Ln',
    column: 'Col',
    saved: 'Saved',
    unsaved: 'Unsaved',
    saving: 'Saving...',
    minutes: 'min',
    currentStyle: 'Style',
  },
};

export const StatusBar: React.FC<StatusBarProps> = ({
  stats = { words: 0, characters: 0, charactersWithSpaces: 0, paragraphs: 0, readingTime: 0 },
  currentStyle,
  readOnly = false,
  disabled = false,
  cursorPosition,
  documentTitle,
  isSaved,
  saveStatusText,
  leftContent,
  rightContent,
  className,
  statOrder = ['words', 'characters', 'readingTime'],
  onStatClick,
  locale = 'zh-CN',
}) => {
  const t = i18n[locale];

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}w`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const statRenderers: Record<string, () => React.ReactNode> = {
    words: () => (
      <StatItem
        key="words"
        label={t.words}
        value={formatNumber(stats.words)}
        onClick={() => onStatClick?.('words')}
      />
    ),
    characters: () => (
      <StatItem
        key="characters"
        label={t.characters}
        value={formatNumber(stats.characters)}
        onClick={() => onStatClick?.('characters')}
        title={`${t.charactersWithSpaces}: ${formatNumber(stats.charactersWithSpaces)}`}
      />
    ),
    charactersWithSpaces: () => (
      <StatItem
        key="charactersWithSpaces"
        label={t.charactersWithSpaces}
        value={formatNumber(stats.charactersWithSpaces)}
        onClick={() => onStatClick?.('charactersWithSpaces')}
      />
    ),
    paragraphs: () => (
      <StatItem
        key="paragraphs"
        label={t.paragraphs}
        value={formatNumber(stats.paragraphs)}
        onClick={() => onStatClick?.('paragraphs')}
      />
    ),
    readingTime: () => (
      <StatItem
        key="readingTime"
        label={t.readingTime}
        value={`${stats.readingTime}${t.minutes}`}
        onClick={() => onStatClick?.('readingTime')}
      />
    ),
    cursor: () =>
      cursorPosition && (
        <span key="cursor" className="text-gray-500">
          {t.line} {cursorPosition.line}, {t.column} {cursorPosition.column}
        </span>
      ),
    style: () =>
      currentStyle && (
        <span
          key="style"
          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700 font-medium"
        >
          {t.currentStyle}: {currentStyle}
        </span>
      ),
    saveStatus: () =>
      isSaved !== undefined && (
        <span
          key="saveStatus"
          className={cn(
            'flex items-center gap-1',
            isSaved ? 'text-green-600' : 'text-orange-500'
          )}
        >
          {isSaved ? (
            <CheckIcon className="w-3.5 h-3.5" />
          ) : (
            <PencilIcon className="w-3.5 h-3.5" />
          )}
          {saveStatusText || (isSaved ? t.saved : t.unsaved)}
        </span>
      ),
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'px-4 py-2 text-sm',
        'bg-gray-50 border-t border-gray-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      role="status"
      aria-label="编辑器状态栏"
    >
      {/* 左侧区域 */}
      <div className="flex items-center gap-4">
        {leftContent}
        
        {readOnly && (
          <span
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded',
              'bg-amber-100 text-amber-800 text-xs font-medium'
            )}
          >
            <LockIcon className="w-3.5 h-3.5" />
            {t.readOnly}
          </span>
        )}

        {documentTitle && (
          <span className="text-gray-700 font-medium truncate max-w-[200px]">
            {documentTitle}
          </span>
        )}
      </div>

      {/* 中间区域 - 统计信息 */}
      <div className="flex items-center gap-4">
        {statOrder.map((stat) => statRenderers[stat]?.()).filter(Boolean)}
      </div>

      {/* 右侧区域 */}
      <div className="flex items-center gap-4">
        {rightContent}
      </div>
    </div>
  );
};

StatusBar.displayName = 'StatusBar';

// 统计项子组件
interface StatItemProps {
  label: string;
  value: string | number;
  onClick?: () => void;
  title?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    title={title}
    className={cn(
      'flex items-center gap-1 text-gray-500',
      onClick && 'hover:text-gray-700 cursor-pointer'
    )}
  >
    <span className="text-gray-400">{label}:</span>
    <span className="font-medium text-gray-700">{value}</span>
  </button>
);

// 图标组件
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

// 带字数统计功能的 Hook
export const useWordCount = (content?: string): StatusBarStats => {
  const calculateStats = (text: string): StatusBarStats => {
    if (!text) {
      return {
        words: 0,
        characters: 0,
        charactersWithSpaces: 0,
        paragraphs: 0,
        readingTime: 0,
      };
    }

    // 字符数（含空格）
    const charactersWithSpaces = text.length;

    // 字符数（不含空格）
    const characters = text.replace(/\s/g, '').length;

    // 单词数（中文字符 + 英文单词）
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const words = chineseChars + englishWords;

    // 段落数
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length || 1;

    // 阅读时间（假设平均阅读速度 200 字/分钟）
    const readingTime = Math.max(1, Math.ceil(words / 200));

    return {
      words,
      characters,
      charactersWithSpaces,
      paragraphs,
      readingTime,
    };
  };

  return React.useMemo(() => calculateStats(content || ''), [content]);
};

export default StatusBar;
