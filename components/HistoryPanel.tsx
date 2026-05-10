import React from 'react';
import { History, Clock, ArrowRight, RotateCcw, X } from 'lucide-react';
import { HistoryItem, MacroType } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onRestore }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-zinc-900 
          shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-zinc-800
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
              <History className="w-5 h-5" />
              <h2>Historial Reciente</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-zinc-500">
                <Clock className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">No hay historial todavía</p>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  className="group relative p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all cursor-pointer"
                  onClick={() => onRestore(item)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                      {item.macro === MacroType.FULL ? 'Completo' : item.macro === MacroType.FIRST ? 'Primer' : 'Segundo'}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-zinc-300 line-clamp-2 mb-3">
                    {item.transformed}
                  </p>

                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Restaurar</span>
                      <RotateCcw className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};