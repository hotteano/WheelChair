# 富文本编辑器技术架构与管线设计

## 一、技术栈推荐

### 1.1 推荐方案：TypeScript + React + Tiptap

```
┌─────────────────────────────────────────────────────────────┐
│                      技术栈全景图                             │
├─────────────────────────────────────────────────────────────┤
│  表现层  │  React 18 + TypeScript 5.x                        │
├─────────────────────────────────────────────────────────────┤
│  编辑器核心 │  Tiptap 2.x (基于 ProseMirror)                    │
├─────────────────────────────────────────────────────────────┤
│  状态管理 │  Zustand / Jotai (轻量级)                         │
├─────────────────────────────────────────────────────────────┤
│  样式方案 │  Tailwind CSS + CSS Variables                     │
├─────────────────────────────────────────────────────────────┤
│  构建工具 │  Vite 5.x                                         │
├─────────────────────────────────────────────────────────────┤
│  测试 │  Vitest + React Testing Library + Playwright         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 为什么选择这个技术栈？

| 技术 | 优势 | 适用场景 |
|------|------|----------|
| **TypeScript** | 类型安全、IDE 友好、重构安全 | 大型编辑器项目必选 |
| **React** | 生态丰富、组件化、Virtual DOM | UI 复杂、交互多的场景 |
| **Tiptap** | Headless 设计、扩展性强、TypeScript 原生 | 需要深度定制的编辑器 |
| **ProseMirror** | 工业级稳定性、协同编辑原生支持 | 文档类应用底层 |

### 1.3 替代方案对比

```
┌────────────────┬──────────────┬──────────────┬──────────────┐
│     方案       │   学习曲线    │   定制能力    │   适用场景    │
├────────────────┼──────────────┼──────────────┼──────────────┤
│ Tiptap+React   │     中等      │     极高      │ 企业级编辑器  │
│ Slate+React    │     中等      │     高        │ React 深度用户 │
│ Quill          │     低        │     中        │ 快速上线项目  │
│ Editor.js      │     低        │     中        │ 块级内容编辑  │
│ 原生 Canvas    │     极高      │     极高      │ 极致性能要求  │
└────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 二、编辑管线设计 (Editing Pipeline)

### 2.1 整体流程

```
用户输入
   │
   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  输入捕获层   │────▶│  命令处理层   │────▶│  状态转换层   │
│ Input Layer  │     │ Command Layer │     │  State Layer │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
   ┌────────────────────────────────────────────┘
   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  数据持久化   │◀────│  变更通知层   │◀────│  文档模型层   │
│ Persistence  │     │  Notify Layer │     │ Document Model│
└──────────────┘     └──────────────┘     └──────────────┘
```

### 2.2 各层详细设计

#### Layer 1: 输入捕获层 (Input Layer)

```typescript
// 职责：捕获所有用户输入事件
interface InputLayer {
  // 键盘事件
  onKeyDown(event: KeyboardEvent): void;
  onKeyUp(event: KeyboardEvent): void;
  onInput(event: InputEvent): void;
  
  // 鼠标/触摸事件
  onMouseDown(event: MouseEvent): void;
  onMouseMove(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
  onClick(event: MouseEvent): void;
  
  // 剪贴板事件
  onPaste(event: ClipboardEvent): void;
  onCopy(event: ClipboardEvent): void;
  onCut(event: ClipboardEvent): void;
  
  // 拖拽事件
  onDrop(event: DragEvent): void;
  onDragOver(event: DragEvent): void;
}

// 输入分类处理
enum InputType {
  TEXT_INSERT,      // 文本输入
  TEXT_DELETE,      // 文本删除
  FORMAT_APPLY,     // 格式应用
  BLOCK_TRANSFORM,  // 块级转换
  NODE_INSERT,      // 节点插入（图片、表格等）
  UNDO_REDO,        // 撤销重做
  SELECTION_CHANGE, // 选区变化
}
```

#### Layer 2: 命令处理层 (Command Layer)

