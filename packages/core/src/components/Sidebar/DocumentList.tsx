/**
 * WheelChair Editor - DocumentList Component
 * 文档列表组件
 */

import React from 'react';
import type { Document } from '../../document/types';
import { DocumentItem } from './DocumentItem';

export interface DocumentListProps {
  documents: Document[];
  activeDocumentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDuplicate: (id: string) => void;
  emptyText?: string;
  className?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  activeDocumentId,
  onSelect,
  onDelete,
  onRename,
  onDuplicate,
  emptyText = '暂无文档',
  className = '',
}) => {
  if (documents.length === 0) {
    return (
      <div className={`wch-doc-list__empty ${className}`}>
        <EmptyIcon />
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={`wch-doc-list ${className}`}>
      {documents.map(doc => (
        <DocumentItem
          key={doc.id}
          document={doc}
          isActive={doc.id === activeDocumentId}
          onSelect={() => onSelect(doc.id)}
          onDelete={() => onDelete(doc.id)}
          onRename={(newTitle) => onRename(doc.id, newTitle)}
          onDuplicate={() => onDuplicate(doc.id)}
        />
      ))}
    </div>
  );
};

const EmptyIcon: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.5 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default DocumentList;
