/**
 * WheelChair Editor - 欢迎文档
 * 用户首次打开编辑器时显示的默认文档
 */

export const WELCOME_DOCUMENT_TITLE = '🦽 欢迎使用 WheelChair 编辑器';

export const WELCOME_DOCUMENT_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: '🦽 欢迎使用 WheelChair 编辑器' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '这是一个' },
        { type: 'text', marks: [{ type: 'bold' }], text: '现代化' },
        { type: 'text', text: '的富文本编辑器，支持 ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'Markdown 即时转换' },
        { type: 'text', text: '、' },
        { type: 'text', marks: [{ type: 'italic' }], text: '数学公式' },
        { type: 'text', text: ' 和 ' },
        { type: 'text', marks: [{ type: 'italic' }], text: '多文档管理' },
        { type: 'text', text: '。' }
      ]
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '✨ 核心特色' }]
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: '1️⃣ Markdown 即时转换' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '无需记忆复杂的快捷键，像打字一样自然地写作。试试在下方输入以下字符后按' },
        { type: 'text', marks: [{ type: 'bold' }], text: '空格' },
        { type: 'text', text: '：' }
      ]
    },
    {
      type: 'codeBlock',
      attrs: { language: 'markdown' },
      content: [{ type: 'text', text: '## 二级标题\n- 无序列表项\n> 引用文字\n$E=mc^2$' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '输入后会立即转换为对应的格式！支持的语法包括：标题、列表、引用、代码块、公式等 20+ 种。' }
      ]
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: '2️⃣ 优雅的数学公式' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '内置 KaTeX 引擎，支持 LaTeX 语法。试试以下方式插入公式：' }
      ]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: '快捷键：按 ' },
                { type: 'code', content: [{ type: 'text', text: 'Ctrl+M' }] },
                { type: 'text', text: ' 插入行内公式，按 ' },
                { type: 'code', content: [{ type: 'text', text: 'Ctrl+Shift+M' }] },
                { type: 'text', text: ' 插入块级公式' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Markdown：输入 ' },
                { type: 'code', content: [{ type: 'text', text: '$公式$' }] },
                { type: 'text', text: ' 或 ' },
                { type: 'code', content: [{ type: 'text', text: '$$公式$$' }] },
                { type: 'text', text: ' 后按空格' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: '工具栏：点击工具栏上的 Σ 或 ∫ 按钮' }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '示例公式：' }
      ]
    },
    {
      type: 'codeBlock',
      attrs: { language: 'latex' },
      content: [{ type: 'text', text: 'E = mc^2\\\n\\sum_{i=1}^{n} x_i = \\frac{1}{n}\\sum_{i=1}^{n} x_i\\\n\\int_{a}^{b} f(x) dx = F(b) - F(a)' }]
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: '3️⃣ 双栏预览模式' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '点击工具栏的预览按钮，开启' },
        { type: 'text', marks: [{ type: 'bold' }], text: '左编辑右预览' },
        { type: 'text', text: ' 的双栏模式。实时查看 Markdown 渲染效果，支持拖拽调整分栏宽度。' }
      ]
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: '4️⃣ 极简的文档管理' }]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '自动保存' },
                { type: 'text', text: '：内容实时保存到浏览器本地，无需手动保存' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '快速搜索' },
                { type: 'text', text: '：在左侧边栏输入关键词，一键查找所有文档' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '多种导出' },
                { type: 'text', text: '：支持 Markdown、HTML、JSON、专有 .wc 格式' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '主题切换' },
                { type: 'text', text: '：点击顶部 🌙/☀️ 按钮切换亮色/暗色主题' }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '🎨 丰富的文本格式' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '支持多种文本格式和段落样式：' }
      ]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '文本格式' },
                { type: 'text', text: '：粗体、斜体、下划线、删除线、行内代码' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '段落样式' },
                { type: 'text', text: '：标题 1-6、引用块、代码块、水平分割线' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '列表' },
                { type: 'text', text: '：无序列表、有序列表、任务列表、嵌套列表' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '媒体' },
                { type: 'text', text: '：图片、链接、表格、视频嵌入' }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '⌨️ 常用快捷键' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '熟记这些快捷键，让写作更高效：' }
      ]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'code', content: [{ type: 'text', text: 'Ctrl+B' }] },
                { type: 'text', text: ' - 粗体' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'code', content: [{ type: 'text', text: 'Ctrl+I' }] },
                { type: 'text', text: ' - 斜体' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'code', content: [{ type: 'text', text: 'Ctrl+M' }] },
                { type: 'text', text: ' - 插入行内公式' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'code', content: [{ type: 'text', text: 'Ctrl+Shift+M' }] },
                { type: 'text', text: ' - 插入块级公式' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'code', content: [{ type: 'text', text: 'Ctrl+N' }] },
                { type: 'text', text: ' - 新建文档' }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'code', content: [{ type: 'text', text: 'Ctrl+Z' }] },
                { type: 'text', text: ' / ' },
                { type: 'code', content: [{ type: 'text', text: 'Ctrl+Y' }] },
                { type: 'text', text: ' - 撤销/重做' }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '⚠️ 重要提示' }]
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '数据安全提醒：' },
            { type: 'text', text: '所有文档保存在浏览器本地存储中。清除浏览器数据会导致文档丢失，请定期点击顶部的 💾 按钮导出 .wc 格式备份！' }
          ]
        }
      ]
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '📚 了解更多' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '查阅完整文档，掌握更多高级功能：' }
      ]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '📖 用户手册 - 详细功能介绍' }]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '📝 Markdown 指南 - 完整语法参考' }]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '∑ 数学公式指南 - LaTeX 完整教程' }]
            }
          ]
        }
      ]
    },
    {
      type: 'horizontalRule'
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'italic' }], text: '🎉 开始你的创作之旅吧！删除这个文档，创建属于你自己的第一篇作品。' }
      ]
    }
  ]
};

export default {
  title: WELCOME_DOCUMENT_TITLE,
  content: WELCOME_DOCUMENT_CONTENT
};
