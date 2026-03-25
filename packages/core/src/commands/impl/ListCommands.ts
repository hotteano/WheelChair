/**
 * WheelChair 列表命令实现
 * 
 * 提供列表操作相关的命令实现
 */

import { Command, CommandContext, CommandResult, CommandCategory, ListType } from '../types';

/**
 * 创建列表类型转换命令
 * @param id 命令ID后缀
 * @param name 命令名称
 * @param listType 列表类型
 * @returns Command 实例
 */
function createListTypeCommand(
  id: string,
  name: string,
  listType: ListType
): Command {
  return {
    id: `list.${id}`,
    name,
    description: `转换为或创建${name}`,
    category: CommandCategory.LIST,
    undoable: true,

    execute(context: CommandContext): CommandResult {
      const previousState = {
        wasList: context.getCurrentBlockType().startsWith('list-'),
        previousType: context.getCurrentBlockType(),
      };

      context.setBlockType(`list-${listType}`, { type: listType });

      return {
        success: true,
        undoData: previousState,
        stateChanged: true,
      };
    },

    undo(context: CommandContext, undoData: { wasList: boolean; previousType: string }): CommandResult {
      if (undoData.wasList) {
        context.setBlockType(undoData.previousType);
      } else {
        context.setBlockType('paragraph');
      }

      return {
        success: true,
        stateChanged: true,
      };
    },

    isActive(context: CommandContext): boolean {
      return context.getCurrentBlockType() === `list-${listType}`;
    },

    isEnabled(context: CommandContext): boolean {
      return true;
    },
  };
}

/**
 * 无序列表命令
 */
export const BulletListCommand: Command = createListTypeCommand(
  'bullet',
  '无序列表',
  ListType.BULLET
);

/**
 * 有序列表命令
 */
export const OrderedListCommand: Command = createListTypeCommand(
  'ordered',
  '有序列表',
  ListType.ORDERED
);

/**
 * 任务列表命令
 */
export const TaskListCommand: Command = createListTypeCommand(
  'task',
  '任务列表',
  ListType.TASK
);

/**
 * 切换列表折叠状态命令（用于任务列表和折叠列表）
 */
export const ToggleListFoldCommand: Command = {
  id: 'list.toggleFold',
  name: '切换列表折叠',
  description: '切换列表项的折叠状态',
  category: CommandCategory.LIST,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const isFolded = context.state.getBlockAttribute?.('folded') || false;
    
    context.state.setBlockAttribute?.('folded', !isFolded);

    return {
      success: true,
      undoData: { wasFolded: isFolded },
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { wasFolded: boolean }): CommandResult {
    context.state.setBlockAttribute?.('folded', undoData.wasFolded);

    return {
      success: true,
      stateChanged: true,
    };
  },

  isActive(context: CommandContext): boolean {
    return context.state.getBlockAttribute?.('folded') === true;
  },

  isEnabled(context: CommandContext): boolean {
    const blockType = context.getCurrentBlockType();
    return blockType.startsWith('list-') || blockType === ListType.TOGGLE;
  },
};

/**
 * 切换复选框状态命令（用于任务列表）
 */
export const ToggleCheckboxCommand: Command = {
  id: 'list.toggleCheckbox',
  name: '切换复选框',
  description: '切换任务列表项的完成状态',
  category: CommandCategory.LIST,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const isChecked = context.state.getBlockAttribute?.('checked') || false;

    context.state.setBlockAttribute?.('checked', !isChecked);

    return {
      success: true,
      undoData: { wasChecked: isChecked },
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { wasChecked: boolean }): CommandResult {
    context.state.setBlockAttribute?.('checked', undoData.wasChecked);

    return {
      success: true,
      stateChanged: true,
    };
  },

  isActive(context: CommandContext): boolean {
    return context.state.getBlockAttribute?.('checked') === true;
  },

  isEnabled(context: CommandContext): boolean {
    return context.getCurrentBlockType() === `list-${ListType.TASK}`;
  },
};

/**
 * 增加列表缩进命令
 */
export const IndentListCommand: Command = {
  id: 'list.indent',
  name: '增加缩进',
  description: '增加列表项的缩进级别',
  category: CommandCategory.LIST,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const currentIndent = context.state.getBlockAttribute?.('indent') || 0;
    const maxIndent = 8;

    if (currentIndent >= maxIndent) {
      return {
        success: false,
        message: '已达到最大缩进级别',
      };
    }

    context.state.setBlockAttribute?.('indent', currentIndent + 1);

    return {
      success: true,
      undoData: { previousIndent: currentIndent },
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { previousIndent: number }): CommandResult {
    context.state.setBlockAttribute?.('indent', undoData.previousIndent);

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    const blockType = context.getCurrentBlockType();
    const currentIndent = context.state.getBlockAttribute?.('indent') || 0;
    return blockType.startsWith('list-') && currentIndent < 8;
  },
};

/**
 * 减少列表缩进命令
 */
export const OutdentListCommand: Command = {
  id: 'list.outdent',
  name: '减少缩进',
  description: '减少列表项的缩进级别',
  category: CommandCategory.LIST,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const currentIndent = context.state.getBlockAttribute?.('indent') || 0;

    if (currentIndent <= 0) {
      return {
        success: false,
        message: '当前没有缩进',
      };
    }

    context.state.setBlockAttribute?.('indent', currentIndent - 1);

    return {
      success: true,
      undoData: { previousIndent: currentIndent },
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { previousIndent: number }): CommandResult {
    context.state.setBlockAttribute?.('indent', undoData.previousIndent);

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    const currentIndent = context.state.getBlockAttribute?.('indent') || 0;
    return currentIndent > 0;
  },
};

/**
 * 在当前列表项上方插入新项命令
 */
export const InsertListItemBeforeCommand: Command = {
  id: 'list.insertItemBefore',
  name: '上方插入列表项',
  description: '在当前列表项上方插入新项',
  category: CommandCategory.LIST,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const blockType = context.getCurrentBlockType();
    
    if (!blockType.startsWith('list-')) {
      return {
        success: false,
        message: '当前不是列表项',
      };
    }

    // 插入新列表项
    context.insertText('\n');
    context.setBlockType(blockType);

    return {
      success: true,
      undoData: {},
      stateChanged: true,
    };
  },

  undo(context: CommandContext): CommandResult {
    // 删除刚插入的项
    context.deleteSelection();

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    return context.getCurrentBlockType().startsWith('list-');
  },
};

/**
 * 在当前列表项下方插入新项命令
 */
export const InsertListItemAfterCommand: Command = {
  id: 'list.insertItemAfter',
  name: '下方插入列表项',
  description: '在当前列表项下方插入新项',
  category: CommandCategory.LIST,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const blockType = context.getCurrentBlockType();
    
    if (!blockType.startsWith('list-')) {
      return {
        success: false,
        message: '当前不是列表项',
      };
    }

    // 移到行尾并插入新列表项
    context.insertText('\n');
    context.setBlockType(blockType);

    return {
      success: true,
      undoData: {},
      stateChanged: true,
    };
  },

  undo(context: CommandContext): CommandResult {
    context.deleteSelection();

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    return context.getCurrentBlockType().startsWith('list-');
  },
};

/**
 * 分割列表项命令
 * 在当前光标位置分割列表项
 */
export const SplitListItemCommand: Command = {
  id: 'list.splitItem',
  name: '分割列表项',
  description: '在当前光标位置将列表项分割为两项',
  category: CommandCategory.LIST,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const blockType = context.getCurrentBlockType();
    
    if (!blockType.startsWith('list-')) {
      return {
        success: false,
        message: '当前不是列表项',
      };
    }

    const selection = context.getSelection();
    if (!selection) {
      return {
        success: false,
        message: '无法获取选区',
      };
    }

    // 分割列表项
    context.insertText('\n');
    context.setBlockType(blockType);

    return {
      success: true,
      undoData: { selection: selection.toString() },
      stateChanged: true,
    };
  },

  undo(context: CommandContext): CommandResult {
    // 合并分割的项
    context.deleteSelection();

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    return context.getCurrentBlockType().startsWith('list-');
  },
};

/**
 * 移除列表并转换为段落命令
 */
export const RemoveListCommand: Command = {
  id: 'list.remove',
  name: '移除列表',
  description: '将当前列表项转换为普通段落',
  category: CommandCategory.LIST,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const blockType = context.getCurrentBlockType();
    
    if (!blockType.startsWith('list-')) {
      return {
        success: false,
        message: '当前不是列表项',
      };
    }

    const previousState = {
      listType: blockType,
      indent: context.state.getBlockAttribute?.('indent') || 0,
    };

    context.setBlockType('paragraph');
    context.state.removeBlockAttribute?.('indent');

    return {
      success: true,
      undoData: previousState,
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { listType: string; indent: number }): CommandResult {
    context.setBlockType(undoData.listType);
    context.state.setBlockAttribute?.('indent', undoData.indent);

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    return context.getCurrentBlockType().startsWith('list-');
  },
};

/**
 * 获取所有列表命令
 */
export function getAllListCommands(): Command[] {
  return [
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
  ];
}

/**
 * 将列表命令注册到命令管理器
 * @param commandManager 命令管理器实例
 */
export function registerListCommands(commandManager: { register: (cmd: Command) => boolean }): void {
  const commands = getAllListCommands();
  for (const command of commands) {
    commandManager.register(command);
  }
}
