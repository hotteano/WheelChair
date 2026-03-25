/**
 * WheelChair 快捷键管理器
 * 
 * 管理快捷键的注册、解析、冲突检测和平台适配
 */

import {
  Keybinding,
  Keymap,
  ParsedKeybinding,
  CommandContext,
} from '../commands/types';
import { CommandManager } from '../commands/CommandManager';
import { defaultKeymap } from './defaultKeymap';

/**
 * 快捷键管理器配置选项
 */
export interface KeymapManagerOptions {
  /** 绑定的命令管理器 */
  commandManager?: CommandManager;
  /** 默认快捷键映射 */
  defaultKeymap?: Keymap;
  /** 是否启用快捷键 */
  enabled?: boolean;
  /** 是否忽略输入框内的快捷键（除特定白名单外） */
  ignoreInInput?: boolean;
  /** 白名单：在输入框内也生效的快捷键 */
  whitelistInInput?: string[];
}

/**
 * 快捷键冲突信息
 */
export interface KeybindingConflict {
  /** 快捷键组合 */
  key: string;
  /** 冲突的快捷键定义列表 */
  bindings: Keybinding[];
}

/**
 * 快捷键处理器
 */
type KeybindingHandler = (event: KeyboardEvent, context: CommandContext) => boolean | Promise<boolean>;

/**
 * 快捷键管理器类
 */
export class KeymapManager {
  /** 快捷键映射表 */
  private bindings: Map<string, Keybinding[]> = new Map();
  
  /** 解析后的快捷键缓存 */
  private parsedCache: Map<string, ParsedKeybinding> = new Map();
  
  /** 命令管理器 */
  private commandManager: CommandManager;
  
  /** 配置选项 */
  private options: Required<KeymapManagerOptions>;
  
  /** 是否已绑定到 DOM */
  private isBound: boolean = false;
  
  /** 目标 DOM 元素 */
  private targetElement?: HTMLElement | Document;
  
  /** 当前平台 */
  private platform: 'mac' | 'win' | 'linux' | 'unknown';

  constructor(options: KeymapManagerOptions = {}) {
    this.options = {
      commandManager: options.commandManager || new CommandManager(),
      defaultKeymap: options.defaultKeymap || defaultKeymap,
      enabled: options.enabled !== false,
      ignoreInInput: options.ignoreInInput !== false,
      whitelistInInput: options.whitelistInInput || ['save', 'find'],
    };
    
    this.commandManager = this.options.commandManager;
    this.platform = this.detectPlatform();
    
    // 加载默认快捷键
    this.loadKeymap(this.options.defaultKeymap);
  }

  /**
   * 检测当前平台
   */
  private detectPlatform(): 'mac' | 'win' | 'linux' | 'unknown' {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (platform.includes('mac') || platform.includes('darwin')) {
      return 'mac';
    } else if (platform.includes('win')) {
      return 'win';
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
      return 'linux';
    }
    
    return 'unknown';
  }

  /**
   * 检查是否是 Mac 平台
   */
  isMac(): boolean {
    return this.platform === 'mac';
  }

  /**
   * 获取当前平台
   */
  getPlatform(): string {
    return this.platform;
  }

  /**
   * 获取平台特定的快捷键
   * @param binding 快捷键定义
   * @returns 平台特定的快捷键字符串
   */
  getPlatformSpecificKey(binding: Keybinding): string {
    if (this.platform === 'mac' && binding.platform?.mac) {
      return binding.platform.mac;
    }
    if ((this.platform === 'win' || this.platform === 'linux') && binding.platform?.win) {
      return binding.platform.win;
    }
    return binding.key;
  }

  /**
   * 解析快捷键字符串
   * @param key 快捷键字符串（如 'ctrl+shift+s'）
   * @returns 解析后的快捷键对象
   */
  parseKeybinding(key: string): ParsedKeybinding {
    // 检查缓存
    if (this.parsedCache.has(key)) {
      return this.parsedCache.get(key)!;
    }

    const parts = key.toLowerCase().split('+');
    const parsed: ParsedKeybinding = {
      key: '',
      ctrl: false,
      shift: false,
      alt: false,
      meta: false,
      raw: key,
    };

    for (const part of parts) {
      const trimmed = part.trim();
      switch (trimmed) {
        case 'ctrl':
        case 'control':
          parsed.ctrl = true;
          break;
        case 'shift':
          parsed.shift = true;
          break;
        case 'alt':
        case 'option':
          parsed.alt = true;
          break;
        case 'meta':
        case 'cmd':
        case 'command':
          parsed.meta = true;
          break;
        default:
          // 特殊按键映射
          parsed.key = this.normalizeKey(trimmed);
          break;
      }
    }

    // 缓存结果
    this.parsedCache.set(key, parsed);
    return parsed;
  }

  /**
   * 标准化按键名称
   * @param key 按键名称
   * @returns 标准化后的按键名称
   */
  private normalizeKey(key: string): string {
    const keyMap: Record<string, string> = {
      'esc': 'escape',
      'del': 'delete',
      'ins': 'insert',
      'pgup': 'pageup',
      'pgdown': 'pagedown',
      'up': 'arrowup',
      'down': 'arrowdown',
      'left': 'arrowleft',
      'right': 'arrowright',
      'space': ' ',
      'spacebar': ' ',
      'plus': '+',
      'minus': '-',
      'dash': '-',
      'return': 'enter',
    };
    
    return keyMap[key] || key;
  }

  /**
   * 将键盘事件转换为快捷键字符串
   * @param event 键盘事件
   * @returns 快捷键字符串
   */
  eventToKeybinding(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push(this.isMac() ? 'cmd' : 'meta');
    
    const key = event.key.toLowerCase();
    
    // 跳过修饰键本身
    if (['control', 'alt', 'shift', 'meta'].includes(key)) {
      return parts.join('+');
    }
    
    parts.push(key);
    return parts.join('+');
  }

  /**
   * 注册单个快捷键
   * @param binding 快捷键定义
   * @param override 是否覆盖已存在的快捷键
   * @returns 是否注册成功
   */
  register(binding: Keybinding, override: boolean = false): boolean {
    const key = this.getPlatformSpecificKey(binding);
    
    if (!this.bindings.has(key)) {
      this.bindings.set(key, []);
    }
    
    const bindings = this.bindings.get(key)!;
    
    // 检查是否已存在相同ID的快捷键
    const existingIndex = bindings.findIndex(b => b.id === binding.id);
    if (existingIndex >= 0) {
      if (override) {
        bindings[existingIndex] = binding;
        return true;
      }
      return false;
    }
    
    bindings.push(binding);
    return true;
  }

  /**
   * 批量注册快捷键
   * @param bindings 快捷键定义数组
   * @param override 是否覆盖已存在的快捷键
   * @returns 注册成功的数量
   */
  registerMany(bindings: Keybinding[], override: boolean = false): number {
    let successCount = 0;
    for (const binding of bindings) {
      if (this.register(binding, override)) {
        successCount++;
      }
    }
    return successCount;
  }

  /**
   * 加载快捷键映射
   * @param keymap 快捷键映射
   * @param override 是否覆盖已存在的快捷键
   * @returns 注册成功的数量
   */
  loadKeymap(keymap: Keymap, override: boolean = false): number {
    return this.registerMany(keymap.bindings, override);
  }

  /**
   * 注销快捷键
   * @param bindingId 快捷键ID
   * @returns 是否注销成功
   */
  unregister(bindingId: string): boolean {
    for (const [key, bindings] of this.bindings.entries()) {
      const index = bindings.findIndex(b => b.id === bindingId);
      if (index >= 0) {
        bindings.splice(index, 1);
        if (bindings.length === 0) {
          this.bindings.delete(key);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * 批量注销快捷键
   * @param bindingIds 快捷键ID数组
   * @returns 注销成功的数量
   */
  unregisterMany(bindingIds: string[]): number {
    let successCount = 0;
    for (const id of bindingIds) {
      if (this.unregister(id)) {
        successCount++;
      }
    }
    return successCount;
  }

  /**
   * 获取快捷键定义
   * @param bindingId 快捷键ID
   * @returns 快捷键定义或 undefined
   */
  getBinding(bindingId: string): Keybinding | undefined {
    for (const bindings of this.bindings.values()) {
      const binding = bindings.find(b => b.id === bindingId);
      if (binding) return binding;
    }
    return undefined;
  }

  /**
   * 根据快捷键获取绑定
   * @param key 快捷键字符串
   * @returns 快捷键定义数组
   */
  getBindingsForKey(key: string): Keybinding[] {
    return this.bindings.get(key.toLowerCase()) || [];
  }

  /**
   * 获取所有快捷键
   * @returns 快捷键定义数组
   */
  getAllBindings(): Keybinding[] {
    const all: Keybinding[] = [];
    for (const bindings of this.bindings.values()) {
      all.push(...bindings);
    }
    return all;
  }

  /**
   * 检查快捷键是否存在
   * @param key 快捷键字符串
   * @returns 是否存在
   */
  hasBinding(key: string): boolean {
    return this.bindings.has(key.toLowerCase());
  }

  /**
   * 检测快捷键冲突
   * @returns 冲突信息数组
   */
  detectConflicts(): KeybindingConflict[] {
    const conflicts: KeybindingConflict[] = [];
    
    for (const [key, bindings] of this.bindings.entries()) {
      if (bindings.length > 1) {
        conflicts.push({ key, bindings: [...bindings] });
      }
    }
    
    return conflicts;
  }

  /**
   * 解决快捷键冲突
   * 保留优先级最高的快捷键，其余取消注册
   * @param key 快捷键字符串
   * @returns 是否解决了冲突
   */
  resolveConflict(key: string): boolean {
    const bindings = this.bindings.get(key.toLowerCase());
    if (!bindings || bindings.length <= 1) {
      return false;
    }
    
    // 按优先级排序（可以添加优先级字段，这里简单保留第一个）
    const keep = bindings[0];
    this.bindings.set(key.toLowerCase(), [keep]);
    
    return true;
  }

  /**
   * 处理键盘事件
   * @param event 键盘事件
   * @param context 命令上下文
   * @returns 是否处理了事件
   */
  async handleKeydown(event: KeyboardEvent, context: CommandContext): Promise<boolean> {
    if (!this.options.enabled) {
      return false;
    }

    // 检查是否在输入框内
    if (this.options.ignoreInInput && this.isInInput(event.target as HTMLElement)) {
      const key = this.eventToKeybinding(event);
      const bindingId = this.getBindingIdFromKey(key);
      if (bindingId && !this.options.whitelistInInput.includes(bindingId)) {
        return false;
      }
    }

    const key = this.eventToKeybinding(event);
    const bindings = this.getBindingsForKey(key);
    
    if (bindings.length === 0) {
      return false;
    }

    // 获取第一个匹配的快捷键
    const binding = bindings[0];
    
    // 检查条件
    if (binding.when && !binding.when(context)) {
      return false;
    }

    // 执行命令
    const result = await this.commandManager.execute(
      binding.command,
      context,
      binding.args || []
    );

    if (result.success) {
      if (binding.preventDefault !== false) {
        event.preventDefault();
      }
      if (binding.stopPropagation) {
        event.stopPropagation();
      }
      return true;
    }

    return false;
  }

  /**
   * 处理键盘事件（同步版本）
   * @param event 键盘事件
   * @param context 命令上下文
   * @returns 是否处理了事件
   */
  handleKeydownSync(event: KeyboardEvent, context: CommandContext): boolean {
    if (!this.options.enabled) {
      return false;
    }

    if (this.options.ignoreInInput && this.isInInput(event.target as HTMLElement)) {
      const key = this.eventToKeybinding(event);
      const bindingId = this.getBindingIdFromKey(key);
      if (bindingId && !this.options.whitelistInInput.includes(bindingId)) {
        return false;
      }
    }

    const key = this.eventToKeybinding(event);
    const bindings = this.getBindingsForKey(key);
    
    if (bindings.length === 0) {
      return false;
    }

    const binding = bindings[0];
    
    if (binding.when && !binding.when(context)) {
      return false;
    }

    const result = this.commandManager.executeSync(
      binding.command,
      context,
      binding.args || []
    );

    if (result.success) {
      if (binding.preventDefault !== false) {
        event.preventDefault();
      }
      if (binding.stopPropagation) {
        event.stopPropagation();
      }
      return true;
    }

    return false;
  }

  /**
   * 检查目标元素是否在输入框内
   * @param element 目标元素
   * @returns 是否在输入框内
   */
  private isInInput(element: HTMLElement | null): boolean {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    const editable = element.getAttribute('contenteditable');
    
    return inputTypes.includes(tagName) || editable === 'true';
  }

  /**
   * 从快捷键获取绑定ID
   * @param key 快捷键字符串
   * @returns 绑定ID或 undefined
   */
  private getBindingIdFromKey(key: string): string | undefined {
    const bindings = this.getBindingsForKey(key);
    return bindings[0]?.id;
  }

  /**
   * 绑定到 DOM 元素
   * @param element 目标元素
   * @param context 命令上下文
   */
  bindToElement(element: HTMLElement | Document, context: CommandContext): void {
    if (this.isBound) {
      this.unbind();
    }
    
    this.targetElement = element;
    this.isBound = true;
    
    const handler = (event: Event) => {
      const keyEvent = event as KeyboardEvent;
      this.handleKeydown(keyEvent, context);
    };
    
    element.addEventListener('keydown', handler);
    
    // 保存引用以便取消绑定
    (this as any)._keydownHandler = handler;
  }

  /**
   * 取消 DOM 绑定
   */
  unbind(): void {
    if (!this.isBound || !this.targetElement) {
      return;
    }
    
    const handler = (this as any)._keydownHandler;
    if (handler) {
      this.targetElement.removeEventListener('keydown', handler);
    }
    
    this.targetElement = undefined;
    this.isBound = false;
    (this as any)._keydownHandler = undefined;
  }

  /**
   * 启用快捷键
   */
  enable(): void {
    this.options.enabled = true;
  }

  /**
   * 禁用快捷键
   */
  disable(): void {
    this.options.enabled = false;
  }

  /**
   * 切换启用状态
   */
  toggle(): void {
    this.options.enabled = !this.options.enabled;
  }

  /**
   * 检查是否已启用
   */
  isEnabled(): boolean {
    return this.options.enabled;
  }

  /**
   * 清空所有快捷键
   */
  clear(): void {
    this.bindings.clear();
  }

  /**
   * 重置为默认快捷键
   */
  resetToDefault(): void {
    this.clear();
    this.loadKeymap(this.options.defaultKeymap);
  }

  /**
   * 获取快捷键数量
   */
  getBindingCount(): number {
    return this.getAllBindings().length;
  }

  /**
   * 销毁快捷键管理器
   */
  destroy(): void {
    this.unbind();
    this.clear();
    this.parsedCache.clear();
  }
}

/**
 * 创建快捷键管理器的工厂函数
 * @param options 配置选项
 * @returns KeymapManager 实例
 */
export function createKeymapManager(options?: KeymapManagerOptions): KeymapManager {
  return new KeymapManager(options);
}

/**
 * 全局快捷键管理器实例（单例）
 */
let globalKeymapManager: KeymapManager | null = null;

/**
 * 获取全局快捷键管理器实例
 * @returns KeymapManager 实例
 */
export function getGlobalKeymapManager(): KeymapManager {
  if (!globalKeymapManager) {
    globalKeymapManager = new KeymapManager();
  }
  return globalKeymapManager;
}

/**
 * 设置全局快捷键管理器实例
 * @param manager KeymapManager 实例
 */
export function setGlobalKeymapManager(manager: KeymapManager): void {
  globalKeymapManager = manager;
}

/**
 * 格式化快捷键显示（用于 UI 显示）
 * @param key 快捷键字符串
 * @param platform 目标平台
 * @returns 格式化后的快捷键字符串
 */
export function formatKeybinding(key: string, platform?: 'mac' | 'win' | 'linux'): string {
  const parts = key.toLowerCase().split('+');
  const isMac = platform === 'mac' || (!platform && typeof navigator !== 'undefined' && /Mac/.test(navigator.platform));
  
  const displayMap: Record<string, string> = isMac ? {
    'ctrl': '⌃',
    'control': '⌃',
    'alt': '⌥',
    'option': '⌥',
    'shift': '⇧',
    'cmd': '⌘',
    'meta': '⌘',
    'command': '⌘',
    'escape': 'Esc',
    'enter': '↵',
    'tab': '⇥',
    'backspace': '⌫',
    'delete': '⌦',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
  } : {
    'ctrl': 'Ctrl',
    'control': 'Ctrl',
    'alt': 'Alt',
    'shift': 'Shift',
    'meta': 'Meta',
    'escape': 'Esc',
    'enter': 'Enter',
    'tab': 'Tab',
    'backspace': 'Backspace',
    'delete': 'Delete',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
  };

  return parts.map(part => displayMap[part] || part.toUpperCase()).join(isMac ? '' : '+');
}
