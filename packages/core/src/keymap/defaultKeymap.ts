/**
 * WheelChair 默认快捷键映射
 * 
 * 提供编辑器所有功能的默认快捷键配置
 * 支持 Windows/Linux 和 Mac 平台
 */

import { Keymap, Keybinding, CommandCategory } from '../commands/types';

/**
 * 文本格式化快捷键
 */
const textFormatBindings: Keybinding[] = [
  {
    id: 'bold',
    command: 'text.bold',
    key: 'ctrl+b',
    name: '粗体',
    description: '切换选中文本的粗体格式',
    preventDefault: true,
    platform: {
      win: 'ctrl+b',
      mac: 'cmd+b',
    },
  },
  {
    id: 'italic',
    command: 'text.italic',
    key: 'ctrl+i',
    name: '斜体',
    description: '切换选中文本的斜体格式',
    preventDefault: true,
    platform: {
      win: 'ctrl+i',
      mac: 'cmd+i',
    },
  },
  {
    id: 'underline',
    command: 'text.underline',
    key: 'ctrl+u',
    name: '下划线',
    description: '切换选中文本的下划线格式',
    preventDefault: true,
    platform: {
      win: 'ctrl+u',
      mac: 'cmd+u',
    },
  },
  {
    id: 'strikethrough',
    command: 'text.strikethrough',
    key: 'ctrl+shift+s',
    name: '删除线',
    description: '切换选中文本的删除线格式',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+s',
      mac: 'cmd+shift+s',
    },
  },
  {
    id: 'code',
    command: 'text.code',
    key: 'ctrl+e',
    name: '行内代码',
    description: '切换选中文本的行内代码格式',
    preventDefault: true,
    platform: {
      win: 'ctrl+e',
      mac: 'cmd+e',
    },
  },
  {
    id: 'superscript',
    command: 'text.superscript',
    key: 'ctrl+.',
    name: '上标',
    description: '将选中文本设置为上标',
    preventDefault: true,
    platform: {
      win: 'ctrl+.',
      mac: 'cmd+.',
    },
  },
  {
    id: 'subscript',
    command: 'text.subscript',
    key: 'ctrl+,',
    name: '下标',
    description: '将选中文本设置为下标',
    preventDefault: true,
    platform: {
      win: 'ctrl+,',
      mac: 'cmd+,',
    },
  },
  {
    id: 'remove-format',
    command: 'text.removeFormat',
    key: 'ctrl+\\',
    name: '清除格式',
    description: '清除选中文本的所有格式',
    preventDefault: true,
    platform: {
      win: 'ctrl+\\',
      mac: 'cmd+\\',
    },
  },
];

/**
 * 段落转换快捷键
 */
const paragraphBindings: Keybinding[] = [
  {
    id: 'paragraph',
    command: 'block.paragraph',
    key: 'ctrl+0',
    name: '段落',
    description: '将当前块转换为段落',
    preventDefault: true,
    platform: {
      win: 'ctrl+0',
      mac: 'cmd+0',
    },
  },
  {
    id: 'heading-1',
    command: 'block.heading-1',
    key: 'ctrl+1',
    name: '标题 1',
    description: '将当前块转换为一级标题',
    preventDefault: true,
    platform: {
      win: 'ctrl+1',
      mac: 'cmd+1',
    },
  },
  {
    id: 'heading-2',
    command: 'block.heading-2',
    key: 'ctrl+2',
    name: '标题 2',
    description: '将当前块转换为二级标题',
    preventDefault: true,
    platform: {
      win: 'ctrl+2',
      mac: 'cmd+2',
    },
  },
  {
    id: 'heading-3',
    command: 'block.heading-3',
    key: 'ctrl+3',
    name: '标题 3',
    description: '将当前块转换为三级标题',
    preventDefault: true,
    platform: {
      win: 'ctrl+3',
      mac: 'cmd+3',
    },
  },
  {
    id: 'heading-4',
    command: 'block.heading-4',
    key: 'ctrl+4',
    name: '标题 4',
    description: '将当前块转换为四级标题',
    preventDefault: true,
    platform: {
      win: 'ctrl+4',
      mac: 'cmd+4',
    },
  },
  {
    id: 'heading-5',
    command: 'block.heading-5',
    key: 'ctrl+5',
    name: '标题 5',
    description: '将当前块转换为五级标题',
    preventDefault: true,
    platform: {
      win: 'ctrl+5',
      mac: 'cmd+5',
    },
  },
  {
    id: 'heading-6',
    command: 'block.heading-6',
    key: 'ctrl+6',
    name: '标题 6',
    description: '将当前块转换为六级标题',
    preventDefault: true,
    platform: {
      win: 'ctrl+6',
      mac: 'cmd+6',
    },
  },
  {
    id: 'blockquote',
    command: 'block.blockquote',
    key: 'ctrl+shift+q',
    name: '引用块',
    description: '将当前块转换为引用块',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+q',
      mac: 'cmd+shift+q',
    },
  },
  {
    id: 'code-block',
    command: 'block.code-block',
    key: 'ctrl+shift+c',
    name: '代码块',
    description: '将当前块转换为代码块',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+c',
      mac: 'cmd+shift+c',
    },
  },
];

