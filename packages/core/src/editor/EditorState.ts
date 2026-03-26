/**
 * WheelChair Editor - Editor State
 * 编辑器状态类型
 */

import type { JSONContent } from '@tiptap/core';

export interface EditorState {
  content: JSONContent;
  selection: {
    from: number;
    to: number;
  } | null;
  isFocused: boolean;
  isEditable: boolean;
}
