import React from 'react';
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarDropdown,
  defaultFormatItems,
  defaultParagraphItems,
  defaultInsertItems,
} from './';

/**
 * 示例 1: 基础工具栏
 */
export function BasicToolbarExample() {
  return (
    <Toolbar>
      <ToolbarButton icon={<span>📝</span>} label="编辑" />
      <ToolbarButton icon={<span>💾</span>} label="保存" />
      <ToolbarDivider />
      <ToolbarButton icon={<span>↩️</span>} tooltip="撤销 (Ctrl+Z)" />
      <ToolbarButton icon={<span>↪️</span>} tooltip="重做 (Ctrl+Y)" />
    </Toolbar>
  );
}

/**
 * 示例 2: 使用预设配置
 */
export function PresetToolbarExample() {
  // 自定义配置项
  const formatItems = defaultFormatItems.map((item) => {
    if (item.type === 'button') {
      return {
        ...item,
        onClick: () => console.log(`点击: ${item.id}`),
        active: item.id === 'bold', // 模拟粗体激活
      };
    }
    return item;
  });

  return (
    <Toolbar
      items={[
        ...formatItems,
        { type: 'divider', id: 'sep1' },
        ...defaultParagraphItems,
        { type: 'divider', id: 'sep2' },
        ...defaultInsertItems,
      ]}
    />
  );
}

/**
 * 示例 3: 浮动工具栏
 */
export function FloatingToolbarExample() {
  return (
    <Toolbar variant="floating" size="sm">
      <ToolbarButton icon={<span>B</span>} label="粗体" active />
      <ToolbarButton icon={<span>I</span>} label="斜体" />
      <ToolbarButton icon={<span>U</span>} label="下划线" />
    </Toolbar>
  );
}

/**
 * 示例 4: 垂直工具栏
 */
export function VerticalToolbarExample() {
  return (
    <Toolbar orientation="vertical" className="w-12">
      <ToolbarButton icon={<span>B</span>} iconOnly tooltip="粗体" />
      <ToolbarButton icon={<span>I</span>} iconOnly tooltip="斜体" />
      <ToolbarButton icon={<span>U</span>} iconOnly tooltip="下划线" />
      <ToolbarDivider orientation="horizontal" />
      <ToolbarButton icon={<span>🔗</span>} iconOnly tooltip="链接" />
    </Toolbar>
  );
}

/**
 * 示例 5: 带下拉菜单的工具栏
 */
export function DropdownToolbarExample() {
  const fontSizeOptions = [
    { value: '12px', label: '12px' },
    { value: '14px', label: '14px' },
    { value: '16px', label: '16px (默认)' },
    { value: '18px', label: '18px' },
    { value: '20px', label: '20px' },
    { value: '24px', label: '24px' },
  ];

  const alignOptions = [
    { value: 'left', label: '左对齐', icon: <span>⬅️</span> },
    { value: 'center', label: '居中', icon: <span>⬆️</span> },
    { value: 'right', label: '右对齐', icon: <span>➡️</span> },
  ];

  return (
    <Toolbar>
      <ToolbarDropdown
        label="16px"
        options={fontSizeOptions}
        onChange={(value) => console.log('字体大小:', value)}
      />
      <ToolbarDivider />
      <ToolbarDropdown
        icon={<span>⬅️</span>}
        options={alignOptions}
        onChange={(value) => console.log('对齐方式:', value)}
      />
    </Toolbar>
  );
}

/**
 * 示例 6: 分组工具栏
 */
export function GroupedToolbarExample() {
  const items = [
    {
      type: 'group' as const,
      id: 'history',
      title: '历史',
      items: [
        { type: 'button' as const, id: 'undo', icon: <span>↩️</span>, label: '撤销', onClick: () => {} },
        { type: 'button' as const, id: 'redo', icon: <span>↪️</span>, label: '重做', onClick: () => {} },
      ],
    },
    { type: 'divider' as const, id: 'sep1' },
    {
      type: 'group' as const,
      id: 'format',
      title: '格式',
      items: [
        { type: 'button' as const, id: 'bold', icon: <span>B</span>, label: '粗体', active: true, onClick: () => {} },
        { type: 'button' as const, id: 'italic', icon: <span>I</span>, label: '斜体', onClick: () => {} },
      ],
    },
  ];

  return <Toolbar items={items} />;
}

/**
 * 示例 7: 响应式工具栏
 */
export function ResponsiveToolbarExample() {
  return (
    <Toolbar responsive size="md">
      {/* 基础格式 */}
      <ToolbarButton icon={<span>B</span>} iconOnly tooltip="粗体" />
      <ToolbarButton icon={<span>I</span>} iconOnly tooltip="斜体" />
      <ToolbarButton icon={<span>U</span>} iconOnly tooltip="下划线" />
      <ToolbarDivider />
      
      {/* 段落格式 */}
      <ToolbarButton icon={<span>•</span>} iconOnly tooltip="无序列表" />
      <ToolbarButton icon={<span>1.</span>} iconOnly tooltip="有序列表" />
      <ToolbarDivider />
      
      {/* 插入 */}
      <ToolbarButton icon={<span>🖼️</span>} iconOnly tooltip="图片" />
      <ToolbarButton icon={<span>📊</span>} iconOnly tooltip="表格" />
      <ToolbarButton icon={<span>🔗</span>} iconOnly tooltip="链接" />
      <ToolbarDivider />
      
      {/* 对齐 */}
      <ToolbarButton icon={<span>⬅️</span>} iconOnly tooltip="左对齐" active />
      <ToolbarButton icon={<span>⬆️</span>} iconOnly tooltip="居中" />
      <ToolbarButton icon={<span>➡️</span>} iconOnly tooltip="右对齐" />
    </Toolbar>
  );
}
