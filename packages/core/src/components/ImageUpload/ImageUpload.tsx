import React, { useState, useEffect } from 'react';
import { useImageUpload, getImagePreview, formatFileSize } from './useImageUpload';
import type { ImageAlignment } from '../../types/upload';
import './ImageUpload.css';

export interface ImageUploadProps {
  /** 是否可见 */
  visible?: boolean;
  /** 标题 */
  title?: string;
  /** 接受的文件类型 */
  accept?: string;
  /** 最大文件大小 */
  maxSize?: number;
  /** 是否多选 */
  multiple?: boolean;
  /** 上传处理函数 */
  onUpload: (file: File) => Promise<string>;
  /** 确认回调 */
  onConfirm?: (urls: string[], alignment?: ImageAlignment, caption?: string) => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 关闭回调 */
  onClose?: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  visible = true,
  title = '插入图片',
  accept = 'image/*',
  maxSize,
  multiple = false,
  onUpload,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const {
    uploadState,
    selectedFiles,
    inputRef,
    selectFiles,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    clearState,
    isDragging,
  } = useImageUpload({
    accept,
    maxSize,
    multiple,
    onUpload,
  });

  const [previews, setPreviews] = useState<string[]>([]);
  const [alignment, setAlignment] = useState<ImageAlignment>('center');
  const [caption, setCaption] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');

  // 加载图片预览
  useEffect(() => {
    const loadPreviews = async () => {
      const previewUrls = await Promise.all(
        selectedFiles.map((file) => getImagePreview(file))
      );
      setPreviews(previewUrls);
    };

    if (selectedFiles.length > 0) {
      loadPreviews();
    } else {
      setPreviews([]);
    }
  }, [selectedFiles]);

  // 处理确认
  const handleConfirm = async () => {
    if (activeTab === 'url' && urlInput) {
      onConfirm?.([urlInput], alignment, caption);
      handleClose();
      return;
    }

    if (selectedFiles.length > 0) {
      const urls: string[] = [];
      for (const file of selectedFiles) {
        try {
          const url = await onUpload(file);
          urls.push(url);
        } catch (error) {
          console.error('Upload failed:', error);
        }
      }
      if (urls.length > 0) {
        onConfirm?.(urls, alignment, caption);
      }
      handleClose();
    }
  };

  // 处理关闭
  const handleClose = () => {
    clearState();
    setCaption('');
    setUrlInput('');
    setActiveTab('upload');
    onClose?.();
  };

  // 移除文件
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    // 注意：这里需要修改 useImageUpload 来支持移除文件
  };

  if (!visible) return null;

  return (
    <div className="wheelchair-image-upload-overlay" onClick={handleClose}>
      <div
        className="wheelchair-image-upload-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="wheelchair-image-upload-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        {/* 标签切换 */}
        <div className="wheelchair-image-upload-tabs">
          <button
            className={activeTab === 'upload' ? 'active' : ''}
            onClick={() => setActiveTab('upload')}
          >
            上传图片
          </button>
          <button
            className={activeTab === 'url' ? 'active' : ''}
            onClick={() => setActiveTab('url')}
          >
            图片链接
          </button>
        </div>

        {/* 内容区域 */}
        <div className="wheelchair-image-upload-content">
          {activeTab === 'upload' ? (
            <>
              {/* 拖拽上传区域 */}
              {selectedFiles.length === 0 ? (
                <div
                  className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
                  onClick={selectFiles}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-icon">📷</div>
                  <p>点击或拖拽图片到此处上传</p>
                  <p className="upload-hint">
                    支持 JPG、PNG、GIF、WebP 格式
                    {maxSize && `，最大 ${formatFileSize(maxSize)}`}
                  </p>
                </div>
              ) : (
                /* 预览区域 */
                <div className="upload-preview-list">
                  {previews.map((preview, index) => (
                    <div key={index} className="preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <div className="preview-info">
                        <span className="file-name">
                          {selectedFiles[index]?.name}
                        </span>
                        <span className="file-size">
                          {formatFileSize(selectedFiles[index]?.size || 0)}
                        </span>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeFile(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {multiple && (
                    <div className="add-more" onClick={selectFiles}>
                      <span>+</span>
                      <p>添加更多</p>
                    </div>
                  )}
                </div>
              )}

              {/* 上传进度 */}
              {uploadState.status === 'uploading' && (
                <div className="upload-progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                  <span>{uploadState.progress}%</span>
                </div>
              )}

              {/* 错误提示 */}
              {uploadState.status === 'error' && (
                <div className="upload-error">
                  {uploadState.error || '上传失败'}
                </div>
              )}
            </>
          ) : (
            /* URL 输入 */
            <div className="url-input-section">
              <input
                type="text"
                placeholder="输入图片 URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="url-input"
              />
              {urlInput && (
                <div className="url-preview">
                  <img
                    src={urlInput}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* 对齐选项 */}
          <div className="alignment-section">
            <label>对齐方式：</label>
            <div className="alignment-options">
              <button
                className={alignment === 'left' ? 'active' : ''}
                onClick={() => setAlignment('left')}
                title="左对齐"
              >
                ⬅️
              </button>
              <button
                className={alignment === 'center' ? 'active' : ''}
                onClick={() => setAlignment('center')}
                title="居中"
              >
                ⬆️
              </button>
              <button
                className={alignment === 'right' ? 'active' : ''}
                onClick={() => setAlignment('right')}
                title="右对齐"
              >
                ➡️
              </button>
            </div>
          </div>

          {/* 标题输入 */}
          <div className="caption-section">
            <label>图片描述（可选）：</label>
            <input
              type="text"
              placeholder="输入图片描述"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="wheelchair-image-upload-footer">
          <button className="btn-secondary" onClick={onCancel || handleClose}>
            取消
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirm}
            disabled={
              uploadState.status === 'uploading' ||
              (activeTab === 'upload' && selectedFiles.length === 0) ||
              (activeTab === 'url' && !urlInput)
            }
          >
            {uploadState.status === 'uploading' ? '上传中...' : '插入'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
