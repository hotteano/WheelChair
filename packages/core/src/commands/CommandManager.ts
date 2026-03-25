/**
 * WheelChair 命令管理器
 * 
 * 管理命令的注册、执行、历史记录和撤销/重做功能
 */

import {
  Command,
  CommandContext,
  CommandResult,
  CommandHistoryItem,
  CommandHistoryOptions,
  CommandManagerOptions,
  CommandRegistration,
  CommandExecuteOptions,
} from './types';

/**
 * 默认历史记录配置
 */
const DEFAULT_HISTORY_OPTIONS: CommandHistoryOptions = {
  maxHistorySize: 100,
  mergeConsecutive: true,
  mergeWindow: 500,
  ignoreCommands: [],
};

/**
 * 默认命令管理器配置
 */
const DEFAULT_OPTIONS: CommandManagerOptions = {
  history: DEFAULT_HISTORY_OPTIONS,
  enableKeymap: true,
};

/**
 * 命令管理器类
 */
export class CommandManager {
  /** 已注册的命令映射表 */
  private commands: Map<string, CommandRegistration> = new Map();
  
  /** 命令历史记录 */
  private history: CommandHistoryItem[] = [];
  
  /** 当前历史位置 */
  private historyIndex: number = -1;
  
  /** 配置选项 */
  private options: CommandManagerOptions;
  
  /** 是否正在执行撤销/重做操作 */
  private isUndoingOrRedoing: boolean = false;
  
  /** 最后执行的命令时间戳 */
  private lastCommandTime: number = 0;
  
  /** 最后执行的命令ID */
  private lastCommandId: string = '';

