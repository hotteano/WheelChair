import React, { createContext, useContext, ReactNode } from 'react';
import { Editor } from '@tiptap/react';

interface EditorContextValue {
  editor: Editor | null;
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

interface EditorProviderProps {
  editor: Editor | null;
  children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ editor, children }) => {
  return (
    <EditorContext.Provider value={{ editor }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = (): EditorContextValue => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};
