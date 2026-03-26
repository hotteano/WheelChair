import { useEffect, useState, useCallback, useRef } from 'react';
import { Editor, JSONContent } from '@tiptap/core';
import { 
  UseEditorStateOptions, 
  UseEditorStateReturn,
  EditorSelection,
  WordCount 
} from '../types';

/**
 * 默认字数统计
 */
const DEFAULT_WORD_COUNT: WordCount = {
  words: 0,
  characters: 0,
  charactersWithoutSpaces: 0,
};

/**
 * 编辑器状态 Hook
 * 订阅编辑器状态变化，包括内容、选区、字数等
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { editor } = useWheelChairEditor();
 *   const { content, selection, wordCount, isFocused } = useEditorState({ editor });
 *   
 *   return (
 *     <div>
 *       <p>Words: {wordCount.words}</p>
 *       <p>Focused: {isFocused ? 'Yes' : 'No'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEditorState(
  options: UseEditorStateOptions
): UseEditorStateReturn {
  const {
    editor,
    enableWordCount = true,
    wordCountDebounce,
    debounceMs = 300,
  } = options;
  const resolvedWordCountDebounce = wordCountDebounce ?? debounceMs;
  
  const [content, setContent] = useState<JSONContent | null>(null);
  const [html, setHTML] = useState('');
  const [text, setText] = useState('');
  const [selection, setSelection] = useState<EditorSelection | null>(null);
  const [wordCount, setWordCount] = useState<WordCount>(DEFAULT_WORD_COUNT);
  const [isEditable, setIsEditable] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  
  const wordCountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 计算字数统计
   */
  const calculateWordCount = useCallback((editorInstance: Editor): WordCount => {
    const textContent = editorInstance.getText();
    const characters = textContent.length;
    const charactersWithoutSpaces = textContent.replace(/\s/g, '').length;
    const words = textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .length;

    return {
      words,
      characters,
      charactersWithoutSpaces,
    };
  }, []);

  /**
   * 防抖更新字数统计
   */
  const debouncedUpdateWordCount = useCallback(
    (editorInstance: Editor) => {
      if (!enableWordCount) return;

      if (wordCountTimerRef.current) {
        clearTimeout(wordCountTimerRef.current);
      }

      wordCountTimerRef.current = setTimeout(() => {
        setWordCount(calculateWordCount(editorInstance));
      }, resolvedWordCountDebounce);
    },
    [enableWordCount, resolvedWordCountDebounce, calculateWordCount]
  );

  // 订阅编辑器状态
  useEffect(() => {
    if (!editor) {
      // 重置状态
      setContent(null);
      setHTML('');
      setText('');
      setSelection(null);
      setWordCount(DEFAULT_WORD_COUNT);
      setIsEditable(true);
      setIsFocused(false);
      return;
    }

    // 初始化状态
    setContent(editor.getJSON());
    setHTML(editor.getHTML());
    setText(editor.getText());
    setIsEditable(editor.isEditable);
    setIsFocused(editor.isFocused);
    
    const { selection: pmSelection } = editor.state;
    setSelection({
      from: pmSelection.from,
      to: pmSelection.to,
      empty: pmSelection.empty,
      anchor: pmSelection.anchor,
      head: pmSelection.head,
    });

    if (enableWordCount) {
      setWordCount(calculateWordCount(editor));
    }

    // 订阅编辑器事件
    const handleUpdate = ({ editor: updatedEditor }: { editor: Editor }) => {
      setContent(updatedEditor.getJSON());
      setHTML(updatedEditor.getHTML());
      setText(updatedEditor.getText());
      debouncedUpdateWordCount(updatedEditor);
    };

    const handleSelectionUpdate = ({ editor: updatedEditor }: { editor: Editor }) => {
      const { selection: newSelection } = updatedEditor.state;
      setSelection({
        from: newSelection.from,
        to: newSelection.to,
        empty: newSelection.empty,
        anchor: newSelection.anchor,
        head: newSelection.head,
      });
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('focus', handleFocus);
    editor.on('blur', handleBlur);

    // 清理函数
    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('focus', handleFocus);
      editor.off('blur', handleBlur);
      
      if (wordCountTimerRef.current) {
        clearTimeout(wordCountTimerRef.current);
      }
    };
  }, [editor, enableWordCount, debouncedUpdateWordCount, calculateWordCount]);

  return {
    content,
    html,
    text,
    selection,
    wordCount,
    isEditable,
    isFocused,
  };
}

