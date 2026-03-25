/**
 * WheelChair 编辑器命令系统类型定义
 * 
 * 提供命令系统的基础类型、接口和枚举定义
 */

import type { EditorState } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

/**
 * 命令执行上下文
 * 包含执行命令所需的编辑器状态和方法
 */
export interface CommandContext {
  /** 编辑器状态 */
  state: EditorState;
  /** 编辑器视图 */
  view: EditorView;
  /** 获取当前选区 */
  getSelection(): Selection | null;
  /** 设置选区 */
  setSelection(range: Range | null): void;
  /** 获取当前选中的文本 */
  getSelectedText(): string;
  /** 插入文本 */
  insertText(text: string): void;
  /** 删除选中的文本 */
  deleteSelection(): void;
  /** 应用格式 */
  applyFormat(format: string, value?: any): void;
  /** 移除格式 */
  removeFormat(format: string): void;
  /** 切换格式 */
  toggleFormat(format: string, value?: any): void;
  /** 检查当前选区是否有指定格式 */
  hasFormat(format: string): boolean;
  /** 获取当前块类型 */
  getCurrentBlockType(): string;
  /** 设置块类型 */
  setBlockType(type: string, attrs?: Record<string, any>): void;
  /** 包裹选区 */
  wrapIn(type: string, attrs?: Record<string, any>): void;
  /** 展开包裹 */
  unwrap(type: string): void;
}

/**
 * 命令执行结果
 */
export interface CommandResult {
  /** 是否执行成功 */
  success: boolean;
  /** 执行结果消息 */
  message?: string;
  /** 是否可撤销 */
  undoable?: boolean;
  /** 关联的撤销数据 */
  undoData?: any;
  /** 是否触发了状态更新 */
  stateChanged?: boolean;
}

/**
 * 命令接口
 * 所有命令必须实现此接口
 */
export interface Command {
  /** 命令唯一标识 */
  id: string;
  /** 命令显示名称 */
  name: string;
  /** 命令描述 */
  description?: string;
  /** 命令图标（可选） */
  icon?: string;
  /** 命令分类 */
  category?: CommandCategory;
  /** 是否可撤销 */
  undoable?: boolean;
  /** 是否可重做 */
  redoable?: boolean;
  /** 执行命令 */
  execute(context: CommandContext, ...args: any[]): CommandResult | Promise<CommandResult>;
  /** 撤销命令（如果支持） */
  undo?(context: CommandContext, undoData: any): CommandResult | Promise<CommandResult>;
  /** 重做命令（如果支持） */
  redo?(context: CommandContext, redoData: any): CommandResult | Promise<CommandResult>;
  /** 检查命令是否可用 */
  isEnabled?(context: CommandContext): boolean;
  /** 检查命令是否处于激活状态 */
  isActive?(context: CommandContext): boolean;
}

/**
 * 命令分类枚举
 */
export enum CommandCategory {
  /** 文本格式化 */
  TEXT_FORMAT = 'text-format',
  /** 段落/块级操作 */
  BLOCK = 'block',
  /** 列表操作 */
  LIST = 'list',
  /** 历史操作 */
  HISTORY = 'history',
  /** 剪贴板操作 */
  CLIPBOARD = 'clipboard',
  /** 插入操作 */
  INSERT = 'insert',
  /** 选择操作 */
  SELECTION = 'selection',
  /** 编辑器操作 */
  EDITOR = 'editor',
  /** 自定义命令 */
  CUSTOM = 'custom',
}

/**
 * 命令历史记录项
 */
export interface CommandHistoryItem {
  /** 历史记录ID */
  id: string;
  /** 执行的命令 */
  command: Command;
  /** 执行参数 */
  args: any[];
  /** 执行结果 */
  result: CommandResult;
  /** 执行时间 */
  timestamp: number;
  /** 执行前的编辑器状态（用于撤销） */
  beforeState?: EditorState;
  /** 执行后的编辑器状态（用于重做） */
  afterState?: EditorState;
}

/**
 * 命令历史记录配置
 */
