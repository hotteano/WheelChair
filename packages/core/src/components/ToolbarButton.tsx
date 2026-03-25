import React from 'react';
import { classNames } from '../utils';

interface ToolbarButtonProps {
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  isActive,
  isDisabled,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={classNames(
        'wheelchair-toolbar-button',
        isActive && 'is-active',
        className
      )}
      title={label}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label && !Icon && <span className="text-sm">{label}</span>}
    </button>
  );
};
