/**
 * WheelChair Editor - Table Grid Component
 * 
 * 表格网格选择器组件 - 可视化选择行列数
 */

import React, { useState, useCallback } from 'react';

export interface TableGridProps {
  maxRows?: number;
  maxCols?: number;
  onSelect: (rows: number, cols: number) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  maxRows = 8,
  maxCols = 8,
  onSelect,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ row: number; col: number } | null>(null);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    setHoveredCell({ row, col });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const handleClick = useCallback((row: number, col: number) => {
    setSelectedSize({ row, col });
    onSelect(row, col);
  }, [onSelect]);

  // 获取单元格状态
  const getCellState = (row: number, col: number) => {
    if (hoveredCell) {
      if (row <= hoveredCell.row && col <= hoveredCell.col) {
        return 'hovered';
      }
    }
    if (selectedSize) {
      if (row <= selectedSize.row && col <= selectedSize.col) {
        return 'selected';
      }
    }
    return 'default';
  };

  // 显示当前选中的尺寸
  const displaySize = hoveredCell || selectedSize;

  return (
    <div className="table-grid">
      {/* 网格 */}
      <div className="table-grid-container" onMouseLeave={handleMouseLeave}>
        {Array.from({ length: maxRows }, (_, rowIndex) => (
          <div key={rowIndex} className="table-grid-row">
            {Array.from({ length: maxCols }, (_, colIndex) => {
              const row = rowIndex + 1;
              const col = colIndex + 1;
              const state = getCellState(row, col);

              return (
                <button
                  key={colIndex}
                  className={`table-grid-cell ${state}`}
                  onMouseEnter={() => handleMouseEnter(row, col)}
                  onClick={() => handleClick(row, col)}
                  aria-label={`${row} 行 ${col} 列`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* 尺寸显示 */}
      <div className="table-grid-info">
        {displaySize ? (
          <span>
            {displaySize.row} × {displaySize.col} 表格
          </span>
        ) : (
          <span>选择表格大小</span>
        )}
      </div>

      {/* 自定义尺寸输入 */}
      <div className="table-grid-custom">
        <div className="table-grid-input-group">
          <label>行:</label>
          <input
            type="number"
            min={1}
            max={20}
            value={selectedSize?.row || ''}
            onChange={(e) => {
              const row = parseInt(e.target.value, 10) || 1;
              const col = selectedSize?.col || 3;
              setSelectedSize({ row: Math.min(row, 20), col });
            }}
            className="table-grid-input"
            placeholder="行数"
          />
        </div>
        <span className="table-grid-separator">×</span>
        <div className="table-grid-input-group">
          <label>列:</label>
          <input
            type="number"
            min={1}
            max={20}
            value={selectedSize?.col || ''}
            onChange={(e) => {
              const row = selectedSize?.row || 3;
              const col = parseInt(e.target.value, 10) || 1;
              setSelectedSize({ row, col: Math.min(col, 20) });
            }}
            className="table-grid-input"
            placeholder="列数"
          />
        </div>
        <button
          className="table-grid-confirm"
          onClick={() => {
            if (selectedSize) {
              onSelect(selectedSize.row, selectedSize.col);
            }
          }}
          disabled={!selectedSize}
        >
          插入
        </button>
      </div>
    </div>
  );
};

export default TableGrid;
