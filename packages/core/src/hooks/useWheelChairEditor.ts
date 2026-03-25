import { useEffect, useRef, useState, useCallback } from 'react';
import { Editor } from '@tiptap/core';
import { WheelChairEditor } from '../core/WheelChairEditor';
import { 
  UseWheelChairEditorOptions, 
  UseWheelChairEditorReturn,
  WheelChairEditorOptions 
} from '../types';

/**
 * WheelChair 编辑器 Hook
 * 用于在 React 组件中创建和管理编辑器实例
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { editor, isReady } = useWheelChairEditor({
 *     content: '<p>Hello World</p>',
 *     onChange: (content) => console.log(content),
 *   });
 *   
 *   return (
 *     <div ref={(el) => el && editor?.init(el)} />
 *   );
 * }
 * ```
 */
export function useWheelChairEditor(
  options: UseWheelChairEditorOptions = {}
): UseWheelChairEditorReturn & {
  /** 初始化编辑器到 DOM 元素 */
  init: (element: HTMLElement | null) => void;
  /** WheelChairEditor 包装实例 */
  wheelChairEditor: WheelChairEditor | null;
} {
  const [isReady, setIsReady] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const wheelChairEditorRef = useRef<WheelChairEditor | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const optionsRef = useRef(options);

  // 保持 options 引用最新
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /**
   * 初始化编辑器
   */
  const init = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    // 避免重复初始化到同一个元素
    if (elementRef.current === element && wheelChairEditorRef.current) {
      return;
    }

    elementRef.current = element;

    // 如果已有编辑器实例，先销毁
    if (wheelChairEditorRef.current) {
      wheelChairEditorRef.current.destroy();
      wheelChairEditorRef.current = null;
    }

    // 创建新的编辑器实例
    const wheelChairEditor = new WheelChairEditor({
      ...optionsRef.current,
      onCreate: (editorInstance) => {
        setEditor(editorInstance);
        setIsReady(true);
        optionsRef.current.onCreate?.(editorInstance);
      },
    });

    wheelChairEditor.init(element);
    wheelChairEditorRef.current = wheelChairEditor;

    // 订阅就绪状态
    const unsubscribe = wheelChairEditor.getStateManager().onReadyChange((ready) => {
      setIsReady(ready);
      if (ready) {
        setEditor(wheelChairEditor.getEditor());
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 清理函数
  useEffect(() => {
    return () => {
      if (wheelChairEditorRef.current) {
        wheelChairEditorRef.current.destroy();
        wheelChairEditorRef.current = null;
      }
      elementRef.current = null;
      setIsReady(false);
      setEditor(null);
    };
  }, []);

  return {
    editor,
    isReady,
    init,
    wheelChairEditor: wheelChairEditorRef.current,
  };
}

/**
 * 简化的编辑器 Hook（自动管理 ref）
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { ref, editor, isReady } = useWheelChairEditorRef({
 *     content: '<p>Hello World</p>',
 *   });
 *   
 *   return <div ref={ref} />;
 * }
 * ```
 */
export function useWheelChairEditorRef(
  options: UseWheelChairEditorOptions = {}
): UseWheelChairEditorReturn & {
  /** 绑定到编辑器容器的 ref */
  ref: (element: HTMLElement | null) => void;
} {
  const { editor, isReady, init } = useWheelChairEditor(options);

  return {
    editor,
    isReady,
    ref: init,
  };
}

export default useWheelChairEditor;
