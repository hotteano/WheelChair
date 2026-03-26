import { useEffect, useState } from 'react';
import { useEditor as useTiptapEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import type { UseEditorProps } from '../types';

export const useEditor = (props: UseEditorProps = {}): Editor | null => {
  const { content = '', editable = true, extensions = [], ...rest } = props;

  const editor = useTiptapEditor(
    {
      extensions: [StarterKit, ...extensions],
      content,
      editable,
      ...rest,
    } as any
  );

  return editor;
};
