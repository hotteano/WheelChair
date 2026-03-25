# WheelChair Editor - Node Extensions

This directory contains all node extensions for the WheelChair rich text editor.

## Available Nodes

### Basic Nodes

| Node | Description | File |
|------|-------------|------|
| `Paragraph` | 基础段落节点 | `Paragraph.ts` |
| `Heading` | 标题节点 (H1-H6) | `Heading.ts` |
| `Blockquote` | 引用块节点 | `Blockquote.ts` |

### List Nodes

| Node | Description | File |
|------|-------------|------|
| `BulletList` | 无序列表 | `BulletList.ts` |
| `OrderedList` | 有序列表 | `OrderedList.ts` |
| `TaskList` | 任务列表 | `TaskList.ts` |
| `ListItem` | 列表项 | `ListItem.ts` |

### Code Block

| Node | Description | File |
|------|-------------|------|
| `CodeBlock` | 代码块，支持语法高亮 | `CodeBlock.ts` |

**Features:**
- 语法高亮支持 (highlight.js)
- 9种编程语言: JavaScript, TypeScript, Python, HTML, CSS, JSON, Markdown, SQL, Bash
- 语言选择下拉
- 复制代码按钮
- 行号显示/隐藏
- 输入规则: ` ```language ` 触发

**Usage:**
```typescript
import { CodeBlock, SUPPORTED_LANGUAGES } from '@wheelchair/core';

const editor = new Editor({
  extensions: [
    CodeBlock.configure({
      defaultLanguage: 'javascript',
      showLineNumbers: true,
    }),
  ],
});

// Commands
editor.commands.setCodeBlock({ language: 'typescript' });
editor.commands.toggleCodeBlock();
editor.commands.updateCodeBlockLanguage('python');
editor.commands.toggleCodeBlockLineNumbers();
```

**Supported Languages:**

| Language | Value | Icon |
|----------|-------|------|
| JavaScript | `javascript` | js |
| TypeScript | `typescript` | ts |
| Python | `python` | py |
| HTML | `html` | html |
| CSS | `css` | css |
| JSON | `json` | json |
| Markdown | `markdown` | md |
| SQL | `sql` | sql |
| Bash/Shell | `bash` | sh |

**Keyboard Shortcuts:**

| Action | Shortcut |
|--------|----------|
| Toggle Code Block | `Ctrl+Shift+C` |

### Table Nodes

| Node | Description | File |
|------|-------------|------|
| `Table` | 表格容器 | `Table.ts` |
| `TableRow` | 表格行 | `TableRow.ts` |
| `TableCell` | 表格单元格 | `TableCell.ts` |
| `TableHeader` | 表头单元格 | `TableHeader.ts` |

**Features:**
- 插入表格（支持可视化选择行列）
- 添加/删除行列
- 切换表头行
- 单元格背景色设置
- 单元格对齐方式
- Tab 键导航
- 支持 colspan/rowspan 属性

**Usage:**
```typescript
import { Table, TableRow, TableCell, TableHeader } from '@wheelchair/core';

const editor = new Editor({
  extensions: [
    Table,
    TableRow,
    TableCell,
    TableHeader,
  ],
});

// Commands
editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
editor.commands.addColumnBefore();
editor.commands.addColumnAfter();
editor.commands.deleteColumn();
editor.commands.addRowBefore();
editor.commands.addRowAfter();
editor.commands.deleteRow();
editor.commands.deleteTable();
editor.commands.toggleHeaderRow();
editor.commands.setCellAttribute('backgroundColor', '#fee2e2');
```

**Table Operations:**

| Action | Command |
|--------|---------|
| 插入表格 | `insertTable({ rows, cols, withHeaderRow })` |
| 左侧添加列 | `addColumnBefore()` |
| 右侧添加列 | `addColumnAfter()` |
| 删除列 | `deleteColumn()` |
| 上方添加行 | `addRowBefore()` |
| 下方添加行 | `addRowAfter()` |
| 删除行 | `deleteRow()` |
| 删除表格 | `deleteTable()` |
| 切换表头行 | `toggleHeaderRow()` |
| 设置单元格属性 | `setCellAttribute(name, value)` |

**Keyboard Shortcuts:**

| Action | Shortcut |
|--------|----------|
| 移动到下一单元格 | `Tab` |
| 移动到上一单元格 | `Shift+Tab` |

## Node Collections

### Default Nodes

```typescript
import { defaultNodes } from '@wheelchair/core';

const editor = new Editor({
  extensions: [
    ...defaultNodes,
    // 其他扩展...
  ],
});
```

### Minimal Nodes (仅段落)

```typescript
import { minimalNodes } from '@wheelchair/core';
```

### List Nodes

```typescript
import { listNodes } from '@wheelchair/core';
```

### Table Nodes

```typescript
import { tableNodes } from '@wheelchair/core';
```

### Code Block Nodes

```typescript
import { codeBlockNodes } from '@wheelchair/core';
```

## Components

### CodeBlock Components

```typescript
import { CodeBlockView, LanguageSelector } from '@wheelchair/core';
```

### TableMenu Components

```typescript
import { TableMenu, TableGrid } from '@wheelchair/core';
```

## TypeScript Types

```typescript
import type { 
  // Code Block
  CodeBlockOptions, 
  CodeBlockAttributes,
  SupportedLanguage,
  
  // Table
  TableOptions,
  TableCellAttributes,
  TableHeaderAttributes,
  
  // Components
  LanguageSelectorProps,
  TableMenuProps,
  TableGridProps,
} from '@wheelchair/core';
```

## Installation

```bash
pnpm add highlight.js
```

## CSS

确保导入组件样式：

```typescript
import '@wheelchair/core/styles';
```

或在 CSS 中：

```css
@import '@wheelchair/core/styles';
```
