# WheelChair 导入导出功能使用指南

## 创建的文件列表

### 核心工具
| 文件 | 说明 |
|------|------|
| `src/utils/importExport.ts` | 导入导出管理器、格式注册机制、统一 API |
| `src/utils/markdown.ts` | Markdown 解析与序列化 |
| `src/utils/html.ts` | HTML 解析与序列化 |
| `src/model/node.ts` | 节点类型定义 |

### 导出器
| 文件 | 说明 |
|------|------|
| `src/exporters/MarkdownExporter.ts` | Markdown 导出器 |
| `src/exporters/HTMLExporter.ts` | HTML 导出器 |
| `src/exporters/TextExporter.ts` | 纯文本导出器 |
| `src/exporters/JSONExporter.ts` | JSON 导出器 |

### 导入器
| 文件 | 说明 |
|------|------|
| `src/importers/MarkdownImporter.ts` | Markdown 导入器 |
| `src/importers/HTMLImporter.ts` | HTML 导入器 |
| `src/importers/TextImporter.ts` | 纯文本导入器 |
| `src/importers/PasteImporter.ts` | 剪贴板内容导入器 |

### 组件
| 文件 | 说明 |
|------|------|
| `src/components/ExportMenu/ExportMenu.tsx` | 导出菜单 React 组件 |
| `src/components/ExportMenu/ExportMenu.css` | 组件样式 |
| `src/components/ExportMenu/index.ts` | 组件入口 |

## 支持格式

| 格式 | 导入 | 导出 | 扩展名 | MIME 类型 |
|------|:--:|:--:|--------|-----------|
| Markdown | ✅ | ✅ | .md, .markdown | text/markdown |
| HTML | ✅ | ✅ | .html, .htm | text/html |
| JSON | ✅ | ✅ | .json | application/json |
| 纯文本 | ✅ | ✅ | .txt | text/plain |

## 使用示例

### 1. 初始化

```typescript
import { initializeImportExport } from '@wheelchair/core';

// 注册所有默认格式处理器
initializeImportExport();
```

### 2. 导出文档

```typescript
import { quickExport, ExportFormat } from '@wheelchair/core';

const nodes = [
  {
    type: 'element',
    nodeType: 'heading1',
    children: [{ type: 'text', text: 'Hello World' }],
  },
  {
    type: 'element',
    nodeType: 'paragraph',
    children: [{ type: 'text', text: 'This is a paragraph.' }],
  },
];

// 导出为 Markdown
const { content, filename, mimeType } = quickExport(nodes, ExportFormat.MARKDOWN, {
  title: 'My Document',
});

// 下载文件
const blob = new Blob([content], { type: mimeType });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = filename;
link.click();
```

### 3. 导入文档

```typescript
import { quickImport, ExportFormat } from '@wheelchair/core';

// 从 Markdown 导入
const markdown = `# Hello World

This is a **bold** paragraph.`;

const nodes = quickImport(markdown, ExportFormat.MARKDOWN);
console.log(nodes);

// 自动检测格式
import { autoImport } from '@wheelchair/core';

const { format, nodes } = autoImport(content);
console.log(`Detected format: ${format}`);
```

### 4. 使用导出菜单组件

```tsx
import { ExportMenu } from '@wheelchair/core';

function Editor() {
  const nodes = [/* editor nodes */];
  
  return (
    <div className="editor">
      <ExportMenu
        nodes={nodes}
        title="My Document"
        onExport={(format, content) => {
          console.log(`Exported as ${format}:`, content);
        }}
        showPreview={true}
      />
    </div>
  );
}
```

### 5. 使用具体导出器

```typescript
import { MarkdownExporter, HTMLExporter, JSONExporter, TextExporter } from '@wheelchair/core';

// Markdown 导出
const mdExporter = new MarkdownExporter({
  frontmatter: true,
  metadata: { author: 'John Doe', date: '2024-01-01' },
});
const mdContent = mdExporter.export(nodes);

// HTML 导出
const htmlExporter = new HTMLExporter({
  fullDocument: true,
  title: 'My Page',
  syntaxHighlight: true,
  highlightTheme: 'github',
});
const htmlContent = htmlExporter.export(nodes);

// JSON 导出
const jsonExporter = new JSONExporter({
  includeMetadata: true,
  includeStats: true,
  pretty: true,
});
const jsonContent = jsonExporter.export(nodes);

// 纯文本导出
const textExporter = new TextExporter({
  lineWidth: 80,
  paragraphSpacing: true,
});
const textContent = textExporter.export(nodes);
```