export interface CommandHistoryOptions {
  /** 最大历史记录数量 */
  maxHistorySize?: number;
  /** 是否合并连续的相同命令 */
  mergeConsecutive?: boolean;
  /** 合并的时间窗口（毫秒） */
  mergeWindow?: number;
  /** 忽略记录的命令ID列表 */
  ignoreCommands?: string[];
}

/**
 * 快捷键定义
 */
export interface Keybinding {
  /** 快捷键ID */
  id: string;
  /** 绑定的命令ID */
  command: string;
  /** 快捷键组合（如 'ctrl+b', 'cmd+shift+s'） */
  key: string;
  /** 快捷键显示名称 */
  name?: string;
  /** 快捷键描述 */
  description?: string;
  /** 是否防止默认行为 */
  preventDefault?: boolean;
  /** 是否停止事件传播 */
  stopPropagation?: boolean;
  /** 命令执行参数 */
  args?: any[];
  /** 平台特定的快捷键 */
  platform?: {
    /** Windows/Linux 快捷键 */
    win?: string;
    /** Mac 快捷键 */
    mac?: string;
  };
  /** 条件判断，决定是否启用此快捷键 */
  when?: (context: CommandContext) => boolean;
}

/**
 * 解析后的按键信息
 */
export interface ParsedKeybinding {
  /** 主键 */
  key: string;
  /** 是否包含 Ctrl */
  ctrl: boolean;
  /** 是否包含 Shift */
  shift: boolean;
  /** 是否包含 Alt */
  alt: boolean;
  /** 是否包含 Meta（Cmd on Mac） */
  meta: boolean;
  /** 原始字符串 */
  raw: string;
}

/**
 * 快捷键映射表
 */
export interface Keymap {
  /** 快捷键定义列表 */
  bindings: Keybinding[];
  /** 此快捷键映射的名称 */
  name?: string;
  /** 描述 */
  description?: string;
}

/**
 * 命令执行选项
 */
export interface CommandExecuteOptions {
  /** 是否记录到历史 */
  recordHistory?: boolean;
  /** 是否跳过权限检查 */
  skipPermissionCheck?: boolean;
  /** 是否强制刷新视图 */
  forceUpdate?: boolean;
  /** 自定义上下文 */
  customContext?: Partial<CommandContext>;
}

/**
 * 命令管理器配置
 */
export interface CommandManagerOptions {
  /** 历史记录配置 */
  history?: CommandHistoryOptions;
  /** 是否启用快捷键 */
  enableKeymap?: boolean;
  /** 默认快捷键映射 */
  defaultKeymap?: Keymap;
}

/**
 * 命令注册信息
 */
export interface CommandRegistration {
  /** 命令实例 */
  command: Command;
  /** 注册时间 */
  registeredAt: number;
  /** 来源插件（如果有） */
  pluginId?: string;
}

/**
 * 文本格式类型
 */
export enum TextFormat {
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  STRIKETHROUGH = 'strikethrough',
  CODE = 'code',
  SUPERSCRIPT = 'superscript',
  SUBSCRIPT = 'subscript',
  LINK = 'link',
  COLOR = 'color',
  BACKGROUND_COLOR = 'backgroundColor',
  FONT_SIZE = 'fontSize',
  FONT_FAMILY = 'fontFamily',
  HIGHLIGHT = 'highlight',
}

/**
 * 块类型
 */
export enum BlockType {
  PARAGRAPH = 'paragraph',
  HEADING_1 = 'heading-1',
  HEADING_2 = 'heading-2',
  HEADING_3 = 'heading-3',
  HEADING_4 = 'heading-4',
  HEADING_5 = 'heading-5',
  HEADING_6 = 'heading-6',
  BLOCKQUOTE = 'blockquote',
  CODE_BLOCK = 'code-block',
  HORIZONTAL_RULE = 'horizontal-rule',
  DIV = 'div',
}

/**
 * 列表类型
 */
export enum ListType {
  BULLET = 'bullet',
  ORDERED = 'ordered',
  TASK = 'task',
  TOGGLE = 'toggle',
}

/**
 * 对齐方式
 */
export enum Alignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}
