import { useState, useCallback, useRef } from 'react';
import type { ImageUploadOptions, UploadState } from '../../types/upload';

export interface UseImageUploadOptions extends Partial<ImageUploadOptions> {
  /** 多个文件上传 */
  multiple?: boolean;
  /** 上传前处理 */
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  /** 上传成功回调 */
  onSuccess?: (url: string, file: File) => void;
  /** 上传失败回调 */
  onError?: (error: Error, file: File) => void;
}

export interface UseImageUploadReturn {
  /** 上传状态 */
  uploadState: UploadState;
  /** 选中的文件 */
  selectedFiles: File[];
  /** 输入框引用 */
  inputRef: React.RefObject<HTMLInputElement>;
  /** 选择文件 */
  selectFiles: () => void;
  /** 处理文件选择 */
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** 处理拖拽 */
  handleDrop: (event: React.DragEvent) => void;
  /** 处理拖拽悬停 */
  handleDragOver: (event: React.DragEvent) => void;
  /** 处理粘贴 */
  handlePaste: (event: React.ClipboardEvent) => void;
  /** 上传文件 */
  uploadFiles: () => Promise<void>;
  /** 取消上传 */
  cancelUpload: () => void;
  /** 清除状态 */
  clearState: () => void;
  /** 是否拖拽中 */
  isDragging: boolean;
}

export function useImageUpload(
  options: UseImageUploadOptions = {}
): UseImageUploadReturn {
  const {
    accept = 'image/*',
    maxSize,
    multiple = false,
    onUpload,
    beforeUpload,
    onSuccess,
    onError,
  } = options;

  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 验证文件
  const validateFile = useCallback(
    (file: File): boolean => {
      // 检查文件类型
      if (accept && accept !== 'image/*') {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const isValidType = acceptedTypes.some((type) => {
          if (type.includes('*')) {
            return file.type.startsWith(type.replace('/*', ''));
          }
          return file.type === type;
        });
        if (!isValidType) {
          onError?.(new Error(`不支持的文件类型: ${file.type}`), file);
          return false;
        }
      } else if (!file.type.startsWith('image/')) {
        onError?.(new Error(`不是图片文件: ${file.type}`), file);
        return false;
      }

      // 检查文件大小
      if (maxSize && file.size > maxSize) {
        onError?.(
          new Error(
            `文件大小超过限制: ${formatFileSize(file.size)} > ${formatFileSize(maxSize)}`
          ),
          file
        );
        return false;
      }

      return true;
    },
    [accept, maxSize, onError]
  );

  // 处理文件
  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      for (const file of fileArray) {
        // 调用 beforeUpload 钩子
        if (beforeUpload) {
          const result = await beforeUpload(file);
          if (!result) continue;
        }

        if (validateFile(file)) {
          validFiles.push(file);
        }
      }

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => (multiple ? [...prev, ...validFiles] : validFiles));
      }
    },
    [beforeUpload, validateFile, multiple]
  );

  // 选择文件
  const selectFiles = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(event.target.files);
      // 清空 input 值，允许重复选择相同文件
      event.target.value = '';
    },
    [processFiles]
  );

  // 处理拖拽
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      processFiles(event.dataTransfer.files);
    },
    [processFiles]
  );

  // 处理拖拽悬停
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  // 处理拖拽离开
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  // 处理粘贴
  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        const dataTransfer = new DataTransfer();
        files.forEach((file) => dataTransfer.items.add(file));
        processFiles(dataTransfer.files);
      }
    },
    [processFiles]
  );

  // 上传文件
  const uploadFiles = useCallback(async () => {
    if (!onUpload || selectedFiles.length === 0) return;

    setUploadState({ status: 'uploading', progress: 0 });
    abortControllerRef.current = new AbortController();

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const progress = Math.round(((i + 0.5) / selectedFiles.length) * 100);
        setUploadState({ status: 'uploading', progress });

        try {
          const url = await onUpload(file);
          setUploadState({ status: 'success', progress: 100, url });
          onSuccess?.(url, file);
        } catch (error) {
          const err = error instanceof Error ? error : new Error('上传失败');
          setUploadState({ status: 'error', progress: 0, error: err.message });
          onError?.(err, file);
          throw err;
        }
      }
    } catch {
      // 上传失败，状态已在上面设置
    }
  }, [onUpload, selectedFiles, onSuccess, onError]);

  // 取消上传
  const cancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
    setUploadState({ status: 'idle', progress: 0 });
  }, []);

  // 清除状态
  const clearState = useCallback(() => {
    setSelectedFiles([]);
    setUploadState({ status: 'idle', progress: 0 });
  }, []);

  return {
    uploadState,
    selectedFiles,
    inputRef,
    selectFiles,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handlePaste,
    uploadFiles,
    cancelUpload,
    clearState,
    isDragging,
  };
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取图片预览 URL
export function getImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 压缩图片
export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  type?: string;
}

export function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<Blob> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, type } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // 计算缩放比例
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建 canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        type || file.type,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}

export default useImageUpload;
