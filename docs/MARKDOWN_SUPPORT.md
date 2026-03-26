# WheelChair Markdown 支持方案

> 去中心化、轻量级、易用的 Markdown 编辑体验

---

## 设计原则

### 1. 去中心化 (Decentralized)
- ❌ 不依赖云端 Markdown 解析服务
- ❌ 不需要后端服务器
- ✅ 纯前端解析，所有处理在浏览器完成
- ✅ 支持离线使用

### 2. 轻量级 (Lightweight)
- 📦 核心 Markdown 支持 < 50KB (gzip)
- 🚀 按需加载扩展功能
- 🎯 无冗余依赖
- 💾 内存占用小

### 3. 易用性 (User-Friendly)
- 📝 实时预览（所见即所得）
- ⌨️ 常用快捷键支持
- 🎨 语法高亮
- 📋 粘贴 Markdown 自动转换
- 💾 自动保存为 Markdown 文件

### 4. 开源 (Open Source)
- 📖 代码完全开源 (MIT License)
- 🔌 可扩展的插件系统
- 📚 完整的文档

---

## 功能规划

### 阶段一：核心 Markdown 支持 (已完成)

| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown 导入 | ✅ | 支持 `.md` 文件导入 |
| Markdown 导出 | ✅ | 导出为 `.md` 文件 |
| 基础语法 | ✅ | 标题、列表、链接、图片、代码块 |
| GFM 扩展 | ✅ | 表格、任务列表、删除线 |

### 阶段二：增强 Markdown 编辑体验 (建议实现)

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 输入规则 | P0 | 输入 `## ` 自动转换为 H2 |
| Markdown 快捷键 | P0 | Ctrl+B 输出 `**bold**` |
| 粘贴智能转换 | P1 | 粘贴 Markdown 文本自动解析 |
| 双栏预览 | P2 | 左编辑右预览模式 |
| YAML Frontmatter | P2 | 支持文档元数据 |

### 阶段三：高级功能 (可选)

| 功能 | 优先级 | 说明 |
|------|--------|------|
| Mermaid 图表 | P3 | 流程图、时序图 |
| LaTeX 公式 | P3 | 数学公式支持 |
| 目录生成 | P2 | 自动生成 TOC |

---

## 技术实现方案

### 方案选型

```
┌─────────────────────────────────────────────────────────┐
│                    Markdown 处理架构                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   编辑模式      │    │        输入规则              │ │
│  │  (WYSIWYG)      │◄───┤  - `## ` → H2              │ │
│  │                 │    │  - `- ` → 列表              │ │
│  │  用户直接看到    │    │  - ` ``` ` → 代码块         │ │
│  │  渲染后的效果    │    │  - `> ` → 引用              │ │
│  └────────┬────────┘    └─────────────────────────────┘ │
│           │                                              │
│           │  导出/导入                                    │
│           ▼                                              │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   Markdown      │◄──►│      Markdown-it            │ │
│  │   纯文本格式    │    │  (轻量级解析器 ~30KB)        │ │
│  │                 │    │                             │ │
│  │  .md 文件存储   │    │  - 纯前端运行               │ │
│  │  通用格式       │    │  - 无网络依赖               │ │
│  └─────────────────┘    │  - 插件扩展                  │ │
│                         └─────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 推荐依赖

```json
{
  "dependencies": {
    "markdown-it": "^14.0.0"        // Markdown 解析器 (轻量级)
  },
  "devDependencies": {
    "@types/markdown-it": "^14.0.0"
  }
}
```

**为什么选择 markdown-it？**
- ✅ 纯 JavaScript，无原生依赖
- ✅ 体积小 (~30KB minified + gzip)
- ✅ 插件丰富（GFM、emoji、subscript等）
- ✅ 高性能，可配置
- ✅ 活跃的社区维护

---

## 具体实现

### 1. Markdown 输入规则 (Input Rules)

在编辑器中输入特定字符自动转换格式：

```typescript
// packages/core/src/extensions/inputRules/MarkdownInputRules.ts

import { InputRule, inputRules } from '@tiptap/core';

export const headingInputRule = (level: number): InputRule => {
  return new InputRule({
    find: new RegExp(`^(#{${level}}\\s)$`),
    handler: ({ state, range }) => {
      const { from } = range;
      state.tr
        .delete(from, from + level + 1)
        .setBlockType(from, from, state.schema.nodes.heading, { level });
    },
  });
};

