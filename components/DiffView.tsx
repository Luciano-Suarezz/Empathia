import React from 'react';
import { diffWords } from 'diff';

interface DiffViewProps {
  original: string;
  modified: string;
}

export const DiffView: React.FC<DiffViewProps> = ({ original, modified }) => {
  if (!original || !modified) return null;

  const diff = diffWords(original, modified);

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none text-lg leading-relaxed whitespace-pre-wrap">
      {diff.map((part, index) => {
        const color = part.added
          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 decoration-green-500'
          : part.removed
          ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 decoration-red-500 line-through decoration-2 opacity-70'
          : 'text-gray-800 dark:text-slate-200';

        return (
          <span key={index} className={`${color} px-0.5 rounded-sm`}>
            {part.value}
          </span>
        );
      })}
    </div>
  );
};