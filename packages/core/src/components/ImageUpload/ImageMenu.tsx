import React, { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import type { ImageAlignment } from '../../types/upload';
import { ImageResize } from './ImageResize';
import './ImageMenu.css';

export interface ImageMenuProps {
  /** 编辑器实例 */
  editor: Editor;
  /** 是否可见 */
  visible?: boolean;
}

export interface ImageMenuItem {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

export const ImageMenu: React.FC<ImageMenuProps> = ({ editor, visible = true }) => {
  const [activeNode, setActiveNode] = useState<{
    pos: number;
    attrs: Record<string, any>;
  } | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showResize, setShowResize] = useState(false);
  const [showAlignment, setShowAlignment] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 监听选区变化
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);

      if (node && node.type.name === 'image') {
        // 获取图片元素位置
        const element = editor.view.nodeDOM(selection.from) as HTMLElement;
        if (element) {
          const rect = element.getBoundingClientRect();
          const editorRect = editor.view.dom.getBoundingClientRect();
          
          setActiveNode({
            pos: selection.from,
            attrs: node.attrs,
          });
          
          // 计算菜单位置（图片上方居中）
          setMenuPosition({
            top: rect.top - editorRect.top - 45,
            left: rect.left - editorRect.left + rect.width / 2,
          });
        }
      } else {
        setActiveNode(null);
        setShowResize(false);
        setShowAlignment(false);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // 不在这里关闭，让 selectionUpdate 处理
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!visible || !activeNode) return null;

  const { attrs } = activeNode;
  const currentAlignment = attrs.alignment || 'center';
  const hasCaption = !!attrs.caption;

  // 菜单项
  const menuItems: ImageMenuItem[] = [
    {
      icon: '↔️',
      label: '调整大小',
      onClick: () => setShowResize(!showResize),
      isActive: showResize,
    },
    {
      icon: '⚖️',
      label: '对齐方式',
      onClick: () => setShowAlignment(!showAlignment),
      isActive: showAlignment,
    },
    {
      icon: '📝',
      label: hasCaption ? '删除标题' : '添加标题',
      onClick: () => {
        editor
          .chain()
          .focus()
          .setNodeSelection(activeNode.pos)
          .toggleImageCaption()
          .run();
      },
    },
    {
      icon: '📋',
      label: '复制',
      shortcut: 'Ctrl+C',
      onClick: () => {
        // 复制图片 URL
        navigator.clipboard.writeText(attrs.src);
      },
    },
    {
      icon: '🗑️',
      label: '删除',
      shortcut: 'Delete',
      onClick: () => {
        editor
          .chain()
          .focus()
          .setNodeSelection(activeNode.pos)
          .deleteImage()
          .run();
      },
    },
  ];

  // 对齐选项
  const alignmentOptions: { value: ImageAlignment; icon: string; label: string }[] = [
    { value: 'left', icon: '⬅️', label: '左对齐' },
    { value: 'center', icon: '⬆️', label: '居中' },
    { value: 'right', icon: '➡️', label: '右对齐' },
  ];

  // 处理对齐
  const handleAlignment = (alignment: ImageAlignment) => {
    editor
      .chain()
      .focus()
      .setNodeSelection(activeNode.pos)
      .setImageAlignment(alignment)
      .run();
    setShowAlignment(false);
  };

  // 处理属性更新
  const handleUpdateAttr = (key: string, value: any) => {
    editor
      .chain()
      .focus()
      .setNodeSelection(activeNode.pos)
      .updateAttributes('image', { [key]: value })
      .run();
  };

  return (
    <>
      {/* 浮动菜单 */}
      <div
        ref={menuRef}
        className="wheelchair-image-menu"
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
          transform: 'translateX(-50%)',
        }}
      >
        {/* 主菜单 */}
        <div className="image-menu-main">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`menu-item ${item.isActive ? 'active' : ''} ${
                item.disabled ? 'disabled' : ''
              }`}
              onClick={item.onClick}
              disabled={item.disabled}
              title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
            </button>
          ))}
        </div>

        {/* 对齐子菜单 */}
        {showAlignment && (
          <div className="image-submenu alignment-submenu">
            {alignmentOptions.map((option) => (
              <button
                key={option.value}
                className={currentAlignment === option.value ? 'active' : ''}
                onClick={() => handleAlignment(option.value)}
                title={option.label}
              >
                <span>{option.icon}</span>
              </button>
            ))}
          </div>
        )}

        {/* 属性编辑 */}
        <div className="image-submenu attr-submenu">
          <div className="attr-row">
            <label>替代文本:</label>
            <input
              type="text"
              value={attrs.alt || ''}
              onChange={(e) => handleUpdateAttr('alt', e.target.value)}
              placeholder="图片描述"
            />
          </div>
          {hasCaption && (
            <div className="attr-row">
              <label>标题:</label>
              <input
                type="text"
                value={attrs.caption || ''}
                onChange={(e) => handleUpdateAttr('caption', e.target.value)}
                placeholder="图片标题"
              />
            </div>
          )}
        </div>
      </div>

      {/* 缩放组件 */}
      {showResize && (
        <ImageResize
          editor={editor}
          nodePos={activeNode.pos}
          width={attrs.width}
          height={attrs.height}
          visible={true}
          onResizeEnd={() => setShowResize(false)}
        />
      )}
    </>
  );
};

// 气泡菜单版本
export interface ImageBubbleMenuProps {
  editor: Editor;
  visible?: boolean;
}

export const ImageBubbleMenu: React.FC<ImageBubbleMenuProps> = ({
  editor,
  visible = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);

      if (node && node.type.name === 'image') {
        const element = editor.view.nodeDOM(selection.from) as HTMLElement;
        if (element) {
          const rect = element.getBoundingClientRect();
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
          setIsVisible(true);
        }
      } else {
        setIsVisible(false);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  if (!visible || !isVisible) return null;

  const alignmentButtons: { value: ImageAlignment; icon: string }[] = [
    { value: 'left', icon: '⬅️' },
    { value: 'center', icon: '⬆️' },
    { value: 'right', icon: '➡️' },
  ];

  return (
    <div
      className="wheelchair-image-bubble-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {alignmentButtons.map(({ value, icon }) => (
        <button
          key={value}
          className={editor.isActive('image', { alignment: value }) ? 'active' : ''}
          onClick={() => editor.chain().focus().setImageAlignment(value).run()}
        >
          {icon}
        </button>
      ))}
      <div className="divider" />
      <button
        onClick={() => editor.chain().focus().toggleImageCaption().run()}
        className={editor.isActive('image', { caption: true }) ? 'active' : ''}
      >
        📝
      </button>
      <button onClick={() => editor.chain().focus().deleteImage().run()}>
        🗑️
      </button>
    </div>
  );
};

export default ImageMenu;