/**
 * 内容 Hook
 * 仅订阅内容变化
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { editor } = useWheelChairEditor();
 *   const content = useEditorContent(editor);
 *   
 *   return <div>{JSON.stringify(content)}</div>;
 * }
 * ```
 */
export function useEditorContent(editor: Editor | null): JSONContent | null {
  const [content, setContent] = useState<JSONContent | null>(null);

  useEffect(() => {
    if (!editor) {
      setContent(null);
      return;
    }

    setContent(editor.getJSON());

    const handleUpdate = ({ editor: updatedEditor }: { editor: Editor }) => {
      setContent(updatedEditor.getJSON());
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  return content;
}

/**
 * HTML 内容 Hook
 * 仅订阅 HTML 内容变化
 */
export function useEditorHTML(editor: Editor | null): string {
  const [html, setHTML] = useState('');

  useEffect(() => {
    if (!editor) {
      setHTML('');
      return;
    }

    setHTML(editor.getHTML());

    const handleUpdate = ({ editor: updatedEditor }: { editor: Editor }) => {
      setHTML(updatedEditor.getHTML());
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  return html;
}

/**
 * 纯文本内容 Hook
 * 仅订阅纯文本内容变化
 */
export function useEditorText(editor: Editor | null): string {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!editor) {
      setText('');
      return;
    }

    setText(editor.getText());

    const handleUpdate = ({ editor: updatedEditor }: { editor: Editor }) => {
      setText(updatedEditor.getText());
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  return text;
}

/**
 * 选区 Hook
 * 仅订阅选区变化
 */
export function useEditorSelection(editor: Editor | null): EditorSelection | null {
  const [selection, setSelection] = useState<EditorSelection | null>(null);

  useEffect(() => {
    if (!editor) {
      setSelection(null);
      return;
    }

    const { selection: pmSelection } = editor.state;
    setSelection({
      from: pmSelection.from,
      to: pmSelection.to,
      empty: pmSelection.empty,
      anchor: pmSelection.anchor,
      head: pmSelection.head,
    });

    const handleSelectionUpdate = ({ editor: updatedEditor }: { editor: Editor }) => {
      const { selection: newSelection } = updatedEditor.state;
      setSelection({
        from: newSelection.from,
        to: newSelection.to,
        empty: newSelection.empty,
        anchor: newSelection.anchor,
        head: newSelection.head,
      });
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  return selection;
}

/**
 * 字数统计 Hook
 * 仅订阅字数统计变化
 */
export function useWordCount(
  editor: Editor | null,
  debounceMs: number = 300
): WordCount {
  const [wordCount, setWordCount] = useState<WordCount>(DEFAULT_WORD_COUNT);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!editor) {
      setWordCount(DEFAULT_WORD_COUNT);
      return;
    }

    const calculateWordCount = () => {
      const text = editor.getText();
      const characters = text.length;
      const charactersWithoutSpaces = text.replace(/\s/g, '').length;
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .length;

      setWordCount({
        words,
        characters,
        charactersWithoutSpaces,
      });
    };

    calculateWordCount();

    const handleUpdate = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(calculateWordCount, debounceMs);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [editor, debounceMs]);

  return wordCount;
}

/**
 * 聚焦状态 Hook
 * 仅订阅聚焦状态变化
 */
export function useEditorFocus(editor: Editor | null): boolean {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!editor) {
      setIsFocused(false);
      return;
    }

    setIsFocused(editor.isFocused);

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    editor.on('focus', handleFocus);
    editor.on('blur', handleBlur);

    return () => {
      editor.off('focus', handleFocus);
      editor.off('blur', handleBlur);
    };
  }, [editor]);

  return isFocused;
}

/**
 * 可编辑状态 Hook
 * 仅订阅可编辑状态变化
 */
export function useEditorEditable(editor: Editor | null): boolean {
  const [isEditable, setIsEditable] = useState(true);

  useEffect(() => {
    if (!editor) {
      setIsEditable(true);
      return;
    }

    setIsEditable(editor.isEditable);

    // Tiptap 没有直接的 editable change 事件
    // 需要通过 transaction 中的 meta 来判断
    const handleTransaction = ({ transaction }: { transaction: any }) => {
      if (transaction.getMeta('editable') !== undefined) {
        setIsEditable(transaction.getMeta('editable'));
      }
    };

    editor.on('transaction', handleTransaction);

    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor]);

  return isEditable;
}

export default useEditorState;
