/**
 * Video 扩展使用示例
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Video, parseVideoUrl } from './Video';

// ============ 基本用法 ============

const editor = useEditor({
  extensions: [
    StarterKit,
    Video.configure({
      // 允许本地上传
      allowUpload: true,
      // 允许嵌入
      allowEmbed: true,
      // 支持的嵌入平台
      embedPlatforms: ['youtube', 'bilibili', 'vimeo'],
      // 默认播放器控制
      controls: true,
      // 默认自动播放
      autoplay: false,
      // 默认循环播放
      loop: false,
      // 默认静音
      muted: false,
    }),
  ],
});

// ============ 命令使用示例 ============

// 插入本地视频
editor?.commands.setVideo({
  src: '/videos/demo.mp4',
  type: 'local',
  poster: '/videos/demo-poster.jpg',
  width: 640,
  height: 360,
  controls: true,
});

// 插入 YouTube 视频
editor?.commands.setYoutubeVideo('dQw4w9WgXcQ', {
  width: 640,
  height: 360,
});

// 插入 Bilibili 视频
editor?.commands.setBilibiliVideo('BV1GJ411x7h7', {
  width: 640,
  height: 360,
});

// 从 URL 自动识别插入
function insertVideoFromUrl(url: string) {
  const parsed = parseVideoUrl(url);
  
  if (!parsed) {
    // 普通视频链接
    editor?.commands.setVideo({
      src: url,
      type: 'url',
    });
    return;
  }

  // 平台视频
  switch (parsed.type) {
    case 'youtube':
      editor?.commands.setYoutubeVideo(parsed.id);
      break;
    case 'bilibili':
      editor?.commands.setBilibiliVideo(parsed.id);
      break;
    default:
      editor?.commands.setVideo({
        src: url,
        type: parsed.type,
      });
  }
}

// 使用示例
insertVideoFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
insertVideoFromUrl('https://www.bilibili.com/video/BV1GJ411x7h7');
insertVideoFromUrl('https://example.com/video.mp4');

// ============ React 组件示例 ============

import React, { useState } from 'react';

export function VideoUploadExample() {
  const [videoUrl, setVideoUrl] = useState('');
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Video.configure({
        uploadOptions: {
          maxSize: 100 * 1024 * 1024, // 100MB
          onUpload: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload/video', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            return data.url;
          },
        },
      }),
    ],
    content: '<p>插入视频...</p>',
  });

  const handleInsert = () => {
    if (!videoUrl) return;
    insertVideoFromUrl(videoUrl);
    setVideoUrl('');
  };

  return (
    <div>
      <div className="video-toolbar">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="输入视频链接或 YouTube/Bilibili 链接"
        />
        <button onClick={handleInsert}>插入视频</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

// ============ 支持的视频格式 ============

/*
本地视频格式:
- MP4 (video/mp4)
- WebM (video/webm)
- OGG (video/ogg)
- MOV (video/quicktime)

嵌入平台支持:
- YouTube: https://www.youtube.com/watch?v={videoId}
- Bilibili: https://www.bilibili.com/video/{bvid}
- Vimeo: https://vimeo.com/{videoId}
- Youku: https://v.youku.com/v_show/id_{videoId}
*/

export default VideoUploadExample;
