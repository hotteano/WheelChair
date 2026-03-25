# @wheelchair/core

<p align="center">
  <b>WheelChair 编辑器核心包</b>
</p>

## 📖 简介

`@wheelchair/core` 是 WheelChair 富文本编辑器的核心包，基于 [ProseMirror](https://prosemirror.net/) 构建，提供了强大且灵活的富文本编辑能力。

## 🚀 安装

```bash
npm install @wheelchair/core
```

## 📚 API 参考

### 核心组件

#### `WheelChairEditor`

编辑器主组件。

```tsx
import { WheelChairEditor } from '@wheelchair/core';

<WheelChairEditor 
  editor={editor}
  className="my-editor"
/>
```

**Props:**

| 属性 | 类型 | 描述 |
|------|------|------|
| `editor` | `Editor` | 编辑器实例（必需） |
| `className` | `string` | 自定义 CSS 类名 |
| `style` | `CSSProperties` | 内联样式 |

#### `useWheelChairEditor`

创建编辑器实例的 Hook。

```tsx
import { useWheelChairEditor } from '@wheelchair/core';

const editor = useWheelChairEditor({
  content: '<p>Hello World</p>',
  extensions: [],
  onUpdate: ({ editor }) => {
    console.log(editor.getHTML());
  },
});
```

**Options:**

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `content` | `string \| JSONContent` | `''` | 初始内容 |
| `extensions` | `Extensions` | `[]` | 扩展数组 |
| `placeholder` | `string` | - | 占位符文本 |
| `autofocus` | `boolean \| 'start' \| 'end' \| 'all' \| number` | `false` | 自动聚焦 |
| `editable` | `boolean` | `true` | 是否可编辑 |
| `onCreate` | `({ editor }) => void` | - | 创建完成回调 |
| `onUpdate` | `({ editor, transaction }) => void` | - | 内容更新回调 |
| `onSelectionUpdate` | `({ editor }) => void` | - | 选区更新回调 |
| `onDestroy` | `({ editor }) => void` | - | 销毁回调 |
| `onFocus` | `({ editor, event }) => void` | - | 聚焦回调 |
| `onBlur` | `({ editor, event }) => void` | - | 失焦回调 |
| `onPaste` | `({ editor, event }) => boolean` | - | 粘贴事件回调 |
| `onDrop` | `({ editor, event }) => boolean` | - | 拖拽事件回调 |
| `injectCSS` | `boolean` | `true` | 注入默认 CSS |
| `element` | `HTMLElement` | - | 挂载元素 |

### UI 组件

#### `EditorToolbar`

工具栏组件。

```tsx
import { EditorToolbar } from '@wheelchair/core';

<EditorToolbar 
  editor={editor}
  items={['bold', 'italic', 'heading']}
/>
```

**Props:**

| 属性 | 类型 | 描述 |
|------|------|------|
| `editor` | `Editor` | 编辑器实例 |
| `items` | `ToolbarItem[]` | 工具栏项目 |

#### `EditorStatusBar`

状态栏组件。

```tsx
import { EditorStatusBar } from '@wheelchair/core';

<EditorStatusBar 
  editor={editor}
  lastSaved={new Date()}
/>
```

#### `ThemeToggle`

主题切换按钮。

```tsx
import { ThemeToggle, useTheme } from '@wheelchair/core';

const { theme, toggleTheme } = useTheme();
<ThemeToggle theme={theme} onToggle={toggleTheme} />
```

### 编辑器实例方法

#### 内容获取

```typescript
// 获取 HTML
editor.getHTML(): string

// 获取 JSON
editor.getJSON(): JSONContent

// 获取纯文本
editor.getText(options?: { blockSeparator?: string }): string

// 获取 Markdown（需安装 @wheelchair/extension-markdown）
editor.getMarkdown(): string
```

#### 内容设置

```typescript
// 设置 HTML
editor.commands.setContent(content: string, emitUpdate?: boolean): boolean

// 设置 JSON
editor.commands.setContent(content: JSONContent, emitUpdate?: boolean): boolean

// 清空内容
editor.commands.clearContent(emitUpdate?: boolean): boolean

// 插入内容
editor.commands.insertContent(content: string | JSONContent): boolean

// 插入内容到光标位置
editor.commands.insertContentAt(position: number | Range, content: string | JSONContent): boolean
```

#### 选区操作

```typescript
// 设置选区
editor.commands.setTextSelection(position: number | Range): boolean

// 全选
editor.commands.selectAll(): boolean

// 取消选择
editor.commands.blur(): boolean

// 聚焦
editor.commands.focus(position?: FocusPosition): boolean
```

#### 撤销/重做

```typescript
// 撤销
editor.commands.undo(): boolean

// 重做
editor.commands.redo(): boolean
```

#### 剪贴板

```typescript
// 剪切
editor.commands.cut(): boolean

// 复制
editor.commands.copy(): boolean

// 粘贴
editor.commands.paste(): boolean
```

### 状态检查

```typescript
// 检查是否激活
editor.isActive(name: string, attributes?: Record<string, any>): boolean

// 检查是否可执行
editor.can().chain().focus().toggleBold().run()

// 检查是否可撤销
editor.can().undo()

// 检查是否可重做
editor.can().redo()

// 检查是否为空
editor.isEmpty(): boolean

// 检查是否可编辑
editor.isEditable(): boolean

// 检查是否聚焦
editor.isFocused(): boolean
```

## 🔧 配置选项

### 扩展配置

```typescript
import { useWheelChairEditor } from '@wheelchair/core';
import { StarterKit } from '@wheelchair/extensions';
import { Image, Link } from '@wheelchair/extensions';

const editor = useWheelChairEditor({
  extensions: [
    StarterKit,
    Image.configure({
      allowBase64: true,
    }),
    Link.configure({
      openOnClick: false,
    }),
  ],
});
```

### 快捷键配置

```typescript
const editor = useWheelChairEditor({
  editorProps: {
    handleKeyDown: (view, event) => {
      // 自定义键盘处理
      if (event.key === 'Enter' && event.ctrlKey) {
        // Ctrl+Enter 提交
        return true;
      }
      return false;
    },
  },
});
```

### 自定义样式

```typescript
const editor = useWheelChairEditor({
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl',
    },
  },
});
```

## 🔌 扩展开发

### 创建节点 (Node)

```typescript
import { Node } from '@wheelchair/core';

const CustomNode = Node.create({
  name: 'customNode',
  
  // 节点分组
  group: 'block',
  
  // 内容类型
  content: 'inline*',
  
  // 是否原子节点
  atom: false,
  
  // 是否可拖拽
  draggable: true,
  
  // 是否可選擇
  selectable: true,
  
  // 添加属性
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('id'),
        renderHTML: attributes => {
          if (!attributes.id) return {};
          return { id: attributes.id };
        },
      },
    };
  },
  
  // 解析 HTML
  parseHTML() {
    return [
      { tag: 'div[data-custom-node]' },
    ];
  },
  
  // 渲染 HTML
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-custom-node': '', ...HTMLAttributes }, 0];
  },
  
  // 添加命令
  addCommands() {
    return {
      setCustomNode: () => ({ commands }) => {
        return commands.insertContent({ type: 'customNode' });
      },
    };
  },
  
  // 添加键盘快捷键
  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.setCustomNode(),
    };
  },
  
  // 添加输入规则
  addInputRules() {
    return [
      nodeInputRule({
        find: /\$\$(.*)\$\$$/,
        type: this.type,
      }),
    ];
  },
  
  // 添加粘贴规则
  addPasteRules() {
    return [
      nodePasteRule({
        find: /https:\/\/example\.com\/(.*)/g,
        type: this.type,
      }),
    ];
  },
  
  // 添加节点视图
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'custom-node';
      // ...
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          // 更新逻辑
          return true;
        },
        destroy: () => {
          // 清理逻辑
        },
      };
    };
  },
  
  // 添加 ProseMirror 插件
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('customPlugin'),
        // ...
      }),
    ];
  },
  
  // 添加存储
  addStorage() {
    return {
      count: 0,
    };
  },
  
  // 扩展配置
  addOptions() {
    return {
      customOption: true,
    };
  },
  
  // 配置改变时调用
  onUpdate() {
    // 配置更新回调
  },
});
```

### 创建标记 (Mark)

```typescript
import { Mark } from '@wheelchair/core';

const CustomMark = Mark.create({
  name: 'customMark',
  
  // 排除其他标记
  excludes: '_',
  
  // 是否跨行内联
  spanning: true,
  
  // 添加属性
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.style.color,
        renderHTML: attributes => {
          if (!attributes.color) return {};
          return { style: `color: ${attributes.color}` };
        },
      },
    };
  },
  
  // 解析 HTML
  parseHTML() {
    return [
      { 
        tag: 'span',
        getAttrs: element => {
          if (element.classList.contains('custom-mark')) {
            return {};
          }
          return false;
        },
      },
    ];
  },
  
  // 渲染 HTML
  renderHTML({ HTMLAttributes }) {
    return ['span', { class: 'custom-mark', ...HTMLAttributes }, 0];
  },
  
  // 添加命令
  addCommands() {
    return {
      setCustomMark: (attributes) => ({ commands }) => {
        return commands.setMark('customMark', attributes);
      },
      unsetCustomMark: () => ({ commands }) => {
        return commands.unsetMark('customMark');
      },
      toggleCustomMark: (attributes) => ({ commands }) => {
        return commands.toggleMark('customMark', attributes);
      },
    };
  },
  
  // 添加快捷键
  addKeyboardShortcuts() {
    return {
      'Mod-m': () => this.editor.commands.toggleCustomMark(),
    };
  },
});
```

### 创建扩展 (Extension)

```typescript
import { Extension } from '@wheelchair/core';

const CustomExtension = Extension.create({
  name: 'customExtension',
  
  // 添加选项
  addOptions() {
    return {
      enableFeature: true,
    };
  },
  
  // 添加存储
  addStorage() {
    return {
      count: 0,
    };
  },
  
  // 添加全局属性
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          customAttr: {
            default: null,
          },
        },
      },
    ];
  },
  
  // 添加命令
  addCommands() {
    return {
      customCommand: () => ({ editor, chain }) => {
        // 自定义命令逻辑
        return chain().focus().run();
      },
    };
  },
  
  // 添加键盘快捷键
  addKeyboardShortcuts() {
    return {};
  },
  
  // 添加 ProseMirror 插件
  addProseMirrorPlugins() {
    return [];
  },
  
  // 扩展其他扩展
  extendParentConfig: true,
  
  // 在父扩展之前调用
  priority: 100,
  
  // 生命周期钩子
  onCreate() {
    console.log('Extension created');
  },
  
  onUpdate() {
    console.log('Content updated');
  },
  
  onSelectionUpdate() {
    console.log('Selection updated');
  },
  
  onTransaction({ transaction }) {
    console.log('Transaction applied');
  },
  
  onFocus() {
    console.log('Editor focused');
  },
  
  onBlur() {
    console.log('Editor blurred');
  },
  
  onDestroy() {
    console.log('Editor destroyed');
  },
});
```

## 🎨 样式定制

### CSS 变量

```css
:root {
  /* 主题色 */
  --wheelchair-primary: #4f46e5;
  --wheelchair-primary-hover: #4338ca;
  
  /* 背景色 */
  --wheelchair-bg: #ffffff;
  --wheelchair-bg-surface: #f9fafb;
  
  /* 边框 */
  --wheelchair-border: #e5e7eb;
  --wheelchair-border-focus: #4f46e5;
  
  /* 文本 */
  --wheelchair-text: #111827;
  --wheelchair-text-muted: #6b7280;
  
  /* 圆角 */
  --wheelchair-radius: 8px;
  
  /* 阴影 */
  --wheelchair-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### 编辑器样式

```css
.wheelchair-editor {
  /* 编辑器容器 */
}

.wheelchair-editor .ProseMirror {
  /* 编辑区域 */
}

.wheelchair-editor .ProseMirror p {
  /* 段落 */
}

.wheelchair-editor .ProseMirror h1, 
.wheelchair-editor .ProseMirror h2 {
  /* 标题 */
}

/* 占位符 */
.wheelchair-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--wheelchair-text-muted);
  float: left;
  pointer-events: none;
  height: 0;
}

/* 选中样式 */
.wheelchair-editor .ProseMirror ::selection {
  background: rgba(79, 70, 229, 0.3);
}

/* 拖拽样式 */
.wheelchair-editor .ProseMirror.ProseMirror-drop-target {
  border: 2px dashed var(--wheelchair-primary);
}
```

## 📦 类型定义

```typescript
import type { 
  Editor,
  JSONContent,
  Range,
  Command,
  EditorOptions,
  EditorEvents,
  // ... 更多类型
} from '@wheelchair/core';
```

## 🔗 相关链接

- [完整文档](../../docs/)
- [React 集成](../react/)
- [Vue 集成](../vue/)
- [官方扩展](../extensions/)

## 📄 许可证

[MIT](../../LICENSE)
