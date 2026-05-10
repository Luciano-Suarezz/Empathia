import React from 'react';
import { LengthOption } from '../types';
import { Minimize2, Maximize2, MoveHorizontal } from 'lucide-react';

interface LengthSelectorProps {
  selectedLength: LengthOption;
  onChange: (length: LengthOption) => void;
  disabled?: boolean;
}

export const LengthSelector: React.FC<LengthSelectorProps> = ({ selectedLength, onChange, disabled }) => {
  return (
    <div className="flex p-1 bg-gray-100/80 dark:bg-zinc-900/80 rounded-xl border border-gray-200/50 dark:border-zinc-800 backdrop-blur-sm h-full">
      {Object.values(LengthOption).map((option) => {
        const isSelected = selectedLength === option;
        
        let Icon = MoveHorizontal;
        if (option === LengthOption.SHORT) Icon = Minimize2;
        if (option === LengthOption.LONG) Icon = Maximize2;

        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            disabled={disabled}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
              ${isSelected 
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none' 
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={`Longitud: ${option}`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-500 dark:text-indigo-400' : 'opacity-70'}`} />
            <span className="hidden sm:inline">{option}</span>
            <span className="sm:hidden">{option[0]}</span>
          </button>
        );
      })}
    </div>
  );
};