/**
 * 列表操作快捷键
 */
const listBindings: Keybinding[] = [
  {
    id: 'bullet-list',
    command: 'list.bullet',
    key: 'ctrl+shift+u',
    name: '无序列表',
    description: '转换为或创建无序列表',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+u',
      mac: 'cmd+shift+u',
    },
  },
  {
    id: 'ordered-list',
    command: 'list.ordered',
    key: 'ctrl+shift+o',
    name: '有序列表',
    description: '转换为或创建有序列表',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+o',
      mac: 'cmd+shift+o',
    },
  },
  {
    id: 'task-list',
    command: 'list.task',
    key: 'ctrl+shift+t',
    name: '任务列表',
    description: '转换为或创建任务列表',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+t',
      mac: 'cmd+shift+t',
    },
  },
  {
    id: 'indent-list',
    command: 'list.indent',
    key: 'tab',
    name: '增加缩进',
    description: '增加列表项缩进',
    preventDefault: true,
  },
  {
    id: 'outdent-list',
    command: 'list.outdent',
    key: 'shift+tab',
    name: '减少缩进',
    description: '减少列表项缩进',
    preventDefault: true,
  },
  {
    id: 'toggle-checkbox',
    command: 'list.toggleCheckbox',
    key: 'ctrl+enter',
    name: '切换复选框',
    description: '切换任务列表项的完成状态',
    preventDefault: true,
    platform: {
      win: 'ctrl+enter',
      mac: 'cmd+enter',
    },
  },
];

/**
 * 历史操作快捷键
 */
const historyBindings: Keybinding[] = [
  {
    id: 'undo',
    command: 'history.undo',
    key: 'ctrl+z',
    name: '撤销',
    description: '撤销上一步操作',
    preventDefault: true,
    platform: {
      win: 'ctrl+z',
      mac: 'cmd+z',
    },
  },
  {
    id: 'redo',
    command: 'history.redo',
    key: 'ctrl+y',
    name: '重做',
    description: '重做上一步撤销的操作',
    preventDefault: true,
    platform: {
      win: 'ctrl+y',
      mac: 'cmd+shift+z',
    },
  },
  {
    id: 'redo-alt',
    command: 'history.redo',
    key: 'ctrl+shift+z',
    name: '重做（替代）',
    description: '重做上一步撤销的操作（替代快捷键）',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+z',
      mac: 'cmd+shift+z',
    },
  },
];

/**
 * 剪贴板操作快捷键
 */
const clipboardBindings: Keybinding[] = [
  {
    id: 'cut',
    command: 'clipboard.cut',
    key: 'ctrl+x',
    name: '剪切',
    description: '剪切选中的内容',
    preventDefault: true,
    platform: {
      win: 'ctrl+x',
      mac: 'cmd+x',
    },
  },
  {
    id: 'copy',
    command: 'clipboard.copy',
    key: 'ctrl+c',
    name: '复制',
    description: '复制选中的内容',
    preventDefault: true,
    platform: {
      win: 'ctrl+c',
      mac: 'cmd+c',
    },
  },
  {
    id: 'paste',
    command: 'clipboard.paste',
    key: 'ctrl+v',
    name: '粘贴',
    description: '粘贴剪贴板内容',
    preventDefault: true,
    platform: {
      win: 'ctrl+v',
      mac: 'cmd+v',
    },
  },
  {
    id: 'paste-plain',
    command: 'clipboard.pastePlain',
    key: 'ctrl+shift+v',
    name: '纯文本粘贴',
    description: '以纯文本格式粘贴剪贴板内容',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+v',
      mac: 'cmd+shift+v',
    },
  },
  {
    id: 'select-all',
    command: 'selection.selectAll',
    key: 'ctrl+a',
    name: '全选',
    description: '选中所有内容',
    preventDefault: true,
    platform: {
      win: 'ctrl+a',
      mac: 'cmd+a',
    },
  },
];

