import React from 'react';
import { ModelOption } from '../types';
import { Zap, Feather } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: ModelOption;
  onChange: (model: ModelOption) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onChange, disabled }) => {
  return (
    <div className="relative inline-block w-full sm:w-auto">
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors group">
        {selectedModel === ModelOption.FLASH ? (
            <Zap className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
        ) : (
            <Feather className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600" />
        )}
        
        <select
          value={selectedModel}
          onChange={(e) => onChange(e.target.value as ModelOption)}
          disabled={disabled}
          className="w-full sm:w-auto appearance-none bg-transparent border-none text-sm font-medium text-gray-700 dark:text-zinc-200 focus:outline-none cursor-pointer pr-4 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundImage: 'none' }}
        >
          <option value={ModelOption.LITE} className="bg-white dark:bg-zinc-800">Flash Lite</option>
          <option value={ModelOption.FLASH} disabled className="bg-white dark:bg-zinc-800 text-gray-400">Flash 3 (No disponible)</option>
        </select>
        
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="w-3 h-3 text-gray-400 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};