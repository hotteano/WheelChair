/**
 * WheelChair Editor - NewDocumentButton Component
 * 新建文档按钮
 */

import React from 'react';

export interface NewDocumentButtonProps {
  onClick: () => void;
  className?: string;
}

export const NewDocumentButton: React.FC<NewDocumentButtonProps> = ({
  onClick,
  className = '',
}) => {
  return (
    <button
      className={`wch-new-doc-btn ${className}`}
      onClick={onClick}
      title="新建文档 (Ctrl+N)"
    >
      <PlusIcon />
      <span>新建文档</span>
    </button>
  );
};

const PlusIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default NewDocumentButton;
