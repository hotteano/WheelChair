/**
 * WheelChair 历史命令实现
 * 
 * 提供撤销、重做等历史操作相关的命令实现
 */

import { Command, CommandContext, CommandResult, CommandCategory } from '../types';
import { CommandManager } from '../CommandManager';

/**
 * 撤销命令
 */
export function createUndoCommand(commandManager: CommandManager): Command {
  return {
    id: 'history.undo',
    name: '撤销',
    description: '撤销上一步操作',
    category: CommandCategory.HISTORY,
    undoable: false, // 撤销操作本身不需要再撤销

    async execute(_context: CommandContext): Promise<CommandResult> {
      return await commandManager.undo(_context);
    },

    isEnabled(): boolean {
      return commandManager.canUndo();
    },
  };
}

/**
 * 重做命令
 */
export function createRedoCommand(commandManager: CommandManager): Command {
  return {
    id: 'history.redo',
    name: '重做',
    description: '重做上一步撤销的操作',
    category: CommandCategory.HISTORY,
    undoable: false, // 重做操作本身不需要再撤销

    async execute(_context: CommandContext): Promise<CommandResult> {
      return await commandManager.redo(_context);
    },

    isEnabled(): boolean {
      return commandManager.canRedo();
    },
  };
}

/**
 * 清除历史命令
 */
export function createClearHistoryCommand(commandManager: CommandManager): Command {
  return {
    id: 'history.clear',
    name: '清除历史',
    description: '清除所有历史记录',
    category: CommandCategory.HISTORY,
    undoable: false,

    execute(): CommandResult {
      commandManager.clearHistory();

      return {
        success: true,
        message: '历史记录已清除',
        stateChanged: false,
      };
    },

    isEnabled(): boolean {
      return commandManager.getHistorySize() > 0;
    },
  };
}

/**
 * 批量撤销命令
 * 一次性撤销多步操作
 */
export function createUndoMultipleCommand(commandManager: CommandManager): Command {
  return {
    id: 'history.undoMultiple',
    name: '批量撤销',
    description: '撤销指定步数的操作',
    category: CommandCategory.HISTORY,
    undoable: false,

    async execute(_context: CommandContext, steps: number = 1): Promise<CommandResult> {
      const actualSteps = Math.min(steps, commandManager.getHistorySize());
      
      if (actualSteps <= 0) {
        return {
          success: false,
          message: '没有可撤销的操作',
        };
      }

      let successCount = 0;
      for (let i = 0; i < actualSteps; i++) {
        const result = await commandManager.undo(_context);
        if (result.success) {
          successCount++;
        } else {
          break;
        }
      }

      return {
        success: successCount > 0,
        message: `成功撤销 ${successCount} 步操作`,
        stateChanged: successCount > 0,
      };
    },

    isEnabled(): boolean {
      return commandManager.canUndo();
    },
  };
}

/**
 * 批量重做命令
 * 一次性重做多步操作
 */
export function createRedoMultipleCommand(commandManager: CommandManager): Command {
  return {
    id: 'history.redoMultiple',
    name: '批量重做',
    description: '重做指定步数的操作',
    category: CommandCategory.HISTORY,
    undoable: false,

    async execute(_context: CommandContext, steps: number = 1): Promise<CommandResult> {
      const historySize = commandManager.getHistorySize();
      const currentIndex = commandManager.getHistoryIndex();
      const redoSteps = historySize - currentIndex - 1;
      const actualSteps = Math.min(steps, redoSteps);

      if (actualSteps <= 0) {
        return {
          success: false,
          message: '没有可重做的操作',
        };
      }

      let successCount = 0;
      for (let i = 0; i < actualSteps; i++) {
        const result = await commandManager.redo(_context);
        if (result.success) {
          successCount++;
        } else {
          break;
        }
      }

      return {
        success: successCount > 0,
        message: `成功重做 ${successCount} 步操作`,
        stateChanged: successCount > 0,
      };
    },

    isEnabled(): boolean {
      return commandManager.canRedo();
    },
  };
}

/**
 * 历史记录管理命令
 * 用于跳转到特定的历史状态
 */
export function createGotoHistoryCommand(commandManager: CommandManager): Command {
  return {
    id: 'history.goto',
    name: '跳转到历史状态',
    description: '跳转到指定的历史状态',
    category: CommandCategory.HISTORY,
    undoable: false,

    async execute(_context: CommandContext, targetIndex: number): Promise<CommandResult> {
      const currentIndex = commandManager.getHistoryIndex();
      const historySize = commandManager.getHistorySize();

      if (targetIndex < -1 || targetIndex >= historySize) {
        return {
          success: false,
          message: '无效的历史状态索引',
        };
      }

      if (targetIndex === currentIndex) {
        return {
          success: true,
          message: '已经在目标状态',
          stateChanged: false,
        };
      }

      // 撤销到目标状态
      if (targetIndex < currentIndex) {
        const steps = currentIndex - targetIndex;
        return await commandManager.execute('history.undoMultiple', _context, [steps]);
      }

      // 重做回目标状态
      const steps = targetIndex - currentIndex;
      return await commandManager.execute('history.redoMultiple', _context, [steps]);
    },

    isEnabled(): boolean {
      return commandManager.getHistorySize() > 0;
    },
  };
}

/**
 * 历史快照命令
 * 创建当前状态的快照
 */
export function createSnapshotCommand(_commandManager: CommandManager): Command {
  return {
    id: 'history.snapshot',
    name: '创建快照',
    description: '创建当前文档状态的快照',
    category: CommandCategory.HISTORY,
    undoable: false,

    execute(_context: CommandContext, name?: string): CommandResult {
      // 这里可以实现快照功能，将当前状态保存到快照列表
      const snapshot = {
        id: `snapshot-${Date.now()}`,
        name: name || `快照 ${new Date().toLocaleString()}`,
        timestamp: Date.now(),
        state: _context.state,
      };

      // 保存快照到某个存储中
      // saveSnapshot(snapshot);

      return {
        success: true,
        message: `已创建快照: ${snapshot.name}`,
        stateChanged: false,
      };
    },

    isEnabled(): boolean {
      return true;
    },
  };
}

/**
 * 获取所有历史命令
 * @param commandManager 命令管理器实例
 */
export function getAllHistoryCommands(commandManager: CommandManager): Command[] {
  return [
    createUndoCommand(commandManager),
    createRedoCommand(commandManager),
    createClearHistoryCommand(commandManager),
    createUndoMultipleCommand(commandManager),
    createRedoMultipleCommand(commandManager),
    createGotoHistoryCommand(commandManager),
    createSnapshotCommand(commandManager),
  ];
}

/**
 * 将历史命令注册到命令管理器
 * @param commandManager 命令管理器实例
 */
export function registerHistoryCommands(commandManager: CommandManager): void {
  const commands = getAllHistoryCommands(commandManager);
  for (const command of commands) {
    commandManager.register(command);
  }
}
