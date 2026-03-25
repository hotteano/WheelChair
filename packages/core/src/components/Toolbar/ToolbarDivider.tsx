import React from 'react';
import { cn } from '../../utils/cn';

export interface ToolbarDividerProps {
  /** 分隔线方向 */
  orientation?: 'vertical' | 'horizontal';
  /** 自定义类名 */
  className?: string;
  /** 额外间距 */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const ToolbarDivider: React.FC<ToolbarDividerProps> = ({
  orientation = 'vertical',
  className,
  spacing = 'md',
}) => {
  const spacingStyles = {
    none: '',
    sm: orientation === 'vertical' ? 'mx-1' : 'my-1',
    md: orientation === 'vertical' ? 'mx-2' : 'my-2',
    lg: orientation === 'vertical' ? 'mx-3' : 'my-3',
  };

  const orientationStyles = {
    vertical: 'w-px h-6 bg-gray-300 self-center',
    horizontal: 'h-px w-full bg-gray-300',
  };

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientationStyles[orientation],
        spacingStyles[spacing],
        className
      )}
    />
  );
};

ToolbarDivider.displayName = 'ToolbarDivider';

export default ToolbarDivider;
