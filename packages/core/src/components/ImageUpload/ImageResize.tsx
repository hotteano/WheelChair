import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import './ImageResize.css';

export interface ImageResizeProps {
  /** 编辑器实例 */
  editor: Editor;
  /** 节点位置 */
  nodePos: number;
  /** 当前宽度 */
  width?: number;
  /** 当前高度 */
  height?: number;
  /** 是否可见 */
  visible?: boolean;
  /** 是否保持比例 */
  preserveAspectRatio?: boolean;
  /** 最小宽度 */
  minWidth?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 缩放完成回调 */
  onResizeEnd?: (width: number, height: number) => void;
}

export const ImageResize: React.FC<ImageResizeProps> = ({
  editor,
  nodePos,
  width: initialWidth = 300,
  height: initialHeight,
  visible = true,
  preserveAspectRatio = true,
  minWidth = 50,
  maxWidth = 2000,
  onResizeEnd,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [currentSize, setCurrentSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: initialWidth, height: initialHeight });
  const aspectRatioRef = useRef<number | null>(
    initialWidth && initialHeight ? initialWidth / initialHeight : null
  );
  const imageRef = useRef<HTMLImageElement | null>(null);

  // 获取图片元素
  useEffect(() => {
    if (!editor || nodePos === undefined) return;

    const element = editor.view.nodeDOM(nodePos) as HTMLElement;
    if (element) {
      const img = element.tagName === 'IMG' 
        ? element as HTMLImageElement
        : element.querySelector('img');
      if (img) {
        imageRef.current = img;
        // 获取实际尺寸
        const rect = img.getBoundingClientRect();
        setCurrentSize({
          width: rect.width,
          height: rect.height,
        });
        if (rect.width && rect.height) {
          aspectRatioRef.current = rect.width / rect.height;
        }
      }
    }
  }, [editor, nodePos]);

  // 更新尺寸状态
  useEffect(() => {
    setCurrentSize({
      width: initialWidth,
      height: initialHeight,
    });
    if (initialWidth && initialHeight) {
      aspectRatioRef.current = initialWidth / initialHeight;
    }
  }, [initialWidth, initialHeight]);

  // 处理缩放开始
  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      startPosRef.current = { x: clientX, y: clientY };
      startSizeRef.current = { ...currentSize };
      setIsResizing(true);

      // 添加全局事件监听
      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        const moveX = 'touches' in moveEvent 
          ? moveEvent.touches[0].clientX 
          : (moveEvent as MouseEvent).clientX;
        const moveY = 'touches' in moveEvent 
          ? moveEvent.touches[0].clientY 
          : (moveEvent as MouseEvent).clientY;

        const deltaX = moveX - startPosRef.current.x;
        const deltaY = moveY - startPosRef.current.y;

        let newWidth = startSizeRef.current.width;
        let newHeight = startSizeRef.current.height;

        // 根据方向计算新尺寸
        switch (direction) {
          case 'se': // 右下角
          case 'e': // 右边
            newWidth = Math.max(minWidth, Math.min(maxWidth, startSizeRef.current.width + deltaX));
            if (preserveAspectRatio && aspectRatioRef.current) {
              newHeight = newWidth / aspectRatioRef.current;
            }
            break;
          case 's': // 下边
            newHeight = Math.max(0, startSizeRef.current.height + deltaY);
            if (preserveAspectRatio && aspectRatioRef.current) {
              newWidth = newHeight * aspectRatioRef.current;
            }
            break;
          case 'sw': // 左下角
            newWidth = Math.max(minWidth, Math.min(maxWidth, startSizeRef.current.width - deltaX));
            if (preserveAspectRatio && aspectRatioRef.current) {
              newHeight = newWidth / aspectRatioRef.current;
            }
            break;
          case 'ne': // 右上角
            newWidth = Math.max(minWidth, Math.min(maxWidth, startSizeRef.current.width + deltaX));
            newHeight = Math.max(0, startSizeRef.current.height - deltaY);
            if (preserveAspectRatio && aspectRatioRef.current) {
              newHeight = newWidth / aspectRatioRef.current;
            }
            break;
          case 'nw': // 左上角
            newWidth = Math.max(minWidth, Math.min(maxWidth, startSizeRef.current.width - deltaX));
            newHeight = Math.max(0, startSizeRef.current.height - deltaY);
            if (preserveAspectRatio && aspectRatioRef.current) {
              newHeight = newWidth / aspectRatioRef.current;
            }
            break;
        }

        setCurrentSize({ width: newWidth, height: newHeight });

        // 实时更新编辑器中的图片尺寸
        editor
          .chain()
          .focus()
          .setNodeSelection(nodePos)
          .updateAttributes('image', { width: newWidth, height: newHeight })
          .run();
      };

      const handleUp = () => {
        setIsResizing(false);
        onResizeEnd?.(currentSize.width, currentSize.height);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleUp);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleUp);
    },
    [currentSize, editor, nodePos, minWidth, maxWidth, preserveAspectRatio, onResizeEnd]
  );

  // 设置预设尺寸
  const setPresetSize = useCallback(
    (preset: 'small' | 'medium' | 'large' | 'original') => {
      let newWidth = currentSize.width;
      let newHeight = currentSize.height;

      const containerWidth = editor.view.dom.clientWidth || 800;

      switch (preset) {
        case 'small':
          newWidth = 200;
          break;
        case 'medium':
          newWidth = Math.min(400, containerWidth * 0.5);
          break;
        case 'large':
          newWidth = Math.min(800, containerWidth * 0.9);
          break;
        case 'original':
          // 恢复原始尺寸
          if (imageRef.current?.naturalWidth) {
            newWidth = imageRef.current.naturalWidth;
          }
          break;
      }

      if (preserveAspectRatio && aspectRatioRef.current) {
        newHeight = newWidth / aspectRatioRef.current;
      }

      setCurrentSize({ width: newWidth, height: newHeight });

      editor
        .chain()
        .focus()
        .setNodeSelection(nodePos)
        .updateAttributes('image', { width: newWidth, height: newHeight })
        .run();

      onResizeEnd?.(newWidth, newHeight);
    },
    [currentSize, editor, nodePos, preserveAspectRatio, onResizeEnd]
  );

  if (!visible) return null;

  return (
    <div className={`wheelchair-image-resize ${isResizing ? 'resizing' : ''}`}>
      {/* 尺寸显示 */}
      <div className="resize-info">
        {Math.round(currentSize.width)} × {Math.round(currentSize.height || 0)} px
      </div>

      {/* 预设尺寸按钮 */}
      <div className="resize-presets">
        <button onClick={() => setPresetSize('small')} title="小">
          小
        </button>
        <button onClick={() => setPresetSize('medium')} title="中">
          中
        </button>
        <button onClick={() => setPresetSize('large')} title="大">
          大
        </button>
        <button onClick={() => setPresetSize('original')} title="原始尺寸">
          原图
        </button>
      </div>

      {/* 缩放手柄 */}
      <div
        className="resize-handle resize-handle-nw"
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
        onTouchStart={(e) => handleResizeStart(e, 'nw')}
      />
      <div
        className="resize-handle resize-handle-ne"
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
        onTouchStart={(e) => handleResizeStart(e, 'ne')}
      />
      <div
        className="resize-handle resize-handle-sw"
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
        onTouchStart={(e) => handleResizeStart(e, 'sw')}
      />
      <div
        className="resize-handle resize-handle-se"
        onMouseDown={(e) => handleResizeStart(e, 'se')}
        onTouchStart={(e) => handleResizeStart(e, 'se')}
      />
      <div
        className="resize-handle resize-handle-e"
        onMouseDown={(e) => handleResizeStart(e, 'e')}
        onTouchStart={(e) => handleResizeStart(e, 'e')}
      />
      <div
        className="resize-handle resize-handle-s"
        onMouseDown={(e) => handleResizeStart(e, 's')}
        onTouchStart={(e) => handleResizeStart(e, 's')}
      />
    </div>
  );
};

// 图片尺寸控制器 Hook
export interface UseImageResizeOptions {
  editor: Editor;
  enabled?: boolean;
}

export function useImageResize({ editor, enabled = true }: UseImageResizeOptions) {
  const [activeNode, setActiveNode] = useState<{
    pos: number;
    width?: number;
    height?: number;
  } | null>(null);

  useEffect(() => {
    if (!enabled || !editor) return;

    const handleSelectionUpdate = () => {
      const { selection } = editor.state;
      
      if (selection.empty) {
        setActiveNode(null);
        return;
      }

      // 检查是否选中了图片节点
      const node = editor.state.doc.nodeAt(selection.from);
      if (node && node.type.name === 'image') {
        setActiveNode({
          pos: selection.from,
          width: node.attrs.width,
          height: node.attrs.height,
        });
      } else {
        setActiveNode(null);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, enabled]);

  return {
    activeNode,
    ResizeComponent: activeNode ? (
      <ImageResize
        editor={editor}
        nodePos={activeNode.pos}
        width={activeNode.width}
        height={activeNode.height}
        visible={true}
      />
    ) : null,
  };
}

export default ImageResize;
