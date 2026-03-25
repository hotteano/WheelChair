import React from 'react';
import { EditorContent } from '@tiptap/react';
import { EditorProvider } from '../context';
import { useEditor } from '../hooks';
import type { EditorOptions } from '../types';

export interface WheelChairEditorProps extends EditorOptions {
  className?: string;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
}

export const WheelChairEditor: React.FC<WheelChairEditorProps> = (props) => {
  const { className, toolbar, footer, ...editorOptions } = props;
  const editor = useEditor(editorOptions);

  return (
    <EditorProvider editor={editor}>
      <div className={`wheelchair-editor border rounded-lg overflow-hidden ${className || ''}`}>
        {toolbar && <div className="wheelchair-toolbar">{toolbar}</div>}
        <EditorContent editor={editor} className="prose max-w-none" />
        {footer && <div className="editor-footer">{footer}</div>}
      </div>
    </EditorProvider>
  );
};
