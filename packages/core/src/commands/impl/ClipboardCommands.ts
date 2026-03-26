/**
 * WheelChair 剪贴板命令实现
 * 
 * 提供剪贴板操作相关的命令实现
 */

import { Command, CommandContext, CommandResult, CommandCategory } from '../types';

/**
 * 剪切命令
 */
export const CutCommand: Command = {
  id: 'clipboard.cut',
  name: '剪切',
  description: '剪切选中的内容到剪贴板',
  category: CommandCategory.CLIPBOARD,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const _selection = context.getSelection();
    
    if (!_selection || _selection.isCollapsed) {
      return {
        success: false,
        message: '请先选中文本',
      };
    }

    const selectedText = context.getSelectedText();

    try {
      // 尝试使用原生剪贴板 API
      navigator.clipboard.writeText(selectedText).catch(err => {
        console.warn('Clipboard API failed, falling back to execCommand', err);
        // 备用方案
        document.execCommand('cut');
      });
    } catch (e) {
      document.execCommand('cut');
    }

    // 保存选中的内容用于撤销
    const range = _selection.getRangeAt(0).cloneRange();

    // 删除选中的内容
    context.deleteSelection();

    return {
      success: true,
      undoData: { text: selectedText, range },
      stateChanged: true,
    };
  },

  undo(_context: CommandContext, undoData: { text: string; range: Range }): CommandResult {
    // 恢复剪切的内容
    _context.insertText(undoData.text);

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(context: CommandContext): boolean {
    const _selection = context.getSelection();
    return _selection !== null && !_selection.isCollapsed;
  },
};

/**
 * 复制命令
 */
export const CopyCommand: Command = {
  id: 'clipboard.copy',
  name: '复制',
  description: '复制选中的内容到剪贴板',
  category: CommandCategory.CLIPBOARD,
  undoable: false, // 复制不需要撤销

  execute(context: CommandContext): CommandResult {
    const _selection = context.getSelection();
    
    if (!_selection || _selection.isCollapsed) {
      return {
        success: false,
        message: '请先选中文本',
      };
    }

    const selectedText = context.getSelectedText();

    try {
      navigator.clipboard.writeText(selectedText).catch(err => {
        console.warn('Clipboard API failed, falling back to execCommand', err);
        document.execCommand('copy');
      });
    } catch (e) {
      document.execCommand('copy');
    }

    return {
      success: true,
      stateChanged: false, // 复制不改变状态
    };
  },

  isEnabled(context: CommandContext): boolean {
    const _selection = context.getSelection();
    return _selection !== null && !_selection.isCollapsed;
  },
};

/**
 * 粘贴命令
 */
export const PasteCommand: Command = {
  id: 'clipboard.paste',
  name: '粘贴',
  description: '从剪贴板粘贴内容',
  category: CommandCategory.CLIPBOARD,
  undoable: true,

  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      // 尝试使用原生剪贴板 API
      const text = await navigator.clipboard.readText();
      
      // 保存当前选区用于撤销
      const previousText = context.getSelectedText();

      // 粘贴内容
      context.insertText(text);

      return {
        success: true,
        undoData: { previousText, pastedText: text },
        stateChanged: true,
      };
    } catch (err) {
      console.warn('Clipboard API failed', err);
      // 回退到使用 paste 事件
      document.execCommand('paste');

      return {
        success: true,
        stateChanged: true,
      };
    }
  },

  undo(_context: CommandContext, undoData: { previousText: string; pastedText: string }): CommandResult {
    // 移除粘贴的内容，恢复之前的内容
    _context.deleteSelection();
    if (undoData.previousText) {
      _context.insertText(undoData.previousText);
    }

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(): boolean {
    // 粘贴通常总是可用的
    return true;
  },
};

/**
 * 纯文本粘贴命令
 * 粘贴时不保留格式
 */
export const PastePlainCommand: Command = {
  id: 'clipboard.pastePlain',
  name: '纯文本粘贴',
  description: '以纯文本格式粘贴剪贴板内容',
  category: CommandCategory.CLIPBOARD,
  undoable: true,

  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      const text = await navigator.clipboard.readText();
      
      // 移除所有格式标记，只保留纯文本
      const plainText = text
        .replace(/<[^>]*>/g, '') // 移除 HTML 标签
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const previousText = context.getSelectedText();

      context.insertText(plainText);

      return {
        success: true,
        undoData: { previousText, pastedText: plainText },
        stateChanged: true,
      };
    } catch (err) {
      console.warn('Clipboard API failed', err);
      
      return {
        success: false,
        message: '无法访问剪贴板',
      };
    }
  },

  undo(context: CommandContext, undoData: { previousText: string }): CommandResult {
    context.deleteSelection();
    if (undoData.previousText) {
      context.insertText(undoData.previousText);
    }

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(): boolean {
    return true;
  },
};

