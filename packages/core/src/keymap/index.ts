/**
 * WheelChair 快捷键系统 - 主入口
 * 
 * 导出快捷键系统的所有类型、类和函数
 */

// 默认快捷键映射
export {
  defaultKeymap,
  getTextFormatKeymap,
  getParagraphKeymap,
  getListKeymap,
  getHistoryKeymap,
  getClipboardKeymap,
  getAlignmentKeymap,
  getMacKeymap,
  getWinKeymap,
  getDefaultKeymapForPlatform,
  KeymapDefinitions,
} from './defaultKeymap';

// 快捷键管理器
export { KeymapManager } from './KeymapManager';
export type { KeymapManagerOptions, KeybindingConflict } from './KeymapManager';
export {
  createKeymapManager,
  getGlobalKeymapManager,
  setGlobalKeymapManager,
  formatKeybinding,
} from './KeymapManager';