```typescript
// 职责：将输入转换为可执行的命令
interface CommandSystem {
  // 命令定义
  interface Command {
    id: string;
    execute(): boolean;
    undo(): boolean;
    redo(): boolean;
  }
  
  // 命令链（用于复合操作）
  interface CommandChain {
    commands: Command[];
    executeAll(): void;
    undoAll(): void;
  }
  
  // 命令映射表
  keymap: Map<string, Command>;        // 键盘快捷键
  toolbarMap: Map<string, Command>;    // 工具栏按钮
  slashCommands: Map<string, Command>; // 斜杠命令
}

// 命令执行流程
const executeCommand = (command: Command) => {
  // 1. 前置检查
  if (!canExecute(command)) return false;
  
  // 2. 执行命令
  const result = command.execute();
  
  // 3. 记录历史
  if (result && command.isRecordable) {
    historyManager.push(command);
  }
  
  // 4. 触发事件
  eventEmitter.emit('command:executed', command);
  
  return result;
};
```

#### Layer 3: 状态转换层 (State Layer)

```typescript
// 职责：管理编辑器状态，处理事务
interface StateManager {
  // 事务系统（保证原子性）
  interface Transaction {
    steps: Step[];           // 操作步骤
    before: EditorState;     // 操作前状态
    after: EditorState;      // 操作后状态
    time: number;            // 时间戳
    
    apply(): EditorState;    // 应用事务
    invert(): Transaction;   // 反转事务（用于撤销）
  }
  
  // 事务合并策略
  mergeTransactions(prev: Transaction, curr: Transaction): boolean {
    // 同位置连续输入合并
    // 同类型格式操作合并
    // 时间间隔 < 500ms 的输入合并
  }
}

// 状态流转
const applyTransaction = (state: EditorState, tr: Transaction) => {
  // 1. 插件预处理
  const filteredTr = plugins.reduce((tr, plugin) => 
    plugin.filterTransaction(tr) || tr
  , tr);
  
  // 2. 应用事务
  const newState = state.apply(filteredTr);
  
  // 3. 插件后处理
  plugins.forEach(plugin => plugin.onTransaction(tr, newState));
  
  return newState;
};
```

#### Layer 4: 文档模型层 (Document Model)

```typescript
// ProseMirror 文档模型
interface DocumentModel {
  // 文档结构（树形）
  interface Node {
    type: NodeType;           // 节点类型
    attrs: Record<string, any>; // 属性
    content?: Node[];         // 子节点
    marks?: Mark[];           // 标记（格式）
    text?: string;            // 文本内容
  }
  
  // 节点类型定义
  enum NodeType {
    // 块级节点
    DOC = 'doc',
    PARAGRAPH = 'paragraph',
    HEADING = 'heading',
    BLOCKQUOTE = 'blockquote',
    CODE_BLOCK = 'codeBlock',
    LIST_ITEM = 'listItem',
    BULLET_LIST = 'bulletList',
    ORDERED_LIST = 'orderedList',
    TABLE = 'table',
    IMAGE = 'image',
    HORIZONTAL_RULE = 'horizontalRule',
    
    // 行内节点
    TEXT = 'text',
    HARD_BREAK = 'hardBreak',
  }
  
  // 标记类型（格式）
  enum MarkType {
    BOLD = 'bold',
    ITALIC = 'italic',
    UNDERLINE = 'underline',
    STRIKETHROUGH = 'strike',
    CODE = 'code',
    LINK = 'link',
    HIGHLIGHT = 'highlight',
    TEXT_COLOR = 'textColor',
  }
}

// 文档示例
const documentExample = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: '标题' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '普通文本' },
        { type: 'text', marks: [{ type: 'bold' }], text: '粗体文本' },
        { type: 'text', marks: [{ type: 'link', attrs: { href: '#' } }], text: '链接' }
      ]
    }
  ]
};
```

#### Layer 5: 变更通知层 (Notify Layer)

```typescript
// 职责：状态变更通知与订阅
interface NotifySystem {
  // 变更类型
  enum ChangeType {
    CONTENT,      // 内容变更
    SELECTION,    // 选区变更
    FOCUS,        // 焦点变更
    SCROLL,       // 滚动位置
    HISTORY,      // 历史状态变化
  }
  
  // 订阅机制
  subscribe(type: ChangeType, callback: Function): Unsubscribe;
  
  // 批量通知（防抖优化）
  batchNotify(changes: Change[]): void;
}

// 订阅示例
editor.on('content', (change) => {
  // 更新 UI
  toolbar.setActive(change.marks);
  // 字数统计
  wordCount.update(change.doc);
  // 自动保存
  autoSave.schedule(change.doc);
});
```

