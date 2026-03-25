/**
 * WheelChair 文本命令实现
 * 
 * 提供文本格式化相关的命令实现
 */

import { Command, CommandContext, CommandResult, CommandCategory, TextFormat } from '../types';

/**
 * 创建文本格式切换命令
 * @param id 命令ID
 * @param name 命令名称
 * @param format 格式类型
 * @returns Command 实例
 */
function createTextFormatCommand(
  id: string,
  name: string,
  format: TextFormat
): Command {
  return {
    id: `text.${id}`,
    name,
    description: `切换${name}格式`,
    category: CommandCategory.TEXT_FORMAT,
    undoable: true,

    execute(context: CommandContext): CommandResult {
      const hasFormat = context.hasFormat(format);
      
      if (hasFormat) {
        context.removeFormat(format);
      } else {
        context.applyFormat(format);
      }

      return {
        success: true,
        undoData: { format, wasActive: hasFormat },
        stateChanged: true,
      };
    },

    undo(context: CommandContext, undoData: { format: TextFormat; wasActive: boolean }): CommandResult {
      if (undoData.wasActive) {
        context.applyFormat(undoData.format);
      } else {
        context.removeFormat(undoData.format);
      }

      return {
        success: true,
        stateChanged: true,
      };
    },

    isActive(context: CommandContext): boolean {
      return context.hasFormat(format);
    },

    isEnabled(context: CommandContext): boolean {
      // 检查是否有选区
      const selection = context.getSelection();
      return selection !== null && !selection.isCollapsed;
    },
  };
}

/**
 * 粗体命令
 */
export const BoldCommand: Command = createTextFormatCommand(
  'bold',
  '粗体',
  TextFormat.BOLD
);

/**
 * 斜体命令
 */
export const ItalicCommand: Command = createTextFormatCommand(
  'italic',
  '斜体',
  TextFormat.ITALIC
);

/**
 * 下划线命令
 */
export const UnderlineCommand: Command = createTextFormatCommand(
  'underline',
  '下划线',
  TextFormat.UNDERLINE
);

/**
 * 删除线命令
 */
export const StrikethroughCommand: Command = createTextFormatCommand(
  'strikethrough',
  '删除线',
  TextFormat.STRIKETHROUGH
);

/**
 * 行内代码命令
 */
export const CodeCommand: Command = createTextFormatCommand(
  'code',
  '行内代码',
  TextFormat.CODE
);

/**
 * 上标命令
 */
export const SuperscriptCommand: Command = createTextFormatCommand(
  'superscript',
  '上标',
  TextFormat.SUPERSCRIPT
);

/**
 * 下标命令
 */
export const SubscriptCommand: Command = createTextFormatCommand(
  'subscript',
  '下标',
  TextFormat.SUBSCRIPT
);

/**
 * 链接命令
 */
