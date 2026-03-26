/**
 * WheelChair Editor - Split Pane Component
 * 双栏分割组件 - 支持可拖拽调整大小的双栏布局
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import './SplitPane.css';

// ============================================
// 类型定义
// ============================================

export interface SplitPaneProps {
  /** 左/上侧面板内容 */
  firstPane: React.ReactNode;
  /** 右/下侧面板内容 */
  secondPane: React.ReactNode;
  /** 分割方向 */
  direction?: 'horizontal' | 'vertical';
  /** 初始分割位置（百分比 0-100） */
  defaultSplit?: number;
  /** 最小面板尺寸（像素） */
  minSize?: number;
  /** 自定义类名 */
  className?: string;
  /** 分割位置变化回调 */
  onSplitChange?: (split: number) => void;
  /** 是否显示分割线 */
  showDivider?: boolean;
  /** 是否允许拖拽调整 */
  resizable?: boolean;
}

// ============================================
// 组件
// ============================================

export const SplitPane: React.FC<SplitPaneProps> = ({
  firstPane,
  secondPane,
  direction = 'horizontal',
  defaultSplit = 50,
  minSize = 200,
  className = '',
  onSplitChange,
  showDivider = true,
  resizable = true,
}) => {
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitPosRef = useRef(split);
  
  // 同步 ref 与 state
  useEffect(() => {
    splitPosRef.current = split;
  }, [split]);
  
  // 处理拖拽开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!resizable) return;
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [resizable, direction]);
  
  // 处理拖拽移动
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      let newSplit: number;
      
      if (direction === 'horizontal') {
        // 水平分割：计算左右比例
        const x = e.clientX - rect.left;
        newSplit = (x / rect.width) * 100;
      } else {
        // 垂直分割：计算上下比例
        const y = e.clientY - rect.top;
        newSplit = (y / rect.height) * 100;
      }
      
      // 限制最小尺寸
      const minPercent = (minSize / (direction === 'horizontal' ? rect.width : rect.height)) * 100;
      newSplit = Math.max(minPercent, Math.min(100 - minPercent, newSplit));
      
      setSplit(newSplit);
      onSplitChange?.(newSplit);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, direction, minSize, onSplitChange]);
  
  // 计算面板样式
  const isHorizontal = direction === 'horizontal';
  const firstPaneStyle: React.CSSProperties = isHorizontal
    ? { width: `${split}%`, height: '100%' }
    : { height: `${split}%`, width: '100%' };
    
  const secondPaneStyle: React.CSSProperties = isHorizontal
    ? { width: `${100 - split}%`, height: '100%' }
    : { height: `${100 - split}%`, width: '100%' };
  
  return (
    <div 
      ref={containerRef}
      className={`wch-split-pane wch-split-pane--${direction} ${isDragging ? 'is-dragging' : ''} ${className}`}
    >
      {/* 第一面板 */}
      <div 
        className="wch-split-pane__pane wch-split-pane__first"
        style={firstPaneStyle}
      >
        {firstPane}
      </div>
      
      {/* 分割线 */}
      {showDivider && resizable && (
        <div 
          className="wch-split-pane__divider"
          onMouseDown={handleMouseDown}
          title={`拖拽调整${isHorizontal ? '左右' : '上下'}面板大小`}
        >
          <div className="wch-split-pane__divider-handle" />
        </div>
      )}
      
      {/* 第二面板 */}
      <div 
        className="wch-split-pane__pane wch-split-pane__second"
        style={secondPaneStyle}
      >
        {secondPane}
      </div>
    </div>
  );
};

export default SplitPane;
