# WheelChair 编辑器架构文档

> 本文档详细描述 WheelChair 富文本编辑器的整体架构、模块设计和文件组织方式。

---

## 目录

1. [项目概述](#1-项目概述)
2. [整体架构](#2-整体架构)
3. [目录结构](#3-目录结构)
4. [核心模块详解](#4-核心模块详解)
5. [数据流](#5-数据流)
6. [扩展系统](#6-扩展系统)
7. [工具与配置](#7-工具与配置)

---

## 1. 项目概述

### 1.1 项目定位

WheelChair 是一个基于 **Tiptap 2.0** 和 **ProseMirror** 构建的现代化富文本编辑器，采用 React 作为 UI 框架，TypeScript 提供类型安全。

### 1.2 设计目标

- **模块化**：功能以独立模块形式存在，易于扩展
- **可定制**：提供丰富的配置选项和主题支持
- **高性能**：基于 ProseMirror 的增量更新机制
- **TypeScript 原生**：完整的类型支持

### 1.3 技术栈

```
核心引擎: Tiptap 2.0 + ProseMirror
UI 框架: React 18
样式方案: Tailwind CSS + CSS Variables
状态管理: Zustand
构建工具: Vite 5
包管理: pnpm workspace (Monorepo)
```

---

## 2. 整体架构

### 2.1 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                        应用层 (Apps)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  demo/          - 演示应用                          │   │
│  │  examples/      - 示例代码                          │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                        核心包 (Packages)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  @wheelchair/core  - 编辑器核心功能                  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                        基础设施                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  TypeScript  - 类型系统                             │   │
│  │  Vite        - 构建工具                             │   │
│  │  ESLint      - 代码规范                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户界面层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Toolbar │  │ Bubble   │  │ Slash    │  │ Status   │   │
│  │          │  │ Menu     │  │ Menu     │  │ Bar      │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼───────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 React Hooks 层                       │   │
│  │  useEditor()  - 创建编辑器实例                       │   │
│  │  useEditorState()  - 订阅编辑器状态                  │   │
│  │  useWheelChairEditor()  - 高级编辑器 Hook           │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                  │
│  ┌────────────────────────┼────────────────────────────────┐│
│  │                        ▼                                ││
│  │  ┌─────────────────────────────────────────────────┐   ││
│  │  │           WheelChair 核心编辑器类                │   ││
│  │  │                                                  │   ││
│  │  │  ┌──────────────┐  ┌──────────────┐            │   ││
│  │  │  │StateManager  │  │HistoryManager│            │   ││
│  │  │  │  (Zustand)   │  │  (历史管理)   │            │   ││
│  │  │  └──────────────┘  └──────────────┘            │   ││
│  │  └────────────────────────┬───────────────────────┘   ││
│  │                           │                            ││
│  │  ┌────────────────────────┼──────────────────────────┐ ││
│  │  │                        ▼                          │ ││
│  │  │  ┌─────────────────────────────────────────────┐  │ ││
│  │  │  │         Tiptap Editor 实例                  │  │ ││
│  │  │  │  - ProseMirror 视图层                       │  │ ││
│  │  │  │  - 事务处理系统                              │  │ ││
│  │  │  └─────────────────────────────────────────────┘  │ ││
│  │  └────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
│                             │                               │
│  ┌──────────────────────────┼──────────────────────────────┐│
│  │                          ▼                               ││
│  │  ┌───────────────────────────────────────────────────┐  ││
│  │  │              扩展系统 (Extensions)                 │  ││
│  │  │                                                   │  ││
│  │  │  Nodes: Paragraph, Heading, List, CodeBlock...   │  ││
│  │  │  Marks: Bold, Italic, Underline, Link...         │  ││
│  │  │  Functions: ImageUpload, TableMenu...            │  ││
│  │  └───────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 目录结构

### 3.1 根目录

```
wheelchair/
├── apps/                   # 应用目录
│   └── demo/              # 演示应用
├── packages/              # 核心包目录
│   └── core/             # 编辑器核心
├── docs/                  # 文档目录
│   └── ARCHITECTURE.md   # 本文件
├── package.json          # 根包配置 (pnpm workspace)
├── pnpm-workspace.yaml   # pnpm 工作区配置
├── tailwind.config.js    # Tailwind CSS 配置
├── tsconfig.json         # TypeScript 根配置
└── vite.config.ts        # Vite 构建配置
```

### 3.2 核心包结构 (`packages/core/`)

```
packages/core/
├── src/
│   ├── commands/          # 命令系统
│   │   ├── types.ts      # 命令类型定义
│   │   ├── CommandManager.ts    # 命令管理器
│   │   ├── KeymapManager.ts     # 快捷键管理器
│   │   └── impl/         # 命令实现
│   │       ├── TextCommands.ts
│   │       ├── BlockCommands.ts
│   │       ├── ListCommands.ts
│   │       └── HistoryCommands.ts
│   │
│   ├── components/        # React 组件
│   │   ├── Toolbar/      # 工具栏组件
│   │   │   ├── Toolbar.tsx
│   │   │   ├── ToolbarButton.tsx
│   │   │   ├── ToolbarDropdown.tsx
│   │   │   └── index.ts
│   │   ├── BubbleMenu/   # 气泡菜单
│   │   ├── SlashMenu/    # 斜杠菜单
│   │   ├── StatusBar/    # 状态栏
│   │   ├── ImageUpload/  # 图片上传
│   │   ├── LinkMenu/     # 链接菜单
│   │   ├── CodeBlock/    # 代码块视图
│   │   ├── TableMenu/    # 表格菜单
│   │   ├── ExportMenu/   # 导出菜单
│   │   └── index.tsx     # 组件统一导出
│   │
│   ├── context/           # React Context
│   │   ├── ThemeContext.tsx   # 主题上下文
│   │   └── EditorContext.tsx  # 编辑器上下文
│   │
│   ├── core/              # 编辑器核心
│   │   ├── WheelChairEditor.ts   # 主编辑器类
│   │   ├── StateManager.ts       # 状态管理器
│   │   ├── HistoryManager.ts     # 历史管理器
│   │   └── index.ts
│   │
│   ├── extensions/        # 编辑器扩展
│   │   ├── nodes/        # 节点扩展
│   │   │   ├── Paragraph.ts
│   │   │   ├── Heading.ts
│   │   │   ├── BulletList.ts
│   │   │   ├── OrderedList.ts
│   │   │   ├── TaskList.ts
│   │   │   ├── CodeBlock.ts
│   │   │   ├── Table.ts
│   │   │   ├── Image.ts
│   │   │   └── index.ts
│   │   └── marks/        # 标记扩展
│   │       ├── Bold.ts
│   │       ├── Italic.ts
│   │       ├── Underline.ts
│   │       ├── Strike.ts
│   │       ├── Link.ts
│   │       └── index.ts
│   │
│   ├── exporters/         # 导出器
│   │   ├── MarkdownExporter.ts
│   │   ├── HTMLExporter.ts
│   │   ├── JSONExporter.ts
│   │   └── TextExporter.ts
│   │
│   ├── importers/         # 导入器
│   │   ├── MarkdownImporter.ts
│   │   ├── HTMLImporter.ts
│   │   ├── TextImporter.ts
│   │   └── PasteImporter.ts
│   │
│   ├── hooks/             # React Hooks
│   │   ├── useEditor.ts
│   │   ├── useEditorState.ts
│   │   └── useWheelChairEditor.ts
│   │
│   ├── keymap/            # 快捷键系统
│   │   ├── defaultKeymap.ts
│   │   └── KeymapManager.ts
│   │
│   ├── model/             # 数据模型
│   │   └── node.ts
│   │
│   ├── styles/            # 样式文件
│   │   ├── themes/
│   │   │   ├── light.css
│   │   │   └── dark.css
│   │   ├── editor.css
│   │   └── index.css
│   │
│   ├── types/             # 类型定义
│   │   └── index.ts
│   │
│   ├── utils/             # 工具函数
│   │   ├── cn.ts
│   │   ├── importExport.ts
│   │   ├── markdown.ts
│   │   └── html.ts
│   │
│   └── index.ts           # 包入口
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 4. 核心模块详解

### 4.1 编辑器核心 (`core/`)

#### `WheelChairEditor.ts`

**职责**：编辑器的主类，封装 Tiptap Editor，提供简化 API

**主要功能**：
- 编辑器生命周期管理（初始化、销毁）
- 内容操作（获取/设置 HTML、JSON、纯文本）
- 选区管理
- 事件系统（onUpdate、onSelectionUpdate 等）
- 字数统计

**关键方法**：
```typescript
class WheelChairEditor {
  constructor(options: WheelChairEditorOptions)
  init(element: HTMLElement): void
  getHTML(): string
  getJSON(): JSONContent
  getText(): string
  setContent(content: string | JSONContent): void
  destroy(): void
}
```

#### `StateManager.ts`

**职责**：管理编辑器状态，基于 Zustand 实现

**管理的状态**：
- `editor`: 当前编辑器实例
- `content`: 文档内容（JSON）
- `html`: HTML 表示
- `text`: 纯文本
- `selection`: 当前选区
- `wordCount`: 字数统计
- `isFocused`: 是否聚焦
- `history`: 历史状态

#### `HistoryManager.ts`

**职责**：管理编辑历史，支持撤销/重做

**特性**：
- 可配置的历史深度（默认 100）
- 事务合并（短时间内的连续输入合并为一次操作）
- 历史快照标签

---

### 4.2 命令系统 (`commands/`)

#### 架构设计

```
Command (接口)
    │
    ├── TextCommands      - 文本格式化命令
    │   ├── BoldCommand
    │   ├── ItalicCommand
    │   └── ...
    │
    ├── BlockCommands     - 块级命令
    │   ├── HeadingCommand
    │   ├── BlockquoteCommand
    │   └── ...
    │
    ├── ListCommands      - 列表命令
    │   ├── BulletListCommand
    │   ├── OrderedListCommand
    │   └── ...
    │
    └── HistoryCommands   - 历史命令
        ├── UndoCommand
        └── RedoCommand
```

#### `CommandManager.ts`

**职责**：
- 命令注册与注销
- 命令执行与错误处理
- 命令历史记录
- 快捷键绑定

---

### 4.3 组件系统 (`components/`)

#### 组件分类

| 类别 | 组件 | 功能 |
|------|------|------|
| **工具栏** | Toolbar | 主工具栏容器 |
| | ToolbarButton | 工具栏按钮 |
| | ToolbarDropdown | 下拉选择器 |
| **菜单** | BubbleMenu | 选中文本时的浮动菜单 |
| | SlashMenu | 输入 `/` 触发的命令菜单 |
| | TableMenu | 表格操作菜单 |
| **专用** | ImageUpload | 图片上传弹窗 |
| | LinkMenu | 链接编辑弹窗 |
| | CodeBlockView | 代码块渲染组件 |
| | ExportMenu | 导出功能菜单 |
| **状态** | StatusBar | 底部状态栏 |

#### 组件设计原则

1. **受控组件**：组件状态由父组件通过 props 控制
2. **组合优于继承**：使用组合方式构建复杂组件
3. **类型安全**：完整的 TypeScript 类型定义

---

### 4.4 扩展系统 (`extensions/`)

#### 节点扩展 (`nodes/`)

节点是文档的块级元素：

| 节点 | 说明 | 快捷键 |
|------|------|--------|
| `Paragraph` | 段落 | - |
| `Heading` | 标题 H1-H6 | Ctrl+1~6 |
| `BulletList` | 无序列表 | Ctrl+Shift+U |
| `OrderedList` | 有序列表 | Ctrl+Shift+O |
| `TaskList` | 任务列表 | Ctrl+Shift+T |
| `CodeBlock` | 代码块 | Ctrl+Shift+C |
| `Blockquote` | 引用块 | Ctrl+Shift+Q |
| `Table` | 表格 | - |
| `Image` | 图片 | - |

#### 标记扩展 (`marks/`)

标记是行内样式：

| 标记 | 说明 | 快捷键 |
|------|------|--------|
| `Bold` | 粗体 | Ctrl+B |
| `Italic` | 斜体 | Ctrl+I |
| `Underline` | 下划线 | Ctrl+U |
| `Strike` | 删除线 | - |
| `Link` | 链接 | Ctrl+K |
| `Highlight` | 高亮 | - |
| `TextColor` | 文字颜色 | - |

---

### 4.5 导入导出 (`exporters/`, `importers/`)

#### 支持的格式

| 格式 | 导入 | 导出 | 文件 |
|------|:--:|:--:|------|
| Markdown | ✅ | ✅ | MarkdownExporter.ts, MarkdownImporter.ts |
| HTML | ✅ | ✅ | HTMLExporter.ts, HTMLImporter.ts |
| JSON | ✅ | ✅ | JSONExporter.ts |
| 纯文本 | ✅ | ✅ | TextExporter.ts, TextImporter.ts |

#### 使用示例

```typescript
import { quickExport, ExportFormat } from '@wheelchair/core';

// 导出为 Markdown
const { content, filename } = quickExport(
  editor.getJSON().content,
  ExportFormat.MARKDOWN,
  { title: '我的文档' }
);
```

---

## 5. 数据流

### 5.1 编辑流程

```
用户输入
    │
    ▼
┌─────────────────┐
│  输入处理层      │  (Input Layer)
│  - 键盘事件      │
│  - 鼠标事件      │
│  - 粘贴事件      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  命令系统        │  (Command System)
│  - 命令解析      │
│  - 快捷键映射    │
│  - 事务创建      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ProseMirror    │
│  - 事务应用      │
│  - 状态更新      │
│  - 视图重绘      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React 更新      │
│  - 状态同步      │
│  - UI 重渲染     │
└─────────────────┘
```

### 5.2 状态同步

```
Tiptap Editor State
        │
        │ onUpdate / onSelectionUpdate
        ▼
StateManager (Zustand Store)
        │
        │ 订阅机制
        ▼
React Components
        │
        │ 渲染
        ▼
    UI 更新
```

---

## 6. 扩展系统

### 6.1 创建自定义扩展

#### 节点扩展示例

```typescript
// src/extensions/nodes/CustomNode.ts
import { Node, mergeAttributes } from '@tiptap/core';

export const CustomNode = Node.create({
  name: 'customNode',
  
  group: 'block',
  content: 'inline*',
  
  parseHTML() {
    return [
      { tag: 'div[data-type="custom"]' },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'custom' }), 0];
  },
  
  addCommands() {
    return {
      setCustomNode: () => ({ commands }) => {
        return commands.setNode('customNode');
      },
    };
  },
});
```

#### 标记扩展示例

```typescript
// src/extensions/marks/CustomMark.ts
import { Mark } from '@tiptap/core';

export const CustomMark = Mark.create({
  name: 'customMark',
  
  parseHTML() {
    return [
      { tag: 'span[data-custom]' },
    ];
  },
  
  renderHTML() {
    return ['span', { 'data-custom': '' }, 0];
  },
});
```

---

## 7. 工具与配置

### 7.1 构建配置

#### `vite.config.ts` (核心包)

```typescript
export default defineConfig({
  plugins: [
    react(),
    dts({ insertTypesEntry: true }),  // 生成类型声明
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],  // 仅 ES 模块
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@tiptap/core'],
    },
  },
});
```

### 7.2 类型配置

#### `tsconfig.json`

- `strict`: true - 严格模式
- `isolatedModules`: true - 确保每个文件可以独立编译
- `esModuleInterop`: true - 更好的 CommonJS 互操作性

### 7.3 代码规范

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查

---

## 8. 开发指南

### 8.1 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建核心包
pnpm build:core

# 类型检查
pnpm typecheck
```

### 8.2 添加新功能

1. **添加新命令**：
   - 在 `src/commands/impl/` 创建命令文件
   - 在 `CommandManager` 中注册

2. **添加新组件**：
   - 在 `src/components/` 创建组件目录
   - 在 `src/components/index.tsx` 导出

3. **添加新扩展**：
   - 在 `src/extensions/nodes/` 或 `src/extensions/marks/` 创建
   - 在对应目录的 `index.ts` 导出

### 8.3 调试技巧

- 使用浏览器 DevTools 的 React DevTools 查看组件树
- 使用 Redux DevTools (Zustand 兼容) 查看状态变化
- 在 `WheelChairEditor.ts` 中设置断点调试核心逻辑

---

## 9. 附录

### 9.1 文件命名规范

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 组件 | PascalCase | `ToolbarButton.tsx` |
| 工具函数 | camelCase | `useEditor.ts` |
| 类型定义 | PascalCase | `EditorTypes.ts` |
| 常量 | SCREAMING_SNAKE_CASE | `EXPORT_FORMATS` |
| 样式文件 | kebab-case | `editor-styles.css` |

### 9.2 目录组织原则

- **按功能分组**：相关文件放在同一目录
- **扁平化**：避免过深的目录层级
- **就近原则**：类型定义靠近使用处

### 9.3 依赖关系图

```
@wheelchair/core
    │
    ├── @tiptap/core (peer)
    ├── @tiptap/react (peer)
    ├── react (peer)
    └── zustand

apps/demo
    │
    ├── @wheelchair/core (workspace)
    ├── @tiptap/react
    ├── @tiptap/starter-kit
    └── react
```

---

## 文档信息

- **版本**: v0.1.0
- **更新日期**: 2026-03-25
- **作者**: WheelChair Team
- **状态**: 活跃开发中

---

> 💡 提示：本文档应与 `README.md` 配合使用。README 提供快速入门指南，本文档提供深入架构说明。
