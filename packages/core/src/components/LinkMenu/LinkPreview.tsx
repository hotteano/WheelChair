import React, { useState, useEffect } from 'react';
import type { LinkPreviewData } from '../../types/upload';
import { getDomainFromUrl } from '../../extensions/marks/Link';
import './LinkPreview.css';

export interface LinkPreviewProps {
  /** 链接 URL */
  url: string;
  /** 预览数据（可选，如果提供则直接使用） */
  previewData?: LinkPreviewData;
  /** 获取预览数据的函数 */
  fetchPreviewData?: (url: string) => Promise<LinkPreviewData>;
  /** 是否可见 */
  visible?: boolean;
  /** 位置 */
  position?: { x: number; y: number };
  /** 最大宽度 */
  maxWidth?: number;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({
  url,
  previewData: initialData,
  fetchPreviewData,
  visible = true,
  position,
  maxWidth = 360,
}) => {
  const [data, setData] = useState<LinkPreviewData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    if (!fetchPreviewData || !url) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadPreview = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPreviewData(url);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // 延迟加载，避免频繁请求
    const timeout = setTimeout(loadPreview, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [url, initialData, fetchPreviewData]);

  if (!visible) return null;

  const domain = data?.domain || getDomainFromUrl(url);

  return (
    <div
      className="wheelchair-link-preview"
      style={{
        maxWidth,
        ...(position && {
          position: 'fixed',
          left: position.x,
          top: position.y,
        }),
      }}
    >
      {loading ? (
        <div className="preview-loading">
          <div className="spinner" />
          <span>加载中...</span>
        </div>
      ) : error ? (
        <div className="preview-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <span className="error-text">{error}</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="fallback-link"
            >
              {domain}
            </a>
          </div>
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="preview-card"
        >
          {/* 预览图片 */}
          {data?.image && (
            <div className="preview-image">
              <img
                src={data.image}
                alt={data.title || ''}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* 预览内容 */}
          <div className="preview-content">
            {data?.title && (
              <h4 className="preview-title" title={data.title}>
                {data.title}
              </h4>
            )}
            {data?.description && (
              <p className="preview-description" title={data.description}>
                {data.description}
              </p>
            )}
            <div className="preview-footer">
              <span className="preview-domain">{domain}</span>
              <span className="preview-arrow">→</span>
            </div>
          </div>
        </a>
      )}
    </div>
  );
};

// 链接悬停预览 Hook
export interface UseLinkPreviewOptions {
  fetchPreviewData?: (url: string) => Promise<LinkPreviewData>;
  delay?: number;
}

export function useLinkPreview(options: UseLinkPreviewOptions = {}) {
  const { fetchPreviewData, delay = 500 } = options;
  const [hoveredLink, setHoveredLink] = useState<{
    url: string;
    position: { x: number; y: number };
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!hoveredLink) {
      setShowPreview(false);
      return;
    }

    const timeout = setTimeout(() => {
      setShowPreview(true);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [hoveredLink, delay]);

  const handleLinkEnter = (url: string, rect: DOMRect) => {
    setHoveredLink({
      url,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
      },
    });
  };

  const handleLinkLeave = () => {
    setHoveredLink(null);
  };

  return {
    hoveredLink,
    showPreview,
    handleLinkEnter,
    handleLinkLeave,
    PreviewComponent: hoveredLink ? (
      <LinkPreview
        url={hoveredLink.url}
        fetchPreviewData={fetchPreviewData}
        visible={showPreview}
        position={hoveredLink.position}
      />
    ) : null,
  };
}

// 链接气泡卡片（简化版预览）
export interface LinkBubbleCardProps {
  url: string;
  onOpen?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

export const LinkBubbleCard: React.FC<LinkBubbleCardProps> = ({
  url,
  onOpen,
  onEdit,
  onRemove,
}) => {
  const domain = getDomainFromUrl(url);

  return (
    <div className="wheelchair-link-bubble-card">
      <div className="link-info">
        <div className="link-icon">🔗</div>
        <div className="link-details">
          <span className="link-domain" title={url}>
            {domain}
          </span>
          <span className="link-url">{url.length > 40 ? url.substring(0, 40) + '...' : url}</span>
        </div>
      </div>
      <div className="link-actions">
        <button onClick={onOpen} title="打开链接">
          ↗️
        </button>
        <button onClick={onEdit} title="编辑">
          ✏️
        </button>
        <button onClick={onRemove} title="移除">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default LinkPreview;
