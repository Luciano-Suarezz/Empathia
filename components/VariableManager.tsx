import React, { useEffect, useState } from 'react';
import { PencilLine } from 'lucide-react';

interface VariableManagerProps {
  text: string;
  onUpdateText: (newText: string) => void;
}

interface Variable {
  original: string; // The full string "[ISSUE]"
  key: string;      // "ISSUE"
  value: string;    // Current value
  index: number;    // Position to uniqueness
}

export const VariableManager: React.FC<VariableManagerProps> = ({ text, onUpdateText }) => {
  const [variables, setVariables] = useState<Variable[]>([]);

  // Detect variables on mount or when text changes drastically (though we want to avoid loops)
  // We use a simpler approach: Parse text, find brackets. 
  useEffect(() => {
    const regex = /\[(.*?)\]/g;
    let match;
    const found: Variable[] = [];
    let i = 0;
    
    // We only want to auto-detect if we haven't already filled them, 
    // but for simplicity in this stateless version, we scan the current text.
    // NOTE: This simple version re-scans. If user types in the textarea, it works.
    while ((match = regex.exec(text)) !== null) {
      found.push({
        original: match[0],
        key: match[1],
        value: '', 
        index: i++
      });
    }
    
    // Solo actualizamos si la cantidad cambia para evitar re-render loops si el usuario edita el texto manualmente
    // O si es la primera vez
    if (found.length > 0 && variables.length === 0) {
        setVariables(found);
    } else if (found.length === 0 && variables.length > 0) {
        setVariables([]);
    }
  }, [text]);

  const handleValueChange = (index: number, newValue: string) => {
    const variable = variables[index];
    if (!variable) return;

    // Replace first occurrence of this variable in the text
    // This is a naive replacement strategy suitable for simple templates
    const newText = text.replace(variable.original, newValue);
    onUpdateText(newText);
    
    // Remove the variable from our list since it's replaced
    const newVars = [...variables];
    newVars.splice(index, 1);
    setVariables(newVars);
  };

  if (variables.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-200 text-xs font-bold uppercase tracking-wider">
        <PencilLine className="w-3.5 h-3.5" />
        Variables Detectadas
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {variables.map((v, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <label className="text-xs text-amber-700 dark:text-amber-300 font-mono">
              {v.original}
            </label>
            <input
              type="text"
              autoFocus={idx === 0}
              placeholder={`Escribe para reemplazar...`}
              className="px-3 py-1.5 text-sm rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500/50 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleValueChange(idx, e.currentTarget.value);
                }
              }}
              onBlur={(e) => {
                  if(e.target.value) handleValueChange(idx, e.target.value);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};