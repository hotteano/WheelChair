/**
 * WheelChair 块级命令实现
 * 
 * 提供块级操作相关的命令实现，包括段落转换、对齐方式等
 */

import { Command, CommandContext, CommandResult, CommandCategory, BlockType, Alignment } from '../types';

/**
 * 创建块类型转换命令
 * @param id 命令ID后缀
 * @param name 命令名称
 * @param blockType 块类型
 * @returns Command 实例
 */
function createBlockTypeCommand(
  id: string,
  name: string,
  blockType: BlockType
): Command {
  return {
    id: `block.${id}`,
    name,
    description: `将当前块转换为${name}`,
    category: CommandCategory.BLOCK,
    undoable: true,

    execute(context: CommandContext): CommandResult {
      const previousType = context.getCurrentBlockType();

      context.setBlockType(blockType);

      return {
        success: true,
        undoData: { previousType, newType: blockType },
        stateChanged: true,
      };
    },

    undo(_context: CommandContext, undoData: { previousType: string }): CommandResult {
      _context.setBlockType(undoData.previousType);

      return {
        success: true,
        stateChanged: true,
      };
    },

    isActive(_context: CommandContext): boolean {
      return _context.getCurrentBlockType() === blockType;
    },

    isEnabled(_context: CommandContext): boolean {
      return true;
    },
  };
}

/**
 * 段落命令
 */
export const ParagraphCommand: Command = createBlockTypeCommand(
  'paragraph',
  '段落',
  BlockType.PARAGRAPH
);

/**
 * 标题 1 命令
 */
export const Heading1Command: Command = createBlockTypeCommand(
  'heading-1',
  '一级标题',
  BlockType.HEADING_1
);

/**
 * 标题 2 命令
 */
export const Heading2Command: Command = createBlockTypeCommand(
  'heading-2',
  '二级标题',
  BlockType.HEADING_2
);

/**
 * 标题 3 命令
 */
export const Heading3Command: Command = createBlockTypeCommand(
  'heading-3',
  '三级标题',
  BlockType.HEADING_3
);

/**
 * 标题 4 命令
 */
export const Heading4Command: Command = createBlockTypeCommand(
  'heading-4',
  '四级标题',
  BlockType.HEADING_4
);

/**
 * 标题 5 命令
 */
export const Heading5Command: Command = createBlockTypeCommand(
  'heading-5',
  '五级标题',
  BlockType.HEADING_5
);

/**
 * 标题 6 命令
 */
export const Heading6Command: Command = createBlockTypeCommand(
  'heading-6',
  '六级标题',
  BlockType.HEADING_6
);

/**
 * 引用块命令
 */
export const BlockquoteCommand: Command = createBlockTypeCommand(
  'blockquote',
  '引用块',
  BlockType.BLOCKQUOTE
);

/**
 * 代码块命令
 */
export const CodeBlockCommand: Command = {
  id: 'block.code-block',
  name: '代码块',
  description: '将当前块转换为代码块',
  category: CommandCategory.BLOCK,
  undoable: true,

  execute(context: CommandContext, language?: string): CommandResult {
    const previousType = context.getCurrentBlockType();

    context.setBlockType(BlockType.CODE_BLOCK, { language: language || 'plain' });

    return {
      success: true,
      undoData: { previousType, language },
      stateChanged: true,
    };
  },

  undo(_context: CommandContext, undoData: { previousType: string }): CommandResult {
    _context.setBlockType(undoData.previousType);

    return {
      success: true,
      stateChanged: true,
    };
  },

  isActive(_context: CommandContext): boolean {
    return _context.getCurrentBlockType() === BlockType.CODE_BLOCK;
  },

  isEnabled(_context: CommandContext): boolean {
    return true;
  },
};

/**
 * 水平分割线命令
 */
export const HorizontalRuleCommand: Command = {
  id: 'block.horizontal-rule',
  name: '水平分割线',
  description: '插入水平分割线',
  category: CommandCategory.BLOCK,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    context.insertText('\n---\n');

    return {
      success: true,
      undoData: {},
      stateChanged: true,
    };
  },

  undo(_context: CommandContext): CommandResult {
    // 需要实现删除最近插入的分割线逻辑
    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(_context: CommandContext): boolean {
    return true;
  },
};

/**
 * 创建对齐命令
 * @param id 命令ID后缀
 * @param name 命令名称
 * @param alignment 对齐方式
 * @returns Command 实例
 */
