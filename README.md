# 🦽 WheelChair Editor

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.1-blue.svg" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="license">
  <img src="https://img.shields.io/badge/TypeScript-100%25-blue.svg" alt="typescript">
</p>

<p align="center">
  <b>现代化、可扩展的富文本编辑器</b>
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> •
  <a href="#功能特性">功能特性</a> •
  <a href="#文档">文档</a> •
  <a href="#示例">示例</a> •
  <a href="#贡献">贡献</a>
</p>

---

## 📖 简介

**WheelChair** 是一个基于现代 Web 技术构建的富文本编辑器，专为开发者设计。它提供了简洁的 API、丰富的扩展系统和出色的用户体验。

> 🎉 [**新用户？查看欢迎文档 →**](./WELCOME.md)

### 为什么选择 WheelChair？

- 🚀 **高性能** - 基于 ProseMirror，渲染流畅
- 🔌 **可扩展** - 插件化架构，轻松添加功能
- 🎨 **可定制** - 完全控制外观和行为
- 📱 **响应式** - 完美适配各种设备
- 🔒 **类型安全** - 100% TypeScript 支持

## ✨ 功能特性

### 核心功能
- ✅ 所见即所得的编辑体验
- ✅ Markdown 支持
- ✅ 撤销/重做
- ✅ 复制/粘贴（支持从 Word、Google Docs 等）
- ✅ 拖拽上传
- ✅ 占位符提示

### 文本格式
- ✅ 粗体、斜体、下划线、删除线
- ✅ 上标、下标
- ✅ 文字颜色、背景色
- ✅ 字体大小
- ✅ 行内代码
- ✅ **数学公式**（LaTeX 支持）

### 段落样式
- ✅ 标题 (H1-H6)
- ✅ 段落对齐
- ✅ 引用块
- ✅ 代码块（语法高亮）
- ✅ 水平分隔线

### 列表
- ✅ 无序列表
- ✅ 有序列表
- ✅ 任务列表（待办事项）
- ✅ 列表嵌套

### 媒体与嵌入
- ✅ 图片（支持上传和 URL）
- ✅ 视频嵌入
- ✅ 链接
- ✅ 表格
- ✅ iframe 嵌入

### Markdown 支持
- ✅ 实时输入转换（`## ` → H2, `- ` → 列表）
- ✅ Markdown 导入/导出
- ✅ 双栏预览模式

### 高级功能
- ✅ 搜索和替换
- ✅ 字数统计
- ✅ 拼写检查
- ✅ 协作编辑（可选）
- ✅ 版本历史（可选）

## 🚀 快速开始

### 安装

```bash
# npm
npm install @wheelchair/core @wheelchair/react

# yarn
yarn add @wheelchair/core @wheelchair/react

# pnpm
pnpm add @wheelchair/core @wheelchair/react
```

### 基础使用

```tsx
import { WheelChairEditor, useWheelChairEditor } from '@wheelchair/core';
import '@wheelchair/core/styles';

function App() {
  const editor = useWheelChairEditor({
    content: '<p>Hello WheelChair!</p>',
    placeholder: '开始写作...',
  });

  return (
    <div className="editor-wrapper">
      <WheelChairEditor editor={editor} />
    </div>
  );
}
```

### 带工具栏的编辑器

```tsx
import { 
  WheelChairEditor, 
  useWheelChairEditor,
  EditorToolbar,
  EditorStatusBar 
} from '@wheelchair/core';

function App() {
  const editor = useWheelChairEditor({
    content: '<p>带工具栏的编辑器</p>',
  });

  return (
    <div className="editor-container">
      <EditorToolbar editor={editor} />
      <WheelChairEditor editor={editor} />
      <EditorStatusBar editor={editor} />
    </div>
  );
}
```

## 📦 包介绍