/**
 * 对齐方式快捷键
 */
const alignmentBindings: Keybinding[] = [
  {
    id: 'align-left',
    command: 'block.alignLeft',
    key: 'ctrl+l',
    name: '左对齐',
    description: '将段落左对齐',
    preventDefault: true,
    platform: {
      win: 'ctrl+l',
      mac: 'cmd+l',
    },
  },
  {
    id: 'align-center',
    command: 'block.alignCenter',
    key: 'ctrl+e',
    name: '居中对齐',
    description: '将段落居中对齐',
    preventDefault: true,
    platform: {
      win: 'ctrl+e',
      mac: 'cmd+e',
    },
  },
  {
    id: 'align-right',
    command: 'block.alignRight',
    key: 'ctrl+r',
    name: '右对齐',
    description: '将段落右对齐',
    preventDefault: true,
    platform: {
      win: 'ctrl+r',
      mac: 'cmd+r',
    },
  },
  {
    id: 'align-justify',
    command: 'block.alignJustify',
    key: 'ctrl+shift+j',
    name: '两端对齐',
    description: '将段落两端对齐',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+j',
      mac: 'cmd+shift+j',
    },
  },
];

/**
 * 插入操作快捷键
 */
const insertBindings: Keybinding[] = [
  {
    id: 'insert-link',
    command: 'insert.link',
    key: 'ctrl+k',
    name: '插入链接',
    description: '插入或编辑链接',
    preventDefault: true,
    platform: {
      win: 'ctrl+k',
      mac: 'cmd+k',
    },
  },
  {
    id: 'insert-image',
    command: 'insert.image',
    key: 'ctrl+shift+i',
    name: '插入图片',
    description: '插入图片',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+i',
      mac: 'cmd+shift+i',
    },
  },
  {
    id: 'insert-table',
    command: 'insert.table',
    key: 'ctrl+alt+t',
    name: '插入表格',
    description: '插入表格',
    preventDefault: true,
    platform: {
      win: 'ctrl+alt+t',
      mac: 'cmd+alt+t',
    },
  },
  {
    id: 'insert-horizontal-rule',
    command: 'insert.horizontalRule',
    key: 'ctrl+shift+h',
    name: '插入分隔线',
    description: '插入水平分隔线',
    preventDefault: true,
    platform: {
      win: 'ctrl+shift+h',
      mac: 'cmd+shift+h',
    },
  },
  {
    id: 'insert-hard-break',
    command: 'insert.hardBreak',
    key: 'shift+enter',
    name: '强制换行',
    description: '插入强制换行符',
    preventDefault: true,
  },
];

/**
 * 编辑器操作快捷键
 */
const editorBindings: Keybinding[] = [
  {
    id: 'save',
    command: 'editor.save',
    key: 'ctrl+s',
    name: '保存',
    description: '保存文档',
    preventDefault: true,
    platform: {
      win: 'ctrl+s',
      mac: 'cmd+s',
    },
  },
  {
    id: 'find',
    command: 'editor.find',
    key: 'ctrl+f',
    name: '查找',
    description: '查找内容',
    preventDefault: true,
    platform: {
      win: 'ctrl+f',
      mac: 'cmd+f',
    },
  },
  {
    id: 'replace',
    command: 'editor.replace',
    key: 'ctrl+h',
    name: '替换',
    description: '查找并替换内容',
    preventDefault: true,
    platform: {
      win: 'ctrl+h',
      mac: 'cmd+h',
    },
  },
  {
    id: 'print',
    command: 'editor.print',
    key: 'ctrl+p',
    name: '打印',
    description: '打印文档',
    preventDefault: true,
    platform: {
      win: 'ctrl+p',
      mac: 'cmd+p',
    },
  },
  {
    id: 'toggle-fullscreen',
    command: 'editor.toggleFullscreen',
    key: 'f11',
    name: '全屏',
    description: '切换全屏模式',
    preventDefault: true,
  },
];

/**
 * 选择操作快捷键
 */
