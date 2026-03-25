# WheelChair 自定义扩展示例

学习如何创建自定义节点、标记和工具栏组件。

## 示例内容

### 1. 自定义节点：YouTube 嵌入
- 创建 block 级别的节点
- 使用 `addNodeView` 定义渲染
- 添加自定义命令

### 2. 自定义标记：数学公式
- 创建 inline 标记
- 使用 `addAttributes` 定义属性
- 使用 `addCommands` 添加命令

### 3. Emoji 节点
- 创建 atom 节点
- 自定义渲染视图

### 4. Callout 提示框
- 复杂节点结构（图标 + 内容）
- 使用 `contentDOM` 实现可编辑内容

## 快速开始

```bash
npm install
npm run dev
```

## 扩展开发基础

### 节点 (Node)

```javascript
import { Node } from '@wheelchair/core';

const MyNode = Node.create({
  name: 'myNode',
  group: 'block',
  
  addAttributes() {
    return {
      attrName: { default: 'value' },
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-my-node]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-my-node': '', ...HTMLAttributes }, 0];
  },
});
```

### 标记 (Mark)

```javascript
import { Mark } from '@wheelchair/core';

const MyMark = Mark.create({
  name: 'myMark',
  
  renderHTML() {
    return ['span', { class: 'my-mark' }, 0];
  },
});
```

### 工具栏组件

```javascript
function createToolbarButton(editor, command, label) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.onclick = () => editor.chain().focus()[command]().run();
  return btn;
}
```

## 更多资源

- [扩展开发指南](../../packages/core/README.md#扩展开发)
- [API 文档](../../packages/core/README.md#api-参考)
