# WheelChair 全功能示例

展示了 WheelChair 编辑器的所有功能和扩展。

## 功能清单

### 文本格式
- ✅ 粗体、斜体、下划线、删除线
- ✅ 行内代码
- ✅ 文字颜色和背景色
- ✅ 上标、下标

### 段落样式
- ✅ 标题 (H1-H6)
- ✅ 段落
- ✅ 引用块
- ✅ 代码块（支持语法高亮）

### 列表
- ✅ 无序列表
- ✅ 有序列表
- ✅ 任务列表（待办事项）

### 插入元素
- ✅ 水平分隔线
- ✅ 硬换行
- ✅ 图片
- ✅ 表格
- ✅ 链接

### 高级功能
- ✅ 实时统计（字符、单词、段落、阅读时间）
- ✅ 多种导出格式（HTML、JSON、Markdown）
- ✅ 实时预览
- ✅ 当前样式显示

## 快速开始

```bash
npm install
npm run dev
```

## 扩展配置

```javascript
const editor = useWheelChairEditor({
  extensions: ['all'], // 启用所有扩展
  // 或单独配置
  extensions: [
    'bold', 'italic', 'underline', 'strike',
    'heading', 'paragraph', 'blockquote',
    'bulletList', 'orderedList', 'taskList',
    'code', 'codeBlock',
    'link', 'image', 'table',
    'horizontalRule', 'hardBreak',
    'color', 'highlight',
    'placeholder', 'history',
  ],
});
```
