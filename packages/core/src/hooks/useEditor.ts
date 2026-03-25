import { useEffect, useState } from 'react';
import { useEditor as useTiptapEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import type { UseEditorProps } from '../types';

interface LocalUseEditorProps extends UseEditorProps {
  extensions?: unknown[];
}

export const useEditor = (props: LocalUseEditorProps = {}): Editor | null => {
  const { content = '', editable = true, extensions = [], ...rest } = props as any;

  const editor = useTiptapEditor({
    extensions: [StarterKit, ...extensions],
    content,
    editable,
    ...rest,
  });

  return editor;
};
