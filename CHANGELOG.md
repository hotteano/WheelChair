# Changelog

所有显著变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

### Added
- 新增协作编辑支持（实验性）
- 新增评论/批注功能
- 新增文档比较功能

### Changed
- 优化大文档渲染性能
- 改进移动端触摸体验

### Fixed
- 修复粘贴时的格式丢失问题

---

## [1.0.0] - 2026-03-25

### 🎉 正式发布

WheelChair 编辑器 v1.0.0 正式发布！

### Added

#### 核心功能
- ✅ 完整的富文本编辑能力
- ✅ 基于 ProseMirror 的可靠架构
- ✅ 100% TypeScript 支持
- ✅ 模块化的扩展系统
- ✅ 响应式设计支持

#### 文本格式
- ✅ 粗体、斜体、下划线、删除线
- ✅ 上标、下标
- ✅ 文字颜色和背景色
- ✅ 字体大小调整
- ✅ 行内代码

#### 段落样式
- ✅ 标题 (H1-H6)
- ✅ 段落对齐（左、中、右、两端对齐）
- ✅ 引用块
- ✅ 代码块（支持语法高亮）
- ✅ 水平分隔线

#### 列表
- ✅ 无序列表
- ✅ 有序列表
- ✅ 任务列表（待办事项）
- ✅ 列表嵌套支持

#### 媒体与嵌入
- ✅ 图片上传和 URL 嵌入
- ✅ 视频嵌入（YouTube、Vimeo 等）
- ✅ 链接（自动检测和手动添加）
- ✅ 表格（支持合并单元格）
- ✅ iframe 嵌入

#### 高级功能
- ✅ 撤销/重做（完整历史栈）
- ✅ 搜索和替换
- ✅ 字数、字符数统计
- ✅ 阅读时间估算
- ✅ 拼写检查集成
- ✅ 占位符文本
- ✅ 自动保存支持

#### UI 组件
- ✅ EditorToolbar - 可配置工具栏
- ✅ EditorStatusBar - 状态栏组件
- ✅ ThemeToggle - 主题切换
- ✅ ExportButton - 导出按钮
- ✅ ImportButton - 导入按钮

#### 框架集成
- ✅ React 组件和 Hooks
- ✅ Vue 组件和 Composables
- ✅ 原生 JavaScript API

#### 示例和演示
- ✅ 基础使用示例
- ✅ 全功能示例
- ✅ 自定义扩展示例
- ✅ 完整的演示应用

#### 文档
- ✅ 完整的 API 文档
- ✅ 快速开始指南
- ✅ 扩展开发指南
- ✅ 配置参考

### Security
- 实现 XSS 防护
- 安全的 HTML 净化
- 可靠的链接校验

---

## [0.9.0] - 2026-03-15

### Added
- Beta 版本发布
- 所有核心扩展完成
- React 和 Vue 集成
- 完整的测试覆盖

### Changed
- 重构扩展系统架构
- 优化内存使用

---

## [0.8.0] - 2026-03-01

### Added
- 表格扩展
- 图片拖拽上传
- Markdown 导入/导出

### Fixed
- 修复 Android 键盘兼容性问题
- 修复 IME 输入法问题

---

## [0.7.0] - 2026-02-15

### Added
- 任务列表扩展
- 代码块语法高亮
- 链接自动检测

### Changed
- 改进粘贴处理逻辑
- 优化大量内容的性能

---

## [0.6.0] - 2026-02-01

### Added
- 历史扩展（撤销/重做）
- 占位符扩展
- 浮动菜单支持

### Fixed
- 修复选中状态下的样式问题

---

## [0.5.0] - 2026-01-15

### Added
- 基础文本格式扩展
- 标题扩展
- 列表扩展

### Changed
- 更新 ProseMirror 依赖版本

---

## [0.4.0] - 2026-01-01

### Added
- 核心编辑器架构
- 扩展系统基础
- TypeScript 类型定义

---

## [0.3.0] - 2025-12-15

### Added
- 项目初始化
- 基础包结构
- 开发环境搭建

---

## [0.2.0] - 2025-12-01

### Added
- 设计文档
- API 规范
- 架构设计

---

## [0.1.0] - 2025-11-15

### Added
- 项目构想
- 需求分析
- 技术选型

---

## 版本说明

### 版本号格式

`MAJOR.MINOR.PATCH`

- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的功能添加
- **PATCH**: 向后兼容的问题修复

### 预发布版本

- `alpha`: 内部测试版本
- `beta`: 公开测试版本
- `rc`: 发布候选版本

---

## 迁移指南

### 从 v0.x 升级到 v1.0

```typescript
// v0.x
import { Editor } from '@wheelchair/core';

const editor = new Editor({
  element: document.querySelector('.editor'),
  extensions: [...],
});

// v1.0
import { useWheelChairEditor } from '@wheelchair/core';

const editor = useWheelChairEditor({
  element: document.querySelector('.editor'),
  extensions: [...],
});
```

### 扩展 API 变更

```typescript
// v0.x
const MyExtension = Extension.create({
  addProseMirrorPlugins() {
    return [myPlugin];
  },
});

// v1.0（无变更，完全兼容）
const MyExtension = Extension.create({
  addProseMirrorPlugins() {
    return [myPlugin];
  },
});
```

---

## 贡献指南

想要贡献变更日志？请遵循以下格式：

```markdown
### Added
- 新功能描述 (#PR编号)

### Changed
- 变更描述 (#PR编号)

### Deprecated
- 即将移除的功能 (#PR编号)

### Removed
- 已移除的功能 (#PR编号)

### Fixed
- 修复描述 (#PR编号)

### Security
- 安全修复描述 (#PR编号)
```

---

## 参考链接

- [完整文档](./docs/)
- [迁移指南](./docs/migration.md)
- [API 参考](./packages/core/README.md)
- [GitHub Releases](https://github.com/wheelchair/editor/releases)