export const LinkCommand: Command = {
  id: 'text.link',
  name: '链接',
  description: '添加或编辑链接',
  category: CommandCategory.TEXT_FORMAT,
  undoable: true,

  execute(context: CommandContext, url?: string, text?: string): CommandResult {
    const selection = context.getSelection();
    const selectedText = context.getSelectedText();
    
    // 如果没有选中文本，使用传入的文本或链接地址
    const linkText = selectedText || text || url || '';
    
    if (!linkText) {
      return {
        success: false,
        message: '请先选中文本或输入链接地址',
      };
    }

    const linkUrl = url || 'https://';

    // 应用链接格式
    context.applyFormat(TextFormat.LINK, { url: linkUrl, text: linkText });

    return {
      success: true,
      undoData: { url: linkUrl, text: linkText, previousSelection: selection?.toString() },
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: any): CommandResult {
    context.removeFormat(TextFormat.LINK);
    return {
      success: true,
      stateChanged: true,
    };
  },

  isActive(context: CommandContext): boolean {
    return context.hasFormat(TextFormat.LINK);
  },

  isEnabled(context: CommandContext): boolean {
    return true;
  },
};

/**
 * 清除格式命令
 */
export const RemoveFormatCommand: Command = {
  id: 'text.removeFormat',
  name: '清除格式',
  description: '清除选中文本的所有格式',
  category: CommandCategory.TEXT_FORMAT,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const selection = context.getSelection();
    
    if (!selection || selection.isCollapsed) {
      return {
        success: false,
        message: '请先选中文本',
      };
    }

    // 保存之前的格式信息用于撤销
    const beforeState = {
      selection: selection.toString(),
      formats: [] as TextFormat[],
    };

    // 获取所有格式
    const allFormats = Object.values(TextFormat);
    for (const format of allFormats) {
      if (context.hasFormat(format)) {
        beforeState.formats.push(format);
      }
    }

    // 移除所有格式
    for (const format of beforeState.formats) {
      context.removeFormat(format);
    }

    return {
      success: true,
      undoData: beforeState,
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { formats: TextFormat[]; selection: string }): CommandResult {
    // 恢复之前的格式
    for (const format of undoData.formats) {
      context.applyFormat(format);
    }

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    const selection = context.getSelection();
    return selection !== null && !selection.isCollapsed;
  },
};

/**
 * 设置文本颜色命令
 */
export const SetColorCommand: Command = {
  id: 'text.setColor',
  name: '设置文本颜色',
  description: '设置选中文本的颜色',
  category: CommandCategory.TEXT_FORMAT,
  undoable: true,

  execute(context: CommandContext, color: string): CommandResult {
    if (!color) {
      return {
        success: false,
        message: '请指定颜色值',
      };
    }

    const previousColor = context.hasFormat(TextFormat.COLOR) ? 
      context.state.getFormatValue?.(TextFormat.COLOR) : null;

    context.applyFormat(TextFormat.COLOR, color);

    return {
      success: true,
      undoData: { color, previousColor },
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { previousColor: string | null }): CommandResult {
    if (undoData.previousColor) {
      context.applyFormat(TextFormat.COLOR, undoData.previousColor);
    } else {
      context.removeFormat(TextFormat.COLOR);
    }

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    return true;
  },
};

/**
 * 设置背景颜色命令
 */
export const SetBackgroundColorCommand: Command = {
  id: 'text.setBackgroundColor',
  name: '设置背景颜色',
  description: '设置选中文本的背景颜色',
  category: CommandCategory.TEXT_FORMAT,
  undoable: true,

  execute(context: CommandContext, color: string): CommandResult {
    if (!color) {
      return {
        success: false,
        message: '请指定背景颜色值',
      };
    }

    const previousColor = context.hasFormat(TextFormat.BACKGROUND_COLOR) ? 
      context.state.getFormatValue?.(TextFormat.BACKGROUND_COLOR) : null;

    context.applyFormat(TextFormat.BACKGROUND_COLOR, color);

    return {
      success: true,
      undoData: { color, previousColor },
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { previousColor: string | null }): CommandResult {
    if (undoData.previousColor) {
      context.applyFormat(TextFormat.BACKGROUND_COLOR, undoData.previousColor);
    } else {
      context.removeFormat(TextFormat.BACKGROUND_COLOR);
    }

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    return true;
  },
};

/**
 * 设置字体大小命令
 */
export const SetFontSizeCommand: Command = {
  id: 'text.setFontSize',
  name: '设置字体大小',
  description: '设置选中文本的字体大小',
  category: CommandCategory.TEXT_FORMAT,
  undoable: true,

  execute(context: CommandContext, size: string | number): CommandResult {
    if (!size) {
      return {
        success: false,
        message: '请指定字体大小',
      };
    }

    const sizeValue = typeof size === 'number' ? `${size}px` : size;
    const previousSize = context.hasFormat(TextFormat.FONT_SIZE) ? 
      context.state.getFormatValue?.(TextFormat.FONT_SIZE) : null;

    context.applyFormat(TextFormat.FONT_SIZE, sizeValue);

    return {
      success: true,
      undoData: { size: sizeValue, previousSize },
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { previousSize: string | null }): CommandResult {
    if (undoData.previousSize) {
      context.applyFormat(TextFormat.FONT_SIZE, undoData.previousSize);
    } else {
      context.removeFormat(TextFormat.FONT_SIZE);
    }

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    return true;
  },
};

/**
 * 高亮文本命令
 */
export const HighlightCommand: Command = {
  id: 'text.highlight',
  name: '高亮',
  description: '高亮选中文本',
  category: CommandCategory.TEXT_FORMAT,
  undoable: true,

  execute(context: CommandContext, color: string = '#ffeb3b'): CommandResult {
    const hasHighlight = context.hasFormat(TextFormat.HIGHLIGHT);

    if (hasHighlight) {
      context.removeFormat(TextFormat.HIGHLIGHT);
    } else {
      context.applyFormat(TextFormat.HIGHLIGHT, color);
    }

    return {
      success: true,
      undoData: { wasActive: hasHighlight, color },
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { wasActive: boolean; color: string }): CommandResult {
    if (undoData.wasActive) {
      context.applyFormat(TextFormat.HIGHLIGHT, undoData.color);
    } else {
      context.removeFormat(TextFormat.HIGHLIGHT);
    }

    return {
      success: true,
      stateChanged: true,
    };
  },

  isActive(context: CommandContext): boolean {
    return context.hasFormat(TextFormat.HIGHLIGHT);
  },

  isEnabled(context: CommandContext): boolean {
    return true;
  },
};

/**
 * 获取所有文本命令
 */
export function getAllTextCommands(): Command[] {
  return [
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
  ];
}

/**
 * 将文本命令注册到命令管理器
 * @param commandManager 命令管理器实例
 */
export function registerTextCommands(commandManager: { register: (cmd: Command) => boolean }): void {
  const commands = getAllTextCommands();
  for (const command of commands) {
    commandManager.register(command);
  }
}