function createAlignCommand(
  id: string,
  name: string,
  alignment: Alignment
): Command {
  return {
    id: `block.align${id}`,
    name,
    description: `将段落${name}`,
    category: CommandCategory.BLOCK,
    undoable: true,

    execute(_context: CommandContext): CommandResult {
      // 获取当前对齐方式
      const currentAlignment = _context.state.getBlockAttribute?.('alignment') || Alignment.LEFT;

      _context.state.setBlockAttribute?.('alignment', alignment);

      return {
        success: true,
        undoData: { previousAlignment: currentAlignment },
        stateChanged: true,
      };
    },

    undo(_context: CommandContext, undoData: { previousAlignment: Alignment }): CommandResult {
      _context.state.setBlockAttribute?.('alignment', undoData.previousAlignment);

      return {
        success: true,
        stateChanged: true,
      };
    },

    isActive(_context: CommandContext): boolean {
      return _context.state.getBlockAttribute?.('alignment') === alignment;
    },

    isEnabled(_context: CommandContext): boolean {
      return true;
    },
  };
}

/**
 * 左对齐命令
 */
export const AlignLeftCommand: Command = createAlignCommand(
  'Left',
  '左对齐',
  Alignment.LEFT
);

/**
 * 居中对齐命令
 */
export const AlignCenterCommand: Command = createAlignCommand(
  'Center',
  '居中对齐',
  Alignment.CENTER
);

/**
 * 右对齐命令
 */
export const AlignRightCommand: Command = createAlignCommand(
  'Right',
  '右对齐',
  Alignment.RIGHT
);

/**
 * 两端对齐命令
 */
export const AlignJustifyCommand: Command = createAlignCommand(
  'Justify',
  '两端对齐',
  Alignment.JUSTIFY
);

/**
 * 增加缩进命令
 */
export const IndentCommand: Command = {
  id: 'block.indent',
  name: '增加缩进',
  description: '增加当前块的缩进',
  category: CommandCategory.BLOCK,
  undoable: true,

  execute(_context: CommandContext): CommandResult {
    const currentIndent = _context.state.getBlockAttribute?.('indent') || 0;
    const maxIndent = 8;

    if (currentIndent >= maxIndent) {
      return {
        success: false,
        message: '已达到最大缩进级别',
      };
    }

    _context.state.setBlockAttribute?.('indent', currentIndent + 1);

    return {
      success: true,
      undoData: { previousIndent: currentIndent },
      stateChanged: true,
    };
  },

  undo(_context: CommandContext, undoData: { previousIndent: number }): CommandResult {
    _context.state.setBlockAttribute?.('indent', undoData.previousIndent);

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(_context: CommandContext): boolean {
    const currentIndent = _context.state.getBlockAttribute?.('indent') || 0;
    return currentIndent < 8;
  },
};

/**
 * 减少缩进命令
 */
export const OutdentCommand: Command = {
  id: 'block.outdent',
  name: '减少缩进',
  description: '减少当前块的缩进',
  category: CommandCategory.BLOCK,
  undoable: true,

  execute(_context: CommandContext): CommandResult {
    const currentIndent = _context.state.getBlockAttribute?.('indent') || 0;

    if (currentIndent <= 0) {
      return {
        success: false,
        message: '当前没有缩进',
      };
    }

    _context.state.setBlockAttribute?.('indent', currentIndent - 1);

    return {
      success: true,
      undoData: { previousIndent: currentIndent },
      stateChanged: true,
    };
  },

  undo(_context: CommandContext, undoData: { previousIndent: number }): CommandResult {
    _context.state.setBlockAttribute?.('indent', undoData.previousIndent);

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(_context: CommandContext): boolean {
    const currentIndent = _context.state.getBlockAttribute?.('indent') || 0;
    return currentIndent > 0;
  },
};

/**
 * 行高设置命令
 */
export const SetLineHeightCommand: Command = {
  id: 'block.setLineHeight',
  name: '设置行高',
  description: '设置段落的行高',
  category: CommandCategory.BLOCK,
  undoable: true,

  execute(_context: CommandContext, lineHeight: number | string): CommandResult {
    if (!lineHeight) {
      return {
        success: false,
        message: '请指定行高值',
      };
    }

    const previousLineHeight = _context.state.getBlockAttribute?.('lineHeight');
    _context.state.setBlockAttribute?.('lineHeight', lineHeight);

    return {
      success: true,
      undoData: { previousLineHeight },
      stateChanged: true,
    };
  },

  undo(_context: CommandContext, undoData: { previousLineHeight: any }): CommandResult {
    if (undoData.previousLineHeight) {
      _context.state.setBlockAttribute?.('lineHeight', undoData.previousLineHeight);
    } else {
      _context.state.removeBlockAttribute?.('lineHeight');
    }

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(_context: CommandContext): boolean {
    return true;
  },
};

/**
 * 获取所有块级命令
 */
export function getAllBlockCommands(): Command[] {
  return [
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
  ];
}

/**
 * 将块级命令注册到命令管理器
 * @param commandManager 命令管理器实例
 */
export function registerBlockCommands(commandManager: { register: (cmd: Command) => boolean }): void {
  const commands = getAllBlockCommands();
  for (const command of commands) {
    commandManager.register(command);
  }
}
