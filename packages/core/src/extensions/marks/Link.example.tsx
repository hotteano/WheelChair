/**
 * Link 扩展使用示例
 */

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link, isValidUrl, normalizeUrl } from './Link';
import { LinkMenu, LinkPreview, useLinkPreview } from '../../components/LinkMenu';

// ============ 基本用法 ============

const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({
      // 自动检测链接
      autolink: true,
      // 支持的协议
      protocols: ['http', 'https', 'ftp', 'mailto'],
      // 点击打开链接
      openOnClick: true,
      // HTML 属性
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
        class: 'custom-link',
      },
    }),
  ],
});

// ============ 命令使用示例 ============

// 设置链接
editor?.commands.setLink({
  href: 'https://example.com',
  target: '_blank',
  rel: 'noopener noreferrer',
  title: '链接标题',
});

// 切换链接（有则取消，无则设置）
editor?.commands.toggleLink({
  href: 'https://example.com',
});

// 取消链接
editor?.commands.unsetLink();

// 打开链接
editor?.commands.openLink();

// ============ 快捷键 ============

/*
- Ctrl+K: 打开链接编辑弹窗 / 取消链接
- Ctrl+Shift+K: 打开当前链接
*/

// ============ React 组件示例 ============

export function LinkEditorExample() {
  const [linkMenuVisible, setLinkMenuVisible] = useState(false);
  const [defaultHref, setDefaultHref] = useState('');
  const [defaultText, setDefaultText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        autolink: true,
        openOnClick: true,
      }),
    ],
    content: '<p>选中文字并 <a href="https://example.com">点击这里</a> 测试链接</p>',
  });

  // 监听链接菜单事件
  useEffect(() => {
    const handleShowLinkMenu = (event: CustomEvent) => {
      const { editor: eventEditor, from, to } = event.detail;
      
      // 获取选中文本
      const selectedText = eventEditor.state.doc.textBetween(from, to);
      setDefaultText(selectedText);
      
      // 检查是否已有链接
      const hasLink = eventEditor.isActive('link');
      if (hasLink) {
        const attrs = eventEditor.getAttributes('link');
        setDefaultHref(attrs.href);
      } else {
        setDefaultHref('');
      }
      
      setLinkMenuVisible(true);
    };

    document.addEventListener('wheelchair:showLinkMenu', handleShowLinkMenu as EventListener);
    
    return () => {
      document.removeEventListener('wheelchair:showLinkMenu', handleShowLinkMenu as EventListener);
    };
  }, []);

  return (
    <div>
      {/* 工具栏 */}
      <div className="toolbar">
        <button
          onClick={() => setLinkMenuVisible(true)}
          className={editor?.isActive('link') ? 'active' : ''}
        >
          🔗 链接
        </button>
        <button
          onClick={() => editor?.chain().focus().unsetLink().run()}
          disabled={!editor?.isActive('link')}
        >
          取消链接
        </button>
      </div>

      {/* 编辑器 */}
      <EditorContent editor={editor} />

      {/* 链接编辑弹窗 */}
      {editor && (
        <LinkMenu
          editor={editor}
          visible={linkMenuVisible}
          defaultHref={defaultHref}
          defaultText={defaultText}
          onClose={() => setLinkMenuVisible(false)}
        />
      )}
    </div>
  );
}

// ============ 链接预览示例 ============

export function LinkPreviewExample() {
  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: '<p>Hover over <a href="https://github.com">this link</a> to see preview</p>',
  });

  const { handleLinkEnter, handleLinkLeave, PreviewComponent } = useLinkPreview({
    // 可选：自定义获取预览数据的函数
    fetchPreviewData: async (url: string) => {
      // 调用链接预览 API
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      return response.json();
    },
    delay: 500, // 延迟显示
  });

  // 监听链接悬停事件
  useEffect(() => {
    if (!editor) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href) {
          handleLinkEnter(href, target.getBoundingClientRect());
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        handleLinkLeave();
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('mouseover', handleMouseOver);
    editorElement.addEventListener('mouseout', handleMouseOut);

    return () => {
      editorElement.removeEventListener('mouseover', handleMouseOver);
      editorElement.removeEventListener('mouseout', handleMouseOut);
    };
  }, [editor, handleLinkEnter, handleLinkLeave]);

  return (
    <div>
      <EditorContent editor={editor} />
      {PreviewComponent}
    </div>
  );
}

// ============ 链接预览 API 示例 ============

/*
// Node.js Express 示例
import express from 'express';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

const app = express();

app.get('/api/link-preview', async (req, res) => {
  const { url } = req.query;
  
  if (!url || !isValidUrl(url as string)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(url as string, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);

    const preview: LinkPreviewData = {
      title: $('meta[property="og:title"]').attr('content') || 
             $('title').text() ||
             '',
      description: $('meta[property="og:description"]').attr('content') || 
                   $('meta[name="description"]').attr('content') ||
                   '',
      image: $('meta[property="og:image"]').attr('content') || 
             $('meta[property="twitter:image"]').attr('content') ||
             '',
      url: url as string,
      domain: getDomainFromUrl(url as string),
    };

    res.json(preview);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch preview',
      url,
      domain: getDomainFromUrl(url as string),
    });
  }
});

app.listen(3000);
*/

// ============ 验证和规范化工具 ============

// 验证 URL
console.log(isValidUrl('https://example.com')); // true
console.log(isValidUrl('example.com')); // true (自动添加 https://)
console.log(isValidUrl('not a url')); // false

// 规范化 URL
console.log(normalizeUrl('example.com')); // https://example.com
console.log(normalizeUrl('www.example.com')); // https://www.example.com
console.log(normalizeUrl('https://example.com')); // https://example.com

export default LinkEditorExample;
