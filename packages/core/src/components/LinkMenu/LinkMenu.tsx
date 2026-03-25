import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import { isValidUrl, normalizeUrl } from '../../extensions/marks/Link';
import './LinkMenu.css';

export interface LinkMenuProps {
  /** 编辑器实例 */
  editor: Editor;
  /** 是否可见 */
  visible?: boolean;
  /** 默认 href */
  defaultHref?: string;
  /** 默认文本 */
  defaultText?: string;
  /** 默认打开方式 */
  defaultOpenInNewTab?: boolean;
  /** 位置 */
  position?: { x: number; y: number };
  /** 确认回调 */
  onConfirm?: (href: string, text: string, openInNewTab: boolean) => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 关闭回调 */
  onClose?: () => void;
}

export const LinkMenu: React.FC<LinkMenuProps> = ({
  editor,
  visible = false,
  defaultHref = '',
  defaultText = '',
  defaultOpenInNewTab = true,
  position,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const [href, setHref] = useState(defaultHref);
  const [text, setText] = useState(defaultText);
  const [openInNewTab, setOpenInNewTab] = useState(defaultOpenInNewTab);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hrefInputRef = useRef<HTMLInputElement>(null);

  // 初始化值
  useEffect(() => {
    if (visible) {
      // 检查是否已有链接
      const hasLink = editor.isActive('link');
      
      if (hasLink) {
        // 编辑模式
        setIsEdit(true);
        const attrs = editor.getAttributes('link');
        setHref(attrs.href || '');
        setOpenInNewTab(attrs.target === '_blank');
        
        // 获取选中文本
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);
        setText(selectedText);
      } else {
        // 新建模式
        setIsEdit(false);
        setHref(defaultHref);
        setOpenInNewTab(defaultOpenInNewTab);
        
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.selection.empty 
          ? '' 
          : editor.state.doc.textBetween(from, to);
        setText(selectedText || defaultText);
      }
      
      setError('');
      
      // 聚焦输入框
      setTimeout(() => {
        hrefInputRef.current?.focus();
        hrefInputRef.current?.select();
      }, 0);
    }
  }, [visible, editor, defaultHref, defaultText, defaultOpenInNewTab]);

  // 处理确认
  const handleConfirm = useCallback(() => {
    if (!href.trim()) {
      setError('请输入链接地址');
      return;
    }

    // 验证 URL
    if (!isValidUrl(href)) {
      setError('请输入有效的链接地址');
      return;
    }

    const normalizedHref = normalizeUrl(href.trim());
    const linkText = text.trim() || normalizedHref;

    if (isEdit) {
      // 更新链接
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: normalizedHref,
          target: openInNewTab ? '_blank' : '_self',
        })
        .command(({ tr, dispatch }) => {
          // 更新链接文本
          const { from, to } = editor.state.selection;
          if (dispatch && linkText !== editor.state.doc.textBetween(from, to)) {
            tr.insertText(linkText, from, to);
            dispatch(tr);
          }
          return true;
        })
        .run();
    } else {
      // 新建链接
      if (editor.state.selection.empty) {
        // 如果没有选中文本，插入新链接
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${normalizedHref}"${openInNewTab ? ' target="_blank"' : ''}>${linkText}</a>`)
          .run();
      } else {
        // 如果有选中文本，包裹链接
        editor
          .chain()
          .focus()
          .setLink({
            href: normalizedHref,
            target: openInNewTab ? '_blank' : '_self',
          })
          .run();
      }
    }

    onConfirm?.(normalizedHref, linkText, openInNewTab);
    handleClose();
  }, [href, text, openInNewTab, isEdit, editor, onConfirm]);

  // 处理取消/取消链接
  const handleCancel = useCallback(() => {
    if (isEdit) {
      // 取消链接
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    onCancel?.();
    handleClose();
  }, [isEdit, editor, onCancel]);

  // 处理关闭
  const handleClose = useCallback(() => {
    setHref('');
    setText('');
    setError('');
    onClose?.();
  }, [onClose]);

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleConfirm, handleCancel]
  );

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, handleClose]);

  // 处理粘贴 URL 自动提取
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (isValidUrl(pastedText) && !href) {
      e.preventDefault();
      setHref(pastedText);
    }
  }, [href]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="wheelchair-link-menu"
      style={
        position
          ? { position: 'fixed', left: position.x, top: position.y }
          : undefined
      }
    >
      <div className="link-menu-header">
        <h4>{isEdit ? '编辑链接' : '插入链接'}</h4>
        <button className="close-btn" onClick={handleClose}>
          ×
        </button>
      </div>

      <div className="link-menu-content">
        {/* 链接地址 */}
        <div className="form-group">
          <label>链接地址</label>
          <input
            ref={hrefInputRef}
            type="text"
            value={href}
            onChange={(e) => {
              setHref(e.target.value);
              setError('');
            }}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            className={error ? 'error' : ''}
          />
          {error && <span className="error-message">{error}</span>}
        </div>

        {/* 链接文本 */}
        <div className="form-group">
          <label>显示文本</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="链接文本"
          />
        </div>

        {/* 打开方式 */}
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
            />
            在新窗口打开
          </label>
        </div>
      </div>

      <div className="link-menu-footer">
        {isEdit && (
          <button
            className="btn-danger"
            onClick={() => {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              handleClose();
            }}
          >
            移除链接
          </button>
        )}
        <div className="spacer" />
        <button className="btn-secondary" onClick={handleClose}>
          取消
        </button>
        <button className="btn-primary" onClick={handleConfirm}>
          {isEdit ? '更新' : '插入'}
        </button>
      </div>
    </div>
  );
};

// 链接工具栏按钮
export interface LinkToolbarButtonProps {
  editor: Editor;
  onClick?: () => void;
}

export const LinkToolbarButton: React.FC<LinkToolbarButtonProps> = ({
  editor,
  onClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <button
        className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
        onClick={() => {
          setShowMenu(true);
          onClick?.();
        }}
        title="插入链接 (Ctrl+K)"
      >
        🔗
      </button>
      <LinkMenu
        editor={editor}
        visible={showMenu}
        onClose={() => setShowMenu(false)}
      />
    </>
  );
};

export default LinkMenu;