  constructor(options: CommandManagerOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      history: {
        ...DEFAULT_HISTORY_OPTIONS,
        ...options.history,
      },
    };
  }

  /**
   * 注册命令
   * @param command 命令实例
   * @param pluginId 来源插件ID（可选）
   * @returns 是否注册成功
   */
  register(command: Command, pluginId?: string): boolean {
    if (this.commands.has(command.id)) {
      console.warn(`[CommandManager] Command "${command.id}" is already registered.`);
      return false;
    }

    this.commands.set(command.id, {
      command,
      registeredAt: Date.now(),
      pluginId,
    });

    return true;
  }

  /**
   * 批量注册命令
   * @param commands 命令实例数组
   * @param pluginId 来源插件ID（可选）
   * @returns 注册成功的命令数量
   */
  registerMany(commands: Command[], pluginId?: string): number {
    let successCount = 0;
    for (const command of commands) {
      if (this.register(command, pluginId)) {
        successCount++;
      }
    }
    return successCount;
  }

  /**
   * 注销命令
   * @param commandId 命令ID
   * @returns 是否注销成功
   */
  unregister(commandId: string): boolean {
    return this.commands.delete(commandId);
  }

  /**
   * 批量注销命令
   * @param commandIds 命令ID数组
   * @returns 注销成功的命令数量
   */
  unregisterMany(commandIds: string[]): number {
    let successCount = 0;
    for (const id of commandIds) {
      if (this.unregister(id)) {
        successCount++;
      }
    }
    return successCount;
  }

  /**
   * 根据插件ID注销所有命令
   * @param pluginId 插件ID
   * @returns 注销的命令数量
   */
  unregisterByPlugin(pluginId: string): number {
    const toRemove: string[] = [];
    for (const [id, registration] of this.commands.entries()) {
      if (registration.pluginId === pluginId) {
        toRemove.push(id);
      }
    }
    return this.unregisterMany(toRemove);
  }

  /**
   * 获取已注册的命令
   * @param commandId 命令ID
   * @returns 命令实例或 undefined
   */
  getCommand(commandId: string): Command | undefined {
    return this.commands.get(commandId)?.command;
  }

  /**
   * 获取所有已注册的命令
   * @returns 命令实例数组
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values()).map(reg => reg.command);
  }

  /**
   * 检查命令是否已注册
   * @param commandId 命令ID
   * @returns 是否已注册
   */
  hasCommand(commandId: string): boolean {
    return this.commands.has(commandId);
  }

  /**
   * 按分类获取命令
   * @param category 命令分类
   * @returns 命令实例数组
   */
  getCommandsByCategory(category: string): Command[] {
    return this.getAllCommands().filter(cmd => cmd.category === category);
  }

  /**
   * 获取命令数量
   * @returns 已注册命令数量
   */
  getCommandCount(): number {
    return this.commands.size;
  }

  /**
   * 执行命令
   * @param commandId 命令ID
   * @param context 命令上下文
   * @param args 命令参数
   * @param options 执行选项
   * @returns 命令执行结果
   */
  async execute(
    commandId: string,
    context: CommandContext,
    args: any[] = [],
    options: CommandExecuteOptions = {}
  ): Promise<CommandResult> {
    const command = this.getCommand(commandId);
    
    if (!command) {
      return {
        success: false,
        message: `Command "${commandId}" not found.`,
      };
    }

    // 检查命令是否可用
    if (command.isEnabled && !command.isEnabled(context)) {
      return {
        success: false,
        message: `Command "${commandId}" is not enabled in current context.`,
      };
    }

    try {
      // 执行命令
      const result = await command.execute(context, ...args);

      // 记录历史
      if (result.success && 
          result.undoable !== false && 
          command.undoable !== false &&
          options.recordHistory !== false &&
          !this.isUndoingOrRedoing) {
        this.recordHistory(command, args, result, context);
      }

      return result;
    } catch (error) {
      console.error(`[CommandManager] Error executing command "${commandId}":`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred.',
      };
    }
  }

  /**
   * 执行命令（同步版本）
   * @param commandId 命令ID
   * @param context 命令上下文
   * @param args 命令参数
   * @param options 执行选项
   * @returns 命令执行结果
   */
  executeSync(
    commandId: string,
    context: CommandContext,
    args: any[] = [],
    options: CommandExecuteOptions = {}
  ): CommandResult {
    const command = this.getCommand(commandId);
    
    if (!command) {
      return {
        success: false,
        message: `Command "${commandId}" not found.`,
      };
    }

    if (command.isEnabled && !command.isEnabled(context)) {
      return {
        success: false,
        message: `Command "${commandId}" is not enabled in current context.`,
      };
    }

    try {
      const result = command.execute(context, ...args) as CommandResult;

      if (result.success && 
          result.undoable !== false && 
          command.undoable !== false &&
          options.recordHistory !== false &&
          !this.isUndoingOrRedoing) {
        this.recordHistory(command, args, result, context);
      }

      return result;
    } catch (error) {
      console.error(`[CommandManager] Error executing command "${commandId}":`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred.',
      };
    }
  }

  /**
   * 记录命令历史
   * @param command 执行的命令
   * @param args 命令参数
   * @param result 执行结果
   * @param context 命令上下文
   */
  private recordHistory(
    command: Command,
    args: any[],
    result: CommandResult,
    context: CommandContext
  ): void {
    const historyOptions = this.options.history!;
    const now = Date.now();

    // 检查是否应该合并连续的命令
    if (historyOptions.mergeConsecutive &&
        command.id === this.lastCommandId &&
        now - this.lastCommandTime < historyOptions.mergeWindow!) {
      // 更新最后一条历史记录
      if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
        this.history[this.historyIndex] = {
          ...this.history[this.historyIndex],
          args,
          result,
          timestamp: now,
        };
        this.lastCommandTime = now;
        return;
      }
    }

    // 删除当前位置之后的历史（当执行新命令时）
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // 创建新的历史记录
    const historyItem: CommandHistoryItem = {
      id: `history-${now}-${Math.random().toString(36).substr(2, 9)}`,
      command,
      args,
      result,
      timestamp: now,
    };

    // 添加到历史记录
    this.history.push(historyItem);
    this.historyIndex++;

    // 限制历史记录数量
    if (this.history.length > historyOptions.maxHistorySize!) {
      this.history.shift();
      this.historyIndex--;
    }

    this.lastCommandTime = now;
    this.lastCommandId = command.id;
  }

  /**
   * 撤销上一次操作
   * @param context 命令上下文
   * @returns 撤销结果
   */
  async undo(context: CommandContext): Promise<CommandResult> {
    if (!this.canUndo()) {
      return {
        success: false,
        message: 'Nothing to undo.',
      };
    }

    this.isUndoingOrRedoing = true;

    try {
      const historyItem = this.history[this.historyIndex];
      const { command, args, result } = historyItem;

      let undoResult: CommandResult;

      if (command.undo) {
        // 使用命令自定义的撤销方法
        undoResult = await command.undo(context, result.undoData);
      } else {
        // 默认撤销行为：返回成功状态
        undoResult = {
          success: true,
          message: `Undid: ${command.name}`,
        };
      }

      if (undoResult.success) {
        this.historyIndex--;
      }

      return undoResult;
    } finally {
      this.isUndoingOrRedoing = false;
    }
  }

  /**
   * 重做上一次撤销的操作
   * @param context 命令上下文
   * @returns 重做结果
   */
  async redo(context: CommandContext): Promise<CommandResult> {
    if (!this.canRedo()) {
      return {
        success: false,
        message: 'Nothing to redo.',
      };
    }

    this.isUndoingOrRedoing = true;

    try {
      const historyItem = this.history[this.historyIndex + 1];
      const { command, args, result } = historyItem;

      let redoResult: CommandResult;

      if (command.redo) {
        // 使用命令自定义的重做方法
        redoResult = await command.redo(context, result.undoData);
      } else {
        // 默认重做行为：重新执行命令
        redoResult = await command.execute(context, ...args);
      }

      if (redoResult.success) {
        this.historyIndex++;
      }

      return redoResult;
    } finally {
      this.isUndoingOrRedoing = false;
    }
  }

  /**
   * 检查是否可以撤销
   * @returns 是否可以撤销
   */
  canUndo(): boolean {
    return this.historyIndex >= 0;
  }

  /**
   * 检查是否可以重做
   * @returns 是否可以重做
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * 获取历史记录数量
   * @returns 历史记录数量
   */
  getHistorySize(): number {
    return this.history.length;
  }

  /**
   * 获取当前历史位置
   * @returns 当前历史位置索引
   */
  getHistoryIndex(): number {
    return this.historyIndex;
  }

  /**
   * 获取历史记录列表
   * @returns 历史记录数组
   */
  getHistory(): CommandHistoryItem[] {
    return [...this.history];
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
    this.lastCommandTime = 0;
    this.lastCommandId = '';
  }

  /**
   * 获取指定数量的历史记录
   * @param count 数量
   * @returns 历史记录数组
   */
  getRecentHistory(count: number): CommandHistoryItem[] {
    return this.history.slice(-count);
  }

  /**
   * 销毁命令管理器
   * 清理所有注册和历史记录
   */
  destroy(): void {
    this.commands.clear();
    this.clearHistory();
  }
}

/**
 * 创建命令管理器的工厂函数
 * @param options 配置选项
 * @returns CommandManager 实例
 */
export function createCommandManager(options?: CommandManagerOptions): CommandManager {
  return new CommandManager(options);
}

/**
 * 全局命令管理器实例（单例）
 */
let globalCommandManager: CommandManager | null = null;

/**
 * 获取全局命令管理器实例
 * @returns CommandManager 实例
 */
export function getGlobalCommandManager(): CommandManager {
  if (!globalCommandManager) {
    globalCommandManager = new CommandManager();
  }
  return globalCommandManager;
}

/**
 * 设置全局命令管理器实例
 * @param manager CommandManager 实例
 */
export function setGlobalCommandManager(manager: CommandManager): void {
  globalCommandManager = manager;
}
