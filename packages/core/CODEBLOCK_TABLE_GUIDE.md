# WheelChair Editor - Code Block & Table 使用指南

## 快速开始

### 1. 安装依赖

```bash
cd packages/core
pnpm add highlight.js
```

### 2. 导入扩展

```typescript
import { 
  Editor 
} from '@tiptap/core';
import { 
  CodeBlock, 
  Table, TableRow, TableCell, TableHeader,
  defaultNodes 
} from '@wheelchair/core';
import '@wheelchair/core/styles';
```

### 3. 创建编辑器

```typescript
const editor = new Editor({
  element: document.querySelector('.editor'),
  extensions: [
    ...defaultNodes, // 包含 CodeBlock 和 Table
  ],
  content: '<p>Hello World</p>',
});
```

---

## 代码块 (CodeBlock)

### 基础用法

```typescript
// 设置代码块
editor.commands.setCodeBlock({ language: 'javascript' });

// 切换代码块
editor.commands.toggleCodeBlock();

// 更改语言
editor.commands.updateCodeBlockLanguage('python');

// 切换行号显示
editor.commands.toggleCodeBlockLineNumbers();
```

### 触发方式

1. **斜杠菜单**: 输入 `/code` 选择代码块
2. **快捷键**: `Ctrl+Shift+C`
3. **输入规则**: 输入 ` ```javascript ` 后按空格

### 支持的编程语言

| 语言 | 标识符 | 示例 |
|------|--------|------|
| JavaScript | `javascript`, `js` | ` ```js ` |
| TypeScript | `typescript`, `ts` | ` ```ts ` |
| Python | `python`, `py` | ` ```py ` |
| HTML | `html` | ` ```html ` |
| CSS | `css` | ` ```css ` |
| JSON | `json` | ` ```json ` |
| Markdown | `markdown`, `md` | ` ```md ` |
| SQL | `sql` | ` ```sql ` |
| Bash/Shell | `bash`, `sh` | ` ```sh ` |

### 配置选项

```typescript
CodeBlock.configure({
  defaultLanguage: 'javascript',  // 默认语言
  showLineNumbers: true,          // 默认显示行号
});
```

### React 组件使用

```tsx
import { CodeBlockView, LanguageSelector } from '@wheelchair/core';

// 在 NodeView 中使用
function MyEditor() {
  return (
    <EditorContent editor={editor} />
  );
}

// 单独使用语言选择器
function MyComponent() {
  return (
    <LanguageSelector
      value="javascript"
      onChange={(lang) => console.log('Selected:', lang)}
    />
  );
}
```

---

## 表格 (Table)

### 基础用法

```typescript
// 插入表格 (3x3, 带表头)
editor.commands.insertTable({ 
  rows: 3, 
  cols: 3, 
  withHeaderRow: true 
});

// 添加列 (左侧)
editor.commands.addColumnBefore();

// 添加列 (右侧)
editor.commands.addColumnAfter();

// 删除列
editor.commands.deleteColumn();

// 添加行 (上方)
editor.commands.addRowBefore();

// 添加行 (下方)
editor.commands.addRowAfter();

// 删除行
editor.commands.deleteRow();

// 删除表格
editor.commands.deleteTable();

// 切换表头行
editor.commands.toggleHeaderRow();
```

### 单元格样式

```typescript
// 设置单元格背景色
editor.commands.setCellAttribute('backgroundColor', '#fee2e2');

// 设置单元格对齐方式
editor.commands.setCellAttribute('align', 'center');

// 设置边框颜色
editor.commands.setCellAttribute('borderColor', '#ff0000');
```

### 键盘导航

| 按键 | 功能 |
|------|------|
| `Tab` | 移动到下一个单元格 |
| `Shift+Tab` | 移动到上一个单元格 |
| `Enter` | 在单元格内换行 |

### React 组件使用

```tsx
import { TableMenu, TableGrid } from '@wheelchair/core';

// 表格操作菜单
function MyToolbar() {
  return (
    <TableMenu editor={editor} />
  );
}

// 表格网格选择器
function MyTableSelector() {
  return (
    <TableGrid
      maxRows={10}
      maxCols={10}
      onSelect={(rows, cols) => {
        editor.commands.insertTable({ rows, cols });
      }}
    />
  );
}
```

---

## 完整示例

```tsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { 
  CodeBlock, Table, TableRow, TableCell, TableHeader,
  SUPPORTED_LANGUAGES 
} from '@wheelchair/core';
import { TableMenu } from '@wheelchair/core';
import '@wheelchair/core/styles';

function RichTextEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlock.configure({
        defaultLanguage: 'typescript',
        showLineNumbers: true,
      }),
      Table,
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: `
      <h2>代码示例</h2>
      <pre data-language="javascript"><code>const greeting = 'Hello World';</code></pre>
      
      <h2>表格示例</h2>
      <table>
        <tr><th>名称</th><th>值</th></tr>
        <tr><td>测试</td><td>123</td></tr>
      </table>
    `,
  });

  if (!editor) return null;

  return (
    <div className="editor-wrapper">
      <div className="toolbar">
        <button 
          onClick={() => editor.commands.toggleCodeBlock()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
        >
          代码块
        </button>
        
        <TableMenu editor={editor} />
      </div>
      
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}

export default RichTextEditor;
```

---

## 快捷键参考

### 代码块

| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 切换代码块 | `Ctrl+Shift+C` | `Cmd+Shift+C` |

### 表格

| 功能 | 快捷键 |
|------|--------|
| 下一单元格 | `Tab` |
| 上一单元格 | `Shift+Tab` |

---

## 样式定制

### CSS 变量

```css
:root {
  /* 代码块 */
  --wc-code-bg: #f5f5f5;
  --wc-code-border: #e0e0e0;
  --wc-code-text: #333;
  
  /* 表格 */
  --wc-table-border: #e0e0e0;
  --wc-table-header-bg: #f5f5f5;
  --wc-table-cell-hover: #fafafa;
}
```

### 暗色主题

```css
[data-theme="dark"] {
  --wc-code-bg: #1e1e1e;
  --wc-code-border: #3c3c3c;
  --wc-code-text: #d4d4d4;
  
  --wc-table-border: #3c3c3c;
  --wc-table-header-bg: #252526;
}
```

---

## 注意事项

1. **代码块语言高亮**: 首次加载语言时会异步加载对应的 highlight.js 语言模块
2. **表格合并单元格**: 当前版本暂不支持合并/拆分单元格，将在后续版本添加
3. **表格宽度**: 表格默认占满容器宽度，单元格最小宽度为 100px
4. **代码块复制**: 复制功能使用 Clipboard API，在不支持的环境中会自动降级
