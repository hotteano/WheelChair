/**
 * WheelChair Editor - Core Editor
 * 核心编辑器类
 */

import { Editor } from '@tiptap/core';
import type { EditorOptions, Extensions, JSONContent } from '@tiptap/core';

export interface EditorConfig extends Partial<EditorOptions> {
  extensions?: Extensions;
  content?: string | JSONContent;
  editable?: boolean;
  autofocus?: boolean | 'start' | 'end' | 'all' | number;
  placeholder?: string;
}

export interface EditorState {
  content: JSONContent;
  html: string;
  text: string;
  isFocused: boolean;
  isEditable: boolean;
}

export class WheelChairEditor {
  private editor: Editor | null = null;
  private config: EditorConfig;
  
  constructor(config: EditorConfig = {}) {
    this.config = config;
  }
  
  mount(element: HTMLElement): void {
    this.editor = new Editor({
      element,
      ...this.config,
    });
  }
  
  unmount(): void {
    this.editor?.destroy();
    this.editor = null;
  }
  
  getEditor(): Editor | null {
    return this.editor;
  }
  
  getState(): EditorState | null {
    if (!this.editor) return null;
    
    return {
      content: this.editor.getJSON(),
      html: this.editor.getHTML(),
      text: this.editor.getText(),
      isFocused: this.editor.isFocused,
      isEditable: this.editor.isEditable,
    };
  }
  
  setContent(content: string | JSONContent): void {
    this.editor?.commands.setContent(content);
  }
  
  getContent(): JSONContent {
    return this.editor?.getJSON() || { type: 'doc', content: [] };
  }
  
  focus(): void {
    this.editor?.commands.focus();
  }
  
  blur(): void {
    this.editor?.commands.blur();
  }
  
  isFocused(): boolean {
    return this.editor?.isFocused || false;
  }
  
  setEditable(editable: boolean): void {
    this.editor?.setEditable(editable);
  }
}