| 包名 | 描述 | 版本 |
|------|------|------|
| `@wheelchair/core` | 核心编辑器功能 | ![npm](https://img.shields.io/npm/v/@wheelchair/core) |
| `@wheelchair/react` | React 组件集成 | ![npm](https://img.shields.io/npm/v/@wheelchair/react) |
| `@wheelchair/vue` | Vue 组件集成 | ![npm](https://img.shields.io/npm/v/@wheelchair/vue) |
| `@wheelchair/extensions` | 官方扩展集合 | ![npm](https://img.shields.io/npm/v/@wheelchair/extensions) |

## 📚 文档

### 📖 用户手册
- [**用户手册**](./docs/MANUAL.md) - 完整的功能使用指南（推荐新用户阅读）

### 入门指南
- [安装指南](./docs/installation.md)
- [基础概念](./docs/concepts.md)
- [配置选项](./docs/configuration.md)

### 功能指南
- [📖 完整用户手册](./docs/MANUAL.md) - 所有功能的详细说明
- [⚡ 快速入门](./docs/QUICKSTART.md) - 5 分钟上手教程
- [📝 Markdown 指南](./docs/MARKDOWN.md) - Markdown 语法参考
- [∑ 数学公式指南](./docs/MATH.md) - LaTeX 公式完整教程
- [⌨️ 快捷键参考](./docs/SHORTCUTS.md) - 所有快捷键列表

### API 参考
- [Core API](./packages/core/README.md)

### 扩展开发
- [创建节点](./docs/extensions/nodes.md)
- [创建标记](./docs/extensions/marks.md)
- [创建扩展](./docs/extensions/extensions.md)

## 🎨 示例

### [演示应用](./apps/demo/)
功能完整的演示应用，包含所有最新功能。

```bash
cd apps/demo
pnpm install
pnpm dev
```

### 快速体验功能

**Markdown 输入**
```
输入 ## 标题    →  自动转为 H2 标题
输入 - 列表    →  自动转为无序列表
输入 $E=mc^2$  →  自动转为数学公式
```

**数学公式**
- 行内公式：`$E = mc^2$`
- 块级公式：`$$\sum_{i=1}^{n} x_i$$`
- 快捷键：`Ctrl+M`（行内）、`Ctrl+Shift+M`（块级）

### [演示应用](./apps/demo/)
功能完整的演示应用。

```bash
cd apps/demo
npm install
npm run dev
```

## 🏗️ 项目结构

```
WheelChair/
├── apps/
│   └── demo/              # 演示应用
├── examples/
│   ├── basic/             # 基础示例
│   ├── full-featured/     # 全功能示例
│   └── custom-extension/  # 自定义扩展示例
├── packages/
│   ├── core/              # 核心包
│   ├── react/             # React 集成
│   ├── vue/               # Vue 集成
│   └── extensions/        # 官方扩展
├── docs/                  # 文档
└── scripts/               # 构建脚本
```

## 🛠️ 开发

### 环境要求
- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
# 启动演示应用
pnpm dev

# 启动所有示例
pnpm dev:examples

# 启动特定包
pnpm --filter @wheelchair/core dev
```

### 构建

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm --filter @wheelchair/core build
```

### 测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test:unit

# 运行 E2E 测试
pnpm test:e2e

# 运行特定包测试
pnpm --filter @wheelchair/core test
```

## 🤝 贡献

我们欢迎所有形式的贡献！

### 贡献指南

1. **Fork** 本仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. **提交** 你的更改 (`git commit -m 'Add some amazing feature'`)
4. **推送** 到分支 (`git push origin feature/amazing-feature`)
5. 创建 **Pull Request**

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 为新功能编写测试
- 更新相关文档

### 提交信息规范

```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

[MIT](./LICENSE) © 2026 WheelChair Team

## 🙏 致谢

- [ProseMirror](https://prosemirror.net/) - 强大的富文本编辑框架
- [Tiptap](https://tiptap.dev/) - 无头富文本编辑器
- [所有贡献者](./CONTRIBUTORS.md)

---

<p align="center">
  如果这个项目对你有帮助，请给它一个 ⭐️
</p>