### 6. 使用具体导入器

```typescript
import { 
  MarkdownImporter, 
  HTMLImporter, 
  TextImporter,
  PasteImporter 
} from '@wheelchair/core';

// Markdown 导入
const mdImporter = new MarkdownImporter({
  gfm: true,
  html: false,
});
const { nodes, metadata } = mdImporter.import(markdownContent);

// HTML 导入
const htmlImporter = new HTMLImporter({
  allowedTags: ['p', 'h1', 'h2', 'strong', 'em'],
  removeEmptyTags: true,
});
const { nodes, title, metadata } = htmlImporter.import(htmlContent);

// 从文件导入
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const result = await mdImporter.importFromFile(file);
  console.log(result.nodes);
});
```

## 剪贴板处理流程

```typescript
import { PasteImporter, importFromClipboardEvent } from '@wheelchair/core';

// 方法 1: 使用事件监听
editor.addEventListener('paste', async (e) => {
  e.preventDefault();
  
  const result = await importFromClipboardEvent(e, {
    preferHTML: true,
    cleanWordStyles: true,
  });
  
  console.log('Source:', result.source); // 'word', 'web', 'plain', etc.
  console.log('Formats:', result.formats);
  console.log('Nodes:', result.nodes);
  
  // 插入到编辑器
  editor.insertNodes(result.nodes);
});

// 方法 2: 手动处理粘贴数据
const pasteImporter = new PasteImporter({
  preferHTML: true,
  cleanWordStyles: true,
  imageHandler: async (dataURL) => {
    // 上传图片并返回 URL
    const url = await uploadImage(dataURL);
    return url;
  },
});

const result = pasteImporter.import({
  html: clipboardHTML,
  text: clipboardText,
  images: imageFiles,
});
```

### 剪贴板处理流程图

```
┌─────────────────────────────────────────────────────────────┐
│                     粘贴事件发生                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                读取剪贴板数据 (Clipboard API)                │
│  ├─ text/html      → HTML 内容                              │
│  ├─ text/plain     → 纯文本内容                             │
│  ├─ text/markdown  → Markdown 内容（部分应用支持）          │
│  ├─ Files          → 图片文件                               │
│  └─ Custom Types   → 自定义数据                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    检测内容来源                              │
│  ├─ Word (包含 Word 命名空间)                               │
│  ├─ Excel (包含 Excel 命名空间)                             │
│  ├─ Web (标准 HTML)                                         │
│  └─ Plain (纯文本)                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    清理和转换                                │
│  ├─ Word: 移除 Mso 类、清理样式                             │
│  ├─ HTML: 过滤危险标签/属性                                 │
│  ├─ Markdown: 解析为标准格式                                │
│  └─ Text: 自动检测列表、标题等                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    转换为节点                                │
└─────────────────────────────────────────────────────────────┘
```

## API 参考

### ExportFormat 枚举

```typescript
enum ExportFormat {
  MARKDOWN = 'markdown',
  HTML = 'html',
  JSON = 'json',
  TEXT = 'text',
}
```

### ImportExportManager

```typescript
class ImportExportManager {
  static getInstance(): ImportExportManager;
  register(handler: FormatHandler): void;
  unregister(format: ExportFormat): void;
  import(format: ExportFormat, content: string, options?: ImportOptions): Node[];
  export(format: ExportFormat, nodes: Node[], options?: ExportOptions): string;
  canImport(format: ExportFormat): boolean;
  canExport(format: ExportFormat): boolean;
  detectFormatByContent(content: string): ExportFormat | null;
  detectFormatByExtension(filename: string): ExportFormat | null;
}
```

## 依赖安装

```bash
# 安装运行时依赖
pnpm add markdown-it turndown

# 安装开发依赖
pnpm add -D @types/markdown-it
```

## 注意事项

1. **浏览器兼容性**: 剪贴板功能需要现代浏览器支持 Clipboard API
2. **安全性**: 导入 HTML 时会自动清理危险标签和脚本
3. **图片处理**: 粘贴图片时需要自行处理上传逻辑
4. **Word 导入**: 支持清理 Word 产生的冗余样式
