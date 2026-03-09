import React from 'react';
import { PerspectiveOption } from '../types';
import { Users, User } from 'lucide-react';

interface PerspectiveSelectorProps {
  selectedPerspective: PerspectiveOption;
  onChange: (perspective: PerspectiveOption) => void;
  disabled?: boolean;
}

export const PerspectiveSelector: React.FC<PerspectiveSelectorProps> = ({ selectedPerspective, onChange, disabled }) => {
  return (
    <div className="flex items-center bg-gray-100/80 dark:bg-slate-900/80 p-1 rounded-full border border-gray-200/50 dark:border-slate-800 backdrop-blur-sm">
      {Object.values(PerspectiveOption).map((option) => {
        const isSelected = selectedPerspective === option;
        const isWe = option === PerspectiveOption.WE;
        const label = isWe ? 'Nosotros' : 'Yo';
        
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            disabled={disabled}
            className={`
              relative flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200
              ${isSelected 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-[0_1px_2px_rgba(0,0,0,0.1)]' 
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={option}
          >
            {isWe ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};