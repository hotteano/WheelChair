/**
 * WheelChair 命令系统 - 主入口
 * 
 * 导出命令系统的所有类型、类和函数
 */

// 类型定义
export type {
  Command,
  CommandContext,
  CommandResult,
  CommandHistoryItem,
  CommandHistoryOptions,
  CommandManagerOptions,
  CommandRegistration,
  CommandExecuteOptions,
  Keybinding,
  Keymap,
  ParsedKeybinding,
} from './types';

// 枚举
export {
  CommandCategory,
  TextFormat,
  BlockType,
  ListType,
  Alignment,
} from './types';

// 命令管理器
export {
  CommandManager,
  createCommandManager,
  getGlobalCommandManager,
  setGlobalCommandManager,
} from './CommandManager';

// 文本命令
export {
  // 具体命令
  BoldCommand,
  ItalicCommand,
  UnderlineCommand,
  StrikethroughCommand,
  CodeCommand,
  SuperscriptCommand,
  SubscriptCommand,
  LinkCommand,
  RemoveFormatCommand,
  SetColorCommand,
  SetBackgroundColorCommand,
  SetFontSizeCommand,
  HighlightCommand,
  
  // 工具函数
  getAllTextCommands,
  registerTextCommands,
} from './impl/TextCommands';

// 块级命令
export {
  // 具体命令
  ParagraphCommand,
  Heading1Command,
  Heading2Command,
  Heading3Command,
  Heading4Command,
  Heading5Command,
  Heading6Command,
  BlockquoteCommand,
  CodeBlockCommand,
  HorizontalRuleCommand,
  AlignLeftCommand,
  AlignCenterCommand,
  AlignRightCommand,
  AlignJustifyCommand,
  IndentCommand,
  OutdentCommand,
  SetLineHeightCommand,
  
  // 工具函数
  getAllBlockCommands,
  registerBlockCommands,
} from './impl/BlockCommands';

// 列表命令
export {
  // 具体命令
  BulletListCommand,
  OrderedListCommand,
  TaskListCommand,
  ToggleListFoldCommand,
  ToggleCheckboxCommand,
  IndentListCommand,
  OutdentListCommand,
  InsertListItemBeforeCommand,
  InsertListItemAfterCommand,
  SplitListItemCommand,
  RemoveListCommand,
  
  // 工具函数
  getAllListCommands,
  registerListCommands,
} from './impl/ListCommands';

// 剪贴板命令
export {
  // 具体命令
  CutCommand,
  CopyCommand,
  PasteCommand,
  PastePlainCommand,
  PasteAndMatchStyleCommand,
  CopyLineCommand,
  CutLineCommand,
  CopyAsMarkdownCommand,
  
  // 工具函数
  getAllClipboardCommands,
  registerClipboardCommands,
} from './impl/ClipboardCommands';

// 历史命令
export {
  // 命令创建函数
  createUndoCommand,
  createRedoCommand,
  createClearHistoryCommand,
  createUndoMultipleCommand,
  createRedoMultipleCommand,
  createGotoHistoryCommand,
  createSnapshotCommand,
  
  // 工具函数
  getAllHistoryCommands,
  registerHistoryCommands,
} from './impl/HistoryCommands';
