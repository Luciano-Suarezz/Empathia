import React from 'react';
import { MacroType } from '../types';
import { FileText, MessageCircle, Reply } from 'lucide-react';

interface MacroSelectorProps {
  selectedMacro: MacroType;
  onChange: (macro: MacroType) => void;
  disabled?: boolean;
}

export const MacroSelector: React.FC<MacroSelectorProps> = ({ selectedMacro, onChange, disabled }) => {
  return (
    <div className="flex p-1 bg-gray-100/80 dark:bg-zinc-900/80 rounded-xl border border-gray-200/50 dark:border-zinc-800 backdrop-blur-sm">
      {Object.values(MacroType).map((macro) => {
        const isSelected = selectedMacro === macro;
        
        let Icon = FileText;
        if (macro === MacroType.FIRST) Icon = MessageCircle;
        if (macro === MacroType.SECOND) Icon = Reply;

        // Simplify labels for mobile/visual cleanliness if needed, currently keeping full
        const label = macro;

        return (
          <button
            key={macro}
            onClick={() => onChange(macro)}
            disabled={disabled}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-tight transition-all duration-200
              ${isSelected 
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none' 
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <Icon className={`w-3 h-3 ${isSelected ? 'text-indigo-500 dark:text-indigo-400' : 'opacity-70'}`} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};