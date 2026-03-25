/**
 * WheelChair 命令系统使用示例
 * 
 * 展示如何使用命令系统和快捷键系统
 */

import {
  // 命令管理器
  CommandManager,
  createCommandManager,
  
  // 文本命令
  BoldCommand,
  ItalicCommand,
  registerTextCommands,
  
  // 块级命令
  Heading1Command,
  ParagraphCommand,
  registerBlockCommands,
  
  // 列表命令
  BulletListCommand,
  registerListCommands,
  
  // 剪贴板命令
  registerClipboardCommands,
  
  // 历史命令
  registerHistoryCommands,
  
  // 类型
  CommandContext,
  Command,
  CommandCategory,
} from '../src/commands';

import {
  // 快捷键管理器
  KeymapManager,
  createKeymapManager,
  defaultKeymap,
  formatKeybinding,
} from '../src/keymap';

// ==================== 示例 1: 基础命令系统使用 ====================

/**
 * 示例：创建并配置命令管理器
 */
function example1_createCommandManager() {
  console.log('=== 示例 1: 创建命令管理器 ===\n');

  // 创建命令管理器
  const commandManager = createCommandManager({
    history: {
      maxHistorySize: 50,
      mergeConsecutive: true,
      mergeWindow: 1000,
    },
  });

  // 注册单个命令
  commandManager.register(BoldCommand);
  console.log('✓ 注册 BoldCommand');

  // 批量注册文本命令
  registerTextCommands(commandManager);
  console.log('✓ 批量注册所有文本命令');

  // 批量注册其他命令
  registerBlockCommands(commandManager);
  registerListCommands(commandManager);
  registerClipboardCommands(commandManager);
  registerHistoryCommands(commandManager);
  console.log('✓ 注册所有其他命令\n');

  // 获取所有已注册命令
  const allCommands = commandManager.getAllCommands();
  console.log(`已注册命令总数: ${allCommands.length}`);
  console.log('命令列表:');
  allCommands.forEach(cmd => {
    console.log(`  - ${cmd.id}: ${cmd.name} (${cmd.category})`);
  });

  return commandManager;
}

// ==================== 示例 2: 执行命令 ====================

/**
 * 示例：执行命令
 */
async function example2_executeCommands(commandManager: CommandManager) {
  console.log('\n=== 示例 2: 执行命令 ===\n');

  // 模拟命令上下文
  const mockContext: CommandContext = {
    state: {} as any,
    view: {} as any,
    getSelection: () => null,
    setSelection: () => {},
    getSelectedText: () => '选中的文本',
    insertText: (text: string) => console.log(`  插入文本: "${text}"`),
    deleteSelection: () => console.log('  删除选区'),
    applyFormat: (format: string) => console.log(`  应用格式: ${format}`),
    removeFormat: (format: string) => console.log(`  移除格式: ${format}`),
    toggleFormat: (format: string) => console.log(`  切换格式: ${format}`),
    hasFormat: (format: string) => false,
    getCurrentBlockType: () => 'paragraph',
    setBlockType: (type: string) => console.log(`  设置块类型: ${type}`),
    wrapIn: () => {},
    unwrap: () => {},
  };

  // 执行粗体命令
  console.log('执行粗体命令:');
  const result1 = await commandManager.execute('text.bold', mockContext);
  console.log(`  结果: ${result1.success ? '成功' : '失败'} - ${result1.message || ''}`);

  // 检查是否可以撤销
  console.log(`\n可以撤销: ${commandManager.canUndo()}`);
  
  // 撤销操作
  if (commandManager.canUndo()) {
    console.log('执行撤销:');
    const undoResult = await commandManager.undo(mockContext);
    console.log(`  结果: ${undoResult.success ? '成功' : '失败'} - ${undoResult.message || ''}`);
  }

  // 检查历史记录
  console.log(`\n历史记录数量: ${commandManager.getHistorySize()}`);
}

// ==================== 示例 3: 快捷键系统 ====================

/**
 * 示例：配置和使用快捷键系统
 */
function example3_keymapSystem(commandManager: CommandManager) {
  console.log('\n=== 示例 3: 快捷键系统 ===\n');

  // 创建快捷键管理器
  const keymapManager = createKeymapManager({
    commandManager,
    defaultKeymap,
    enabled: true,
  });

  // 检测当前平台
  console.log(`当前平台: ${keymapManager.getPlatform()}`);
  console.log(`是否为 Mac: ${keymapManager.isMac()}\n`);

  // 获取所有快捷键
  const allBindings = keymapManager.getAllBindings();
  console.log(`快捷键总数: ${allBindings.length}\n`);

  // 按分类显示快捷键
  const categories: Record<string, string[]> = {};
  for (const binding of allBindings) {
    if (!categories[binding.command]) {
      categories[binding.command] = [];
    }
    categories[binding.command].push(binding.key);
  }

  console.log('部分快捷键映射:');
  const sampleCommands = [
    'text.bold',
    'text.italic',
    'text.underline',
    'block.heading-1',
    'block.heading-2',
    'list.bullet',
    'history.undo',
    'history.redo',
  ];

  for (const cmd of sampleCommands) {
    const keys = categories[cmd] || [];
    const formattedKeys = keys.map(k => formatKeybinding(k)).join(', ');
    console.log(`  ${cmd.padEnd(20)} -> ${formattedKeys}`);
  }

  // 检测快捷键冲突
  const conflicts = keymapManager.detectConflicts();
  if (conflicts.length > 0) {
    console.log(`\n检测到 ${conflicts.length} 个快捷键冲突`);
  } else {
    console.log('\n✓ 未检测到快捷键冲突');
  }

  return keymapManager;
}

// ==================== 示例 4: 自定义命令 ====================

/**
 * 示例：创建自定义命令
 */
function example4_customCommands(commandManager: CommandManager) {
  console.log('\n=== 示例 4: 自定义命令 ===\n');

  // 创建自定义命令
  const customCommand: Command = {
    id: 'custom.insertSignature',
    name: '插入签名',
    description: '在文档末尾插入签名',
    category: CommandCategory.CUSTOM,
    undoable: true,

    execute(context: CommandContext): CommandResult {
      const signature = '\n\n---\n此致\n敬礼\n';
      context.insertText(signature);

      return {
        success: true,
        undoData: { signature },
        stateChanged: true,
      };
    },

    undo(context: CommandContext): CommandResult {
      // 简化处理：实际应该精确删除插入的内容
      context.deleteSelection();
      return {
        success: true,
        stateChanged: true,
      };
    },

    isEnabled(): boolean {
      return true;
    },
  };

  // 注册自定义命令
  const success = commandManager.register(customCommand);
  console.log(`自定义命令注册${success ? '成功' : '失败'}: ${customCommand.id}`);

  // 验证注册
  const retrieved = commandManager.getCommand('custom.insertSignature');
  console.log(`命令查找: ${retrieved ? retrieved.name : '未找到'}`);
}

// ==================== 示例 5: 快捷键绑定到 DOM ====================

/**
 * 示例：将快捷键绑定到 DOM 元素
 */
function example5_bindToDOM(keymapManager: KeymapManager, commandManager: CommandManager) {
  console.log('\n=== 示例 5: DOM 绑定 ===\n');

  // 模拟命令上下文
  const mockContext: CommandContext = {
    state: {} as any,
    view: {} as any,
    getSelection: () => null,
    setSelection: () => {},
    getSelectedText: () => 'test',
    insertText: (text: string) => console.log(`  插入: "${text}"`),
    deleteSelection: () => {},
    applyFormat: (format: string) => console.log(`  格式: ${format}`),
    removeFormat: () => {},
    toggleFormat: () => {},
    hasFormat: () => false,
    getCurrentBlockType: () => 'paragraph',
    setBlockType: () => {},
    wrapIn: () => {},
    unwrap: () => {},
  };

  // 绑定到 document（实际使用时可以绑定到编辑器容器）
  // keymapManager.bindToElement(document, mockContext);
  console.log('快捷键管理器已准备就绪');
  console.log('状态:', keymapManager.isEnabled() ? '已启用' : '已禁用');
}

// ==================== 主函数 ====================

/**
 * 运行所有示例
 */
export async function runExamples() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     WheelChair 命令系统和快捷键系统使用示例           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 示例 1: 创建命令管理器
  const commandManager = example1_createCommandManager();

  // 示例 2: 执行命令
  await example2_executeCommands(commandManager);

  // 示例 3: 快捷键系统
  const keymapManager = example3_keymapSystem(commandManager);

  // 示例 4: 自定义命令
  example4_customCommands(commandManager);

  // 示例 5: DOM 绑定
  example5_bindToDOM(keymapManager, commandManager);

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║              所有示例运行完成！                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

// 如果直接运行此文件
if (typeof window !== 'undefined') {
  // 浏览器环境
  (window as any).runCommandExamples = runExamples;
} else if (require.main === module) {
  // Node.js 环境
  runExamples().catch(console.error);
}