#### Layer 6: 数据持久化层 (Persistence Layer)

```typescript
// 职责：数据存储与恢复
interface PersistenceLayer {
  // 序列化格式
  interface SerializedDoc {
    json: JSONDoc;     // 结构化数据
    html?: string;     // HTML 渲染结果
    markdown?: string; // Markdown 格式
    plainText?: string; // 纯文本
  }
  
  // 存储适配器
  interface StorageAdapter {
    save(doc: SerializedDoc): Promise<void>;
    load(): Promise<SerializedDoc>;
    export(format: ExportFormat): Promise<Blob>;
  }
  
  // 自动保存策略
  autoSave: {
    mode: 'interval' | 'onChange' | 'onBlur';
    interval: 5000;  // 5秒
    maxRetries: 3;
    onSave: (doc: SerializedDoc) => Promise<void>;
  };
}
```

---

## 三、渲染管线设计 (Rendering Pipeline)

### 3.1 整体流程

```
文档模型 (JSON)
     │
     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   解析层     │────▶│   虚拟层     │────▶│   渲染层     │
│   Parser     │     │ Virtual DOM  │     │   Render     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
   ┌────────────────────────────────────────────┘
   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   布局层     │────▶│   绘制层     │────▶│   显示层     │
│   Layout     │     │    Paint     │     │  Composite   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 3.2 各层详细设计

#### Layer 1: 解析层 (Parser)

```typescript
// 职责：将各种输入格式解析为文档模型
interface ParserSystem {
  // HTML 解析
  parseHTML(html: string): DocumentNode {
    const dom = new DOMParser().parseFromString(html, 'text/html');
    return this.domToNode(dom.body);
  }
  
  // Markdown 解析
  parseMarkdown(md: string): DocumentNode {
    const tokens = markdownLexer(md);
    return this.tokensToNode(tokens);
  }
  
  // 纯文本解析
  parsePlainText(text: string): DocumentNode {
    return {
      type: 'doc',
      content: text.split('\n').map(line => ({
        type: 'paragraph',
        content: [{ type: 'text', text: line }]
      }))
    };
  }
  
  // 剪贴板解析（处理 Word、网页等）
  parseClipboard(data: DataTransfer): DocumentNode {
    // 优先使用自定义格式
    const custom = data.getData('application/x-editor-json');
    if (custom) return JSON.parse(custom);
    
    // 尝试 HTML
    const html = data.getData('text/html');
    if (html) return this.parseHTML(html);
    
    // 降级纯文本
    return this.parsePlainText(data.getData('text/plain'));
  }
}
```

#### Layer 2: 虚拟层 (Virtual DOM)

```typescript
// 职责：构建虚拟 DOM，优化渲染性能
interface VirtualDOMSystem {
  // 虚拟节点定义
  interface VNode {
    type: string | Component;
    props: Record<string, any>;
    children: (VNode | string)[];
    key?: string;
  }
  
  // 节点映射器：将文档节点映射为虚拟节点
  nodeToVNode(node: DocumentNode): VNode {
    const nodeSpec = nodeRegistry.get(node.type);
    
    return {
      type: nodeSpec.component,
      props: {
        ...node.attrs,
        'data-node-type': node.type,
        'data-pos': node.pos,
      },
      children: node.content?.map(child => 
        child.text 
          ? this.renderText(child)
          : this.nodeToVNode(child)
      ) || []
    };
  }
  
  // 差异算法（轻量级，大部分由 React/Vue 处理）
  diff(oldTree: VNode, newTree: VNode): Patch[];
}

// React 集成示例
const EditorContent: React.FC<{ doc: DocumentNode }> = ({ doc }) => {
  // 使用 useMemo 缓存虚拟 DOM 构建
  const vDOM = useMemo(() => {
    return buildVirtualDOM(doc);
  }, [doc]);
  
  // 渲染节点
  return renderVNode(vDOM);
};
```

#### Layer 3: 渲染层 (Render)

```typescript
// 职责：将虚拟节点渲染为真实 DOM
interface RenderSystem {
  // 节点渲染器注册表
  nodeRenderers: Map<NodeType, NodeRenderer>;
  markRenderers: Map<MarkType, MarkRenderer>;
  
