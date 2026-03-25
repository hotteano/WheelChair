/**
 * Image 扩展使用示例
 */

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from './Image';
import { ImageUpload, ImageMenu, ImageBubbleMenu } from '../../components/ImageUpload';

// ============ 基本用法 ============

// 1. 基本配置
const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({
      // 允许拖拽上传
      allowDragUpload: true,
      // 允许粘贴上传
      allowPasteUpload: true,
      // 允许点击上传
      allowClickUpload: true,
      // 允许调整大小
      allowResize: true,
      // 允许对齐
      allowAlignment: true,
      // 允许标题
      allowCaption: true,
      // 内联模式
      inline: false,
    }),
  ],
});

// 2. 带上传配置
const editorWithUpload = useEditor({
  extensions: [
    StarterKit,
    Image.configure({
      uploadOptions: {
        // 接受的文件类型
        accept: 'image/*',
        // 最大文件大小：5MB
        maxSize: 5 * 1024 * 1024,
        // 上传处理函数
        onUpload: async (file: File) => {
          // 示例：上传到服务器
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          const data = await response.json();
          return data.url; // 返回图片 URL
        },
        // 错误处理
        onError: (error: Error) => {
          console.error('上传失败:', error);
          alert(error.message);
        },
      },
    }),
  ],
});

// ============ React 组件示例 ============

// 图片上传示例组件
export function ImageUploadExample() {
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        uploadOptions: {
          maxSize: 5 * 1024 * 1024, // 5MB
          onUpload: async (file) => {
            // 模拟上传
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(URL.createObjectURL(file));
              }, 1000);
            });
          },
        },
      }),
    ],
    content: '<p>点击按钮插入图片...</p>',
  });

  return (
    <div>
      {/* 工具栏 */}
      <div className="toolbar">
        <button onClick={() => setUploadModalVisible(true)}>
          📷 插入图片
        </button>
      </div>

      {/* 编辑器 */}
      <EditorContent editor={editor} />

      {/* 图片上传弹窗 */}
      {editor && (
        <ImageUpload
          editor={editor}
          visible={uploadModalVisible}
          onClose={() => setUploadModalVisible(false)}
          onConfirm={(urls, alignment, caption) => {
            urls.forEach((url) => {
              editor
                .chain()
                .focus()
                .setImage({
                  src: url,
                  alignment,
                  caption,
                })
                .run();
            });
          }}
          onUpload={async (file) => {
            // 实际上传逻辑
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            return data.url;
          }}
        />
      )}

      {/* 图片浮动菜单 */}
      {editor && <ImageMenu editor={editor} />}
      
      {/* 图片气泡菜单 */}
      {editor && <ImageBubbleMenu editor={editor} />}
    </div>
  );
}

// ============ 命令使用示例 ============

// 插入图片
editor?.commands.setImage({
  src: 'https://example.com/image.jpg',
  alt: '描述文本',
  title: '标题',
  width: 400,
  height: 300,
  alignment: 'center',
  caption: '图片说明',
});

// 更新图片属性
editor?.commands.updateImage({
  alt: '新的描述',
});

// 设置对齐
editor?.commands.setImageAlignment('left'); // 'left' | 'center' | 'right'

// 设置大小
editor?.commands.setImageSize(600, 400);

// 切换标题
editor?.commands.toggleImageCaption();

// 删除图片
editor?.commands.deleteImage();

// ============ 自定义渲染示例 ============

// 自定义图片节点渲染
Image.configure({
  HTMLAttributes: {
    class: 'my-custom-image',
  },
});

// 配合 NodeView 使用
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';

function CustomImageComponent(props: any) {
  const { node, updateAttributes, deleteNode } = props;
  const { src, alt, width, height } = node.attrs;

  return (
    <NodeViewWrapper className="custom-image-wrapper">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="custom-image"
      />
      <div className="image-toolbar">
        <button onClick={() => updateAttributes({ width: 200 })}>小</button>
        <button onClick={() => updateAttributes({ width: 400 })}>中</button>
        <button onClick={() => updateAttributes({ width: 600 })}>大</button>
        <button onClick={deleteNode}>删除</button>
      </div>
    </NodeViewWrapper>
  );
}

// 在扩展中使用
Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CustomImageComponent);
  },
});

// ============ 服务器上传示例 ============

// Node.js Express 示例
/*
// server.js
import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const app = express();
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  },
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有文件' });
  }
  
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

app.use('/uploads', express.static('uploads'));

app.listen(3000);
*/

// ============ 图片压缩示例 ============

import { compressImage } from '../../components/ImageUpload';

async function uploadWithCompression(file: File) {
  // 压缩图片
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
  });

  // 转换为 File 对象
  const compressedFile = new File([compressed], file.name, {
    type: compressed.type,
  });

  // 上传压缩后的文件
  const formData = new FormData();
  formData.append('file', compressedFile);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.url;
}

export default ImageUploadExample;
