import React from 'react';

export interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, className }) => {
  return (
    <div className={`wheelchair-toolbar ${className || ''}`}>
      {children}
    </div>
  );
};