  // 渲染上下文
  interface RenderContext {
    editor: Editor;
    selected: boolean;
    focused: boolean;
    readonly: boolean;
  }
}

// 渲染器示例
const paragraphRenderer: NodeRenderer = {
  render(node, children, context) {
    return (
      <p 
        className={cn(
          'editor-paragraph',
          context.selected && 'is-selected'
        )}
        data-id={node.attrs.id}
      >
        {children}
      </p>
    );
  }
};

const boldRenderer: MarkRenderer = {
  render(mark, children) {
    return <strong className="editor-bold">{children}</strong>;
  }
};

// 图片渲染（含懒加载）
const imageRenderer: NodeRenderer = {
  render(node) {
    return (
      <NodeViewWrapper>
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          loading="lazy"
          onError={handleImageError}
          className="editor-image"
        />
        {node.attrs.caption && (
          <figcaption>{node.attrs.caption}</figcaption>
        )}
      </NodeViewWrapper>
    );
  }
};
```

#### Layer 4: 布局层 (Layout)

```typescript
// 职责：处理复杂布局（表格、分栏、浮动等）
interface LayoutSystem {
  // 布局引擎
  interface LayoutEngine {
    // 计算元素尺寸和位置
    measure(node: Element): Rect;
    
    // 处理浮动元素
    handleFloats(container: Element, floats: Element[]): void;
    
    // 分页（打印预览）
    paginate(doc: Element, pageSize: Size): Page[];
  }
  
  // 表格布局优化
  tableLayout: {
    // 列宽计算
    calcColumnWidths(table: TableElement): number[];
    // 表头固定
    stickyHeader(table: TableElement): void;
  };
}
```

#### Layer 5: 绘制层 (Paint)

```typescript
// 职责：优化绘制性能，处理动画
interface PaintSystem {
  // 绘制优化
  optimization: {
    // 分层渲染
    willChange: 'transform' | 'opacity';
    
    // 防抖重绘
    requestAnimationFrame(callback: FrameRequestCallback): number;
    
    // 批量 DOM 操作
    batchDOMOperations(operations: Function[]): void;
  };
  
  // 选区高亮绘制
  selectionHighlight: {
    // 使用 Overlay 层，避免重排
    render(selection: Selection): void;
    // 多选区支持
    renderMultiple(selections: Selection[]): void;
  };
  
  // 装饰层（拼写检查、搜索高亮等）
  decorations: {
    addDecorations(decos: Decoration[]): void;
    removeDecorations(ids: string[]): void;
    clear(): void;
  };
}
```

#### Layer 6: 显示层 (Composite)

```typescript
// 职责：最终合成与屏幕显示
interface CompositeSystem {
  // 图层管理
  layers: {
    content: Layer;      // 内容层
    selection: Layer;    // 选区层
    decoration: Layer;   // 装饰层
    ui: Layer;           // UI 层（光标、拖拽等）
    overlay: Layer;      // 浮层（菜单、弹窗）
  };
  
  // 合成策略
  composite(): void {
    // 按 z-index 顺序合成各层
    // 使用 CSS containment 优化
    // 仅重绘变更区域
  }
}
```

---

## 四、关键流程时序图

### 4.1 文本输入流程

```
用户输入 "Hello"
     │
     ▼
┌─────────────┐
│  键盘事件    │
│  onInput()  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  输入法合成  │─── 等待 compositionend
│  IME Input  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  创建事务    │
│ Transaction │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 应用事务     │─── 更新文档模型
│ Apply Step  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  虚拟 DOM    │─── 差异对比
│  Diff VDOM  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  真实 DOM    │─── 局部更新
│  Update DOM │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  通知订阅者  │─── UI 更新、自动保存等
│   Notify    │
└─────────────┘
```

### 4.2 图片上传流程

```
用户粘贴图片
     │
     ▼