export const bulletListInputRule = (): InputRule => {
  return new InputRule({
    find: /^([-*+]\s)$/,
    handler: ({ state, range }) => {
      const { from } = range;
      state.tr
        .delete(from, from + 2)
        .wrapIn(state.schema.nodes.bulletList)
        .setBlockType(from, from, state.schema.nodes.listItem);
    },
  });
};

export const orderedListInputRule = (): InputRule => {
  return new InputRule({
    find: /^(\d+\.\s)$/,
    handler: ({ state, range }) => {
      const { from } = range;
      state.tr
        .delete(from, from + 3)
        .wrapIn(state.schema.nodes.orderedList)
        .setBlockType(from, from, state.schema.nodes.listItem);
    },
  });
};

export const blockquoteInputRule = (): InputRule => {
  return new InputRule({
    find: /^>\s$/,
    handler: ({ state, range }) => {
      const { from } = range;
      state.tr
        .delete(from, from + 2)
        .wrapIn(state.schema.nodes.blockquote);
    },
  });
};

export const codeBlockInputRule = (): InputRule => {
  return new InputRule({
    find: /^```$/,
    handler: ({ state, range }) => {
      const { from } = range;
      state.tr
        .delete(from, from + 3)
        .setBlockType(from, from, state.schema.nodes.codeBlock);
    },
  });
};

// 组合所有规则
export const MarkdownInputRules = inputRules({
  rules: [
    headingInputRule(1),
    headingInputRule(2),
    headingInputRule(3),
    headingInputRule(4),
    headingInputRule(5),
    headingInputRule(6),
    bulletListInputRule(),
    orderedListInputRule(),
    blockquoteInputRule(),
    codeBlockInputRule(),
  ],
});
```

### 2. Markdown 粘贴处理

粘贴 Markdown 文本时自动转换：

```typescript
// packages/core/src/utils/markdownPasteHandler.ts

import MarkdownIt from 'markdown-it';
import { DOMParser } from '@tiptap/pm/model';

const md = new MarkdownIt({
  html: false,        // 禁用 HTML 标签，安全
  linkify: true,      // 自动识别链接
  typographer: true,  // 启用排版美化
});

export function handleMarkdownPaste(
  view: EditorView,
  event: ClipboardEvent,
  slice: Slice
): boolean {
  const text = event.clipboardData?.getData('text/plain');
  
  if (!text || !isMarkdownText(text)) {
    return false; // 让默认处理
  }
  
  // 将 Markdown 转为 HTML
  const html = md.render(text);
  
  // 创建临时 DOM 元素
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  
  // 使用 ProseMirror 的 DOMParser 解析
  const parser = DOMParser.fromSchema(view.state.schema);
  const content = parser.parse(wrapper);
  
  // 插入内容
  const transaction = view.state.tr.replaceSelection(content);
  view.dispatch(transaction);
  
  return true; // 已处理
}

// 检测文本是否为 Markdown
function isMarkdownText(text: string): boolean {
  const markdownPatterns = [
    /^#{1,6}\s/m,           // 标题
    /^[-*+]\s/m,            // 无序列表
    /^\d+\.\s/m,            // 有序列表
    /^```/m,                // 代码块
    /^>\s/m,                // 引用
    /\*\*.*\*\*/,           // 粗体
    /\*.*\*/,               // 斜体
    /\[.*\]\(.*\)/,         // 链接
    /!\[.*\]\(.*\)/,        // 图片
    /^---/m,                // 分隔线
    /^\|.*\|/m,             // 表格
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}
```

### 3. Markdown 实时预览（可选）

双栏编辑模式：

```typescript
// packages/core/src/components/MarkdownPreview/MarkdownPreview.tsx

import React, { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(str, { language: lang }).value;
    }
    return str;
  },
});