const selectionBindings: Keybinding[] = [
  {
    id: 'select-word',
    command: 'selection.selectWord',
    key: 'ctrl+d',
    name: '选中单词',
    description: '选中当前单词',
    preventDefault: true,
    platform: {
      win: 'ctrl+d',
      mac: 'cmd+d',
    },
  },
  {
    id: 'select-line',
    command: 'selection.selectLine',
    key: 'ctrl+l',
    name: '选中行',
    description: '选中当前行',
    preventDefault: true,
    platform: {
      win: 'ctrl+l',
      mac: 'cmd+l',
    },
  },
  {
    id: 'extend-selection-up',
    command: 'selection.extendUp',
    key: 'ctrl+shift+up',
    name: '向上扩展选择',
    description: '向上扩展选区',
    preventDefault: true,
  },
  {
    id: 'extend-selection-down',
    command: 'selection.extendDown',
    key: 'ctrl+shift+down',
    name: '向下扩展选择',
    description: '向下扩展选区',
    preventDefault: true,
  },
  {
    id: 'go-to-start',
    command: 'cursor.goToStart',
    key: 'ctrl+home',
    name: '跳到开头',
    description: '跳到文档开头',
    preventDefault: true,
    platform: {
      win: 'ctrl+home',
      mac: 'cmd+up',
    },
  },
  {
    id: 'go-to-end',
    command: 'cursor.goToEnd',
    key: 'ctrl+end',
    name: '跳到末尾',
    description: '跳到文档末尾',
    preventDefault: true,
    platform: {
      win: 'ctrl+end',
      mac: 'cmd+down',
    },
  },
];

/**
 * 默认完整快捷键映射
 */
export const defaultKeymap: Keymap = {
  name: 'WheelChair 默认快捷键',
  description: 'WheelChair 富文本编辑器的默认快捷键配置',
  bindings: [
    ...textFormatBindings,
    ...paragraphBindings,
    ...listBindings,
    ...historyBindings,
    ...clipboardBindings,
    ...alignmentBindings,
    ...insertBindings,
    ...editorBindings,
    ...selectionBindings,
  ],
};

/**
 * 获取文本格式化快捷键
 */
export function getTextFormatKeymap(): Keymap {
  return {
    name: '文本格式化快捷键',
    description: '文本格式化相关的快捷键',
    bindings: textFormatBindings,
  };
}

/**
 * 获取段落转换快捷键
 */
export function getParagraphKeymap(): Keymap {
  return {
    name: '段落转换快捷键',
    description: '段落类型转换相关的快捷键',
    bindings: paragraphBindings,
  };
}

/**
 * 获取列表操作快捷键
 */
export function getListKeymap(): Keymap {
  return {
    name: '列表操作快捷键',
    description: '列表操作相关的快捷键',
    bindings: listBindings,
  };
}

/**
 * 获取历史操作快捷键
 */
export function getHistoryKeymap(): Keymap {
  return {
    name: '历史操作快捷键',
    description: '撤销重做相关的快捷键',
    bindings: historyBindings,
  };
}

/**
 * 获取剪贴板操作快捷键
 */
export function getClipboardKeymap(): Keymap {
  return {
    name: '剪贴板操作快捷键',
    description: '剪贴板操作相关的快捷键',
    bindings: clipboardBindings,
  };
}

/**
 * 获取对齐方式快捷键
 */
export function getAlignmentKeymap(): Keymap {
  return {
    name: '对齐方式快捷键',
    description: '文本对齐相关的快捷键',
    bindings: alignmentBindings,
  };
}

/**
 * 获取 Mac 平台特定的快捷键映射
 * 将快捷键中的 cmd 替换为 command
 */
export function getMacKeymap(): Keymap {
  return {
    name: 'WheelChair Mac 快捷键',
    description: 'WheelChair 富文本编辑器的 Mac 平台快捷键配置',
    bindings: defaultKeymap.bindings.map(binding => ({
      ...binding,
      key: binding.platform?.mac || binding.key.replace('ctrl', 'cmd'),
    })),
  };
}

/**
 * 获取 Windows/Linux 平台特定的快捷键映射
 */
export function getWinKeymap(): Keymap {
  return {
    name: 'WheelChair Windows 快捷键',
    description: 'WheelChair 富文本编辑器的 Windows 平台快捷键配置',
    bindings: defaultKeymap.bindings.map(binding => ({
      ...binding,
      key: binding.platform?.win || binding.key,
    })),
  };
}

/**
 * 根据当前平台获取默认快捷键
 */
export function getDefaultKeymapForPlatform(): Keymap {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  return isMac ? getMacKeymap() : getWinKeymap();
}

/**
 * 导出快捷键定义常量
 */
export const KeymapDefinitions = {
  textFormat: textFormatBindings,
  paragraph: paragraphBindings,
  list: listBindings,
  history: historyBindings,
  clipboard: clipboardBindings,
  alignment: alignmentBindings,
  insert: insertBindings,
  editor: editorBindings,
  selection: selectionBindings,
};