┌─────────────┐
│ 剪贴板处理   │
│ readBlob()  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 图片预处理   │─── 压缩、格式转换
│ Preprocess  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 显示占位图   │─── 本地预览 + 上传进度
│ Placeholder │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  上传服务    │─── 异步上传
│   Upload    │
└──────┬──────┘
       │
       ├── 上传成功 ──▶ 替换 URL
       │
       └── 上传失败 ──▶ 显示错误 + 重试
```

---

## 五、性能优化策略

### 5.1 大数据量优化

```typescript
// 虚拟滚动（长文档）
interface VirtualScroll {
  // 只渲染视口内 + 缓冲区的节点
  visibleRange: { start: number; end: number };
  bufferSize: 5;  // 上下各缓冲 5 个节点
  
  // 节点高度估算
  estimateHeight(node: Node): number;
  
  // 实际高度缓存
  heightCache: Map<string, number>;
}

// 分片渲染
const chunkedRender = (nodes: Node[], chunkSize = 50) => {
  const chunks = chunk(nodes, chunkSize);
  
  chunks.forEach((chunk, index) => {
    requestIdleCallback(() => {
      renderChunk(chunk);
    }, { timeout: 100 });
  });
};
```

### 5.2 渲染优化

```typescript
// 1. 使用 CSS Containment
.editor-content {
  contain: layout style paint;
}

// 2. 防抖高频操作
const debouncedUpdate = debounce((state) => {
  updateUI(state);
}, 16);  // 约 60fps

// 3. 离屏渲染复杂内容
const offscreenRender = (canvas: HTMLCanvasElement, content: Node) => {
  const offscreen = canvas.transferControlToOffscreen();
  worker.postMessage({ canvas: offscreen, content }, [offscreen]);
};
```

---

## 六、文件结构

```
editor/
├── core/                          # 编辑器核心
│   ├── Editor.ts                  # 主编辑器类
│   ├── StateManager.ts            # 状态管理
│   ├── Transaction.ts             # 事务系统
│   └── HistoryManager.ts          # 历史记录
│
├── model/                         # 文档模型
│   ├── Node.ts                    # 节点基类
│   ├── Mark.ts                    # 标记基类
│   ├── Schema.ts                  # 模式定义
│   └── Fragment.ts                # 片段管理
│
├── transform/                     # 转换操作
│   ├── Step.ts                    # 操作步骤
│   ├── ReplaceStep.ts             # 替换操作
│   └── MarkStep.ts                # 标记操作
│
├── input/                         # 输入处理
│   ├── InputManager.ts            # 输入管理
│   ├── KeyHandler.ts              # 键盘处理
│   ├── ClipboardHandler.ts        # 剪贴板处理
│   └── DragHandler.ts             # 拖拽处理
│
├── render/                        # 渲染系统
│   ├── Renderer.ts                # 渲染器
│   ├── NodeView.ts                # 节点视图
│   ├── Decoration.ts              # 装饰系统
│   └── plugins/                   # 渲染插件
│       ├── ImageResizePlugin.ts
│       ├── TableResizePlugin.ts
│       └── CodeHighlightPlugin.ts
│
├── commands/                      # 命令系统
│   ├── CommandManager.ts          # 命令管理
│   ├── TextCommands.ts            # 文本命令
│   ├── BlockCommands.ts           # 块级命令
│   └── NodeCommands.ts            # 节点命令
│
├── extensions/                    # 扩展
│   ├── Extension.ts               # 扩展基类
│   ├── nodes/                     # 节点扩展
│   │   ├── Image.ts
│   │   ├── Table.ts
│   │   └── CodeBlock.ts
│   └── marks/                     # 标记扩展
│       ├── Bold.ts
│       ├── Link.ts
│       └── Highlight.ts
│
├── ui/                            # UI 组件
│   ├── components/                # 基础组件
│   │   ├── Toolbar/
│   │   ├── BubbleMenu/
│   │   ├── SlashMenu/
│   │   └── StatusBar/
│   ├── hooks/                     # React Hooks
│   └── styles/                    # 样式文件
│
├── utils/                         # 工具函数
│   ├── browser.ts                 # 浏览器检测
│   ├── platform.ts                # 平台适配
│   └── dom.ts                     # DOM 工具
│
└── types/                         # 类型定义
    ├── index.ts
    └── api.ts
```

---

> 更新时间：2026-03-25  
> 版本：v1.0