interface MarkdownPreviewProps {
  content: string; // Markdown 文本
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  className = '',
}) => {
  const html = useMemo(() => {
    return md.render(content);
  }, [content]);
  
  return (
    <div 
      className={`markdown-preview ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
```

### 4. Markdown 文件关联

支持双击 `.md` 文件打开：

```typescript
// packages/core/src/utils/fileAssociations.ts

// 注册为 PWA 的文件处理程序（需要 HTTPS）
export function registerFileHandlers() {
  if ('launchQueue' in window) {
    (window as any).launchQueue.setConsumer(async (launchParams: any) => {
      for (const file of launchParams.files) {
        if (file.name.endsWith('.md')) {
          const text = await file.text();
          // 打开文件到编辑器
          openMarkdownFile(text, file.name);
        }
      }
    });
  }
}

// 处理文件拖放
export function handleFileDrop(
  items: DataTransferItemList,
  callback: (content: string, filename: string) => void
): void {
  for (const item of items) {
    const entry = item.webkitGetAsEntry();
    
    if (entry?.isFile && entry.name.endsWith('.md')) {
      (entry as FileSystemFileEntry).file((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          callback(e.target?.result as string, file.name);
        };
        reader.readAsText(file);
      });
    }
  }
}
```

---

## UI 设计

### Markdown 工具栏按钮

```tsx
// 添加到工具栏
<ToolbarButton 
  onClick={() => insertMarkdown('**', '**')}
  title="粗体 (Ctrl+B)"
>
  <BoldIcon />
</ToolbarButton>

<ToolbarButton 
  onClick={() => insertMarkdown('*', '*')}
  title="斜体 (Ctrl+I)"
>
  <ItalicIcon />
</ToolbarButton>

<ToolbarButton 
  onClick={() => insertMarkdown('`', '`')}
  title="行内代码"
>
  <CodeIcon />
</ToolbarButton>

<ToolbarButton 
  onClick={() => insertMarkdown('[', '](url)')}
  title="链接"
>
  <LinkIcon />
</ToolbarButton>

<ToolbarButton 
  onClick={() => insertMarkdown('![alt](', ')')}
  title="图片"
>
  <ImageIcon />
</ToolbarButton>
```

### Markdown 模式切换器

```tsx
<div className="editor-mode-switcher">
  <button 
    className={mode === 'wysiwyg' ? 'active' : ''}
    onClick={() => setMode('wysiwyg')}
  >
    📝 所见即所得
  </button>
  <button 
    className={mode === 'split' ? 'active' : ''}
    onClick={() => setMode('split')}
  >
    ↔️ 分栏预览
  </button>
  <button 
    className={mode === 'markdown' ? 'active' : ''}
    onClick={() => setMode('markdown')}
  >
    📄 Markdown
  </button>
</div>
```

---

## 性能优化

### 懒加载 Markdown-it

```typescript
// 只在需要时加载
let md: MarkdownIt | null = null;

export async function getMarkdownParser(): Promise<MarkdownIt> {
  if (!md) {
    const MarkdownIt = (await import('markdown-it')).default;
    md = new MarkdownIt({
      html: false,
      linkify: true,
      typographer: true,
    });
  }
  return md;
}
```

### Web Worker 处理大文件

```typescript
// markdown.worker.ts
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

self.onmessage = (event) => {
  const { markdown, id } = event.data;
  const html = md.render(markdown);
  self.postMessage({ html, id });
};

// 主线程使用
const worker = new Worker('/markdown.worker.js');

export function renderMarkdownAsync(markdown: string): Promise<string> {
  return new Promise((resolve) => {
    const id = Math.random().toString(36);
    worker.postMessage({ markdown, id });
    worker.onmessage = (e) => {
      if (e.data.id === id) {
        resolve(e.data.html);
      }
    };
  });
}
```

---

## 开源贡献

### 如何贡献 Markdown 功能

1. **Fork 项目**
2. **创建分支**: `git checkout -b feature/markdown-enhancement`
3. **实现功能**
4. **提交 PR**: 描述清楚功能和设计思路

### 代码规范

- TypeScript 严格模式
- 单元测试覆盖率 > 80%
- 遵循现有代码风格
- 更新文档

---

## 总结

WheelChair 编辑器的 Markdown 支持遵循以下理念：

1. **去中心化** - 纯前端处理，用户数据属于用户
2. **轻量级** - 核心功能 < 50KB，按需加载
3. **易用性** - 输入规则、智能粘贴、多模式切换
4. **开源** - MIT 许可证，社区共建

这样用户可以在享受富文本编辑的便利的同时，随时导出标准的 Markdown 文件，保证数据的可移植性。
