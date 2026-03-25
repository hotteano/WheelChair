# WheelChair 基础示例

最简单的 WheelChair 编辑器配置，展示了核心功能的基本用法。

## 特点

- ✅ 零配置启动
- ✅ 基础格式工具栏
- ✅ 轻量级依赖

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 核心代码

```javascript
import { useWheelChairEditor } from '@wheelchair/core';

const editor = useWheelChairEditor({
  element: document.getElementById('editor'),
  content: '<p>Hello World!</p>',
  placeholder: '开始写作...',
});
```

## 文件结构

```
basic/
├── index.html      # 单文件示例
├── package.json    # 依赖配置
└── README.md       # 说明文档
```