/**
 * 粘贴并匹配样式命令
 * 粘贴时尝试匹配当前位置的样式
 */
export const PasteAndMatchStyleCommand: Command = {
  id: 'clipboard.pasteAndMatchStyle',
  name: '粘贴并匹配样式',
  description: '粘贴内容并匹配当前位置的样式',
  category: CommandCategory.CLIPBOARD,
  undoable: true,

  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      // 获取当前位置的格式
      const currentFormats = context.state.getActiveFormats?.() || [];
      
      const text = await navigator.clipboard.readText();
      const previousText = context.getSelectedText();

      // 先插入纯文本
      context.insertText(text);

      // 然后应用当前格式
      for (const format of currentFormats) {
        context.applyFormat(format);
      }

      return {
        success: true,
        undoData: { previousText, formats: currentFormats },
        stateChanged: true,
      };
    } catch (err) {
      console.warn('Clipboard API failed', err);
      
      return {
        success: false,
        message: '无法访问剪贴板',
      };
    }
  },

  undo(context: CommandContext, undoData: { previousText: string }): CommandResult {
    context.deleteSelection();
    if (undoData.previousText) {
      context.insertText(undoData.previousText);
    }

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(): boolean {
    return true;
  },
};

/**
 * 复制当前行命令
 */
export const CopyLineCommand: Command = {
  id: 'clipboard.copyLine',
  name: '复制当前行',
  description: '复制当前行到剪贴板',
  category: CommandCategory.CLIPBOARD,
  undoable: false,

  execute(context: CommandContext): CommandResult {
    // 获取当前行的文本
    // 这里需要根据具体的编辑器实现来获取当前行
    const lineText = context.state.getCurrentLineText?.() || '';

    if (!lineText) {
      return {
        success: false,
        message: '当前行为空',
      };
    }

    try {
      navigator.clipboard.writeText(lineText).catch(err => {
        console.warn('Clipboard API failed', err);
      });
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }

    return {
      success: true,
      stateChanged: false,
    };
  },

  isEnabled(): boolean {
    return true;
  },
};

/**
 * 剪切当前行命令
 */
export const CutLineCommand: Command = {
  id: 'clipboard.cutLine',
  name: '剪切当前行',
  description: '剪切当前行到剪贴板',
  category: CommandCategory.CLIPBOARD,
  undoable: true,

  execute(context: CommandContext): CommandResult {
    const lineText = context.state.getCurrentLineText?.() || '';

    if (!lineText) {
      return {
        success: false,
        message: '当前行为空',
      };
    }

    try {
      navigator.clipboard.writeText(lineText).catch(err => {
        console.warn('Clipboard API failed', err);
      });
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }

    // 删除当前行
    context.state.deleteCurrentLine?.();

    return {
      success: true,
      undoData: { lineText },
      stateChanged: true,
    };
  },

  undo(context: CommandContext, undoData: { lineText: string }): CommandResult {
    context.insertText(undoData.lineText + '\n');

    return {
      success: true,
      stateChanged: true,
    };
  },

  isEnabled(): boolean {
    return true;
  },
};

/**
 * 复制为 Markdown 命令
 */
export const CopyAsMarkdownCommand: Command = {
  id: 'clipboard.copyAsMarkdown',
  name: '复制为 Markdown',
  description: '将选中的内容复制为 Markdown 格式',
  category: CommandCategory.CLIPBOARD,
  undoable: false,

  execute(context: CommandContext): CommandResult {
    const selection = context.getSelection();
    
    if (!selection || selection.isCollapsed) {
      return {
        success: false,
        message: '请先选中文本',
      };
    }

    // 获取选区的 HTML
    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    container.appendChild(range.cloneContents());
    
    // 简单的 HTML 到 Markdown 转换
    const markdown = htmlToMarkdown(container.innerHTML);

    try {
      navigator.clipboard.writeText(markdown).catch(err => {
        console.warn('Clipboard API failed', err);
      });
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }

    return {
      success: true,
      stateChanged: false,
    };
  },

  isEnabled(context: CommandContext): boolean {
    const selection = context.getSelection();
    return selection !== null && !selection.isCollapsed;
  },
};

/**
 * 简单的 HTML 到 Markdown 转换函数
 */
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<[^>]*>/g, '');
}

/**
 * 获取所有剪贴板命令
 */
export function getAllClipboardCommands(): Command[] {
  return [
    CutCommand,
    CopyCommand,
    PasteCommand,
    PastePlainCommand,
    PasteAndMatchStyleCommand,
    CopyLineCommand,
    CutLineCommand,
    CopyAsMarkdownCommand,
  ];
}

/**
 * 将剪贴板命令注册到命令管理器
 * @param commandManager 命令管理器实例
 */
export function registerClipboardCommands(commandManager: { register: (cmd: Command) => boolean }): void {
  const commands = getAllClipboardCommands();
  for (const command of commands) {
    commandManager.register(command);
  }
}
