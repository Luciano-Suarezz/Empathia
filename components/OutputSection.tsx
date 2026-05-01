import React, { useState } from 'react';
import { Copy, Check, GitCompare, Eye, Send, Sparkles, Languages, ArrowDownNarrowWide, Briefcase, Wand2, SpellCheck2, X } from 'lucide-react';
import { DiffView } from './DiffView';
import { VariableManager } from './VariableManager';

interface OutputSectionProps {
  originalText: string;
  transformedText: string;
  correctionSuggestion: string | null;
  isLoading: boolean;
  onRetry: () => void;
  onRefine: (instruction: string) => void;
  onUpdateText: (text: string) => void;
  onCheckGrammar: () => void;
  onApplyCorrection: () => void;
  onDiscardCorrection: () => void;
}

type ViewMode = 'final' | 'diff';

export const OutputSection: React.FC<OutputSectionProps> = ({ 
  originalText, 
  transformedText, 
  correctionSuggestion,
  isLoading, 
  onRetry,
  onRefine,
  onUpdateText,
  onCheckGrammar,
  onApplyCorrection,
  onDiscardCorrection
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('final');
  const [refinementInput, setRefinementInput] = useState('');

  const isCorrecting = correctionSuggestion !== null;

  const handleCopy = async () => {
    if (!transformedText) return;
    try {
      await navigator.clipboard.writeText(transformedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRefineSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!refinementInput.trim() || isLoading) return;
    onRefine(refinementInput);
    setRefinementInput('');
  };

  const handleQuickAction = (action: string) => {
    onRefine(action);
  };

  if (!transformedText && !isLoading) {
    return (
      <div className="theme-panel h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center p-12 text-center group">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative w-24 h-24 bg-indigo-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center shadow-inner">
              <Sparkles className="w-10 h-10 text-indigo-400 dark:text-slate-600 animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Tu respuesta aparecerá aquí</h3>
        <p className="text-sm text-gray-500 dark:text-slate-500 max-w-[280px] leading-relaxed font-medium">
          Una vez que transformes el texto, podrás refinarlo, corregir la ortografía o copiarlo directamente.
        </p>
      </div>
    );
  }

  const currentViewMode = isCorrecting ? 'diff' : viewMode;
  const textToCompareOriginal = isCorrecting ? transformedText : originalText;
  const textToCompareModified = isCorrecting ? (correctionSuggestion || '') : transformedText;

  return (
    <div className={`theme-panel relative flex flex-col h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border ${isCorrecting ? 'border-amber-400 dark:border-amber-600 ring-4 ring-amber-500/10' : 'border-white/20 dark:border-slate-800'} shadow-sm overflow-hidden transition-all duration-500 group`}>
      
      {/* Header */}
      <div className="px-8 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/40 dark:bg-slate-900/40">
        <div className="flex items-center gap-4">
          {isCorrecting ? (
             <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest animate-pulse">
                <SpellCheck2 className="w-4 h-4" />
                <span>Revisión en curso</span>
             </div>
          ) : (
            <div className="flex bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-200/50 dark:border-slate-700/50">
              <button
                onClick={() => setViewMode('final')}
                className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'final' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Final</span>
              </button>
              <button
                onClick={() => setViewMode('diff')}
                className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'diff' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'}`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Cambios</span>
              </button>
            </div>
          )}
        </div>
        
        {!isLoading && transformedText && !isCorrecting && (
          <div className="flex items-center gap-2">
            <button
              onClick={onCheckGrammar}
              className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors border border-amber-100 dark:border-amber-900/30"
              title="Revisar ortografía"
            >
               <SpellCheck2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                ${copied 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                }
              `}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto relative custom-scrollbar">
        {!isCorrecting && <VariableManager text={transformedText} onUpdateText={onUpdateText} />}

        {isLoading && !transformedText ? (
          <div className="space-y-6 animate-pulse mt-4">
            <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-full w-3/4"></div>
            <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-full w-full"></div>
            <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-full w-5/6"></div>
            <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-full w-2/3"></div>
          </div>
        ) : (
          currentViewMode === 'final' ? (
            <div className="h-full flex flex-col animate-fade-in">
                {isLoading && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    <span>Actualizando...</span>
                  </div>
                )}
                <textarea
                    className="flex-1 w-full bg-transparent border-none outline-none resize-none text-gray-800 dark:text-slate-100 leading-relaxed font-medium text-lg placeholder:text-gray-300 dark:placeholder:text-slate-800 p-0"
                    value={transformedText}
                    onChange={(e) => onUpdateText(e.target.value)}
                    spellCheck={true}
                    lang="es" 
                    placeholder="El resultado aparecerá aquí..."
                />
            </div>
          ) : (
            <div className="animate-fade-in">
                {isCorrecting && (
                  <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
                     <span>Original</span>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 ml-4"></div>
                     <span>Sugerencia</span>
                  </div>
                )}
                <DiffView original={textToCompareOriginal} modified={textToCompareModified} />
                {isCorrecting && isLoading && <div className="mt-8 text-xs font-bold text-amber-500 animate-pulse uppercase tracking-widest">Analizando...</div>}
            </div>
          )
        )}
      </div>

      {/* Footer / Refinement */}
      {!isLoading && transformedText && !isCorrecting && (
        <div className="p-6 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 backdrop-blur-xl">
          <div className="flex flex-wrap gap-2 mb-6">
             {[
               { label: "Más Corto", icon: ArrowDownNarrowWide, action: "Hazlo más corto" },
               { label: "Más Formal", icon: Briefcase, action: "Hazlo más formal y profesional" },
               { label: "Inglés", icon: Languages, action: "Traducir a Inglés" }
             ].map((btn) => (
               <button 
                 key={btn.label}
                 onClick={() => handleQuickAction(btn.action)} 
                 className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm"
               >
                  <btn.icon className="w-3 h-3" />
                  <span>{btn.label}</span>
               </button>
             ))}
          </div>

          <form onSubmit={handleRefineSubmit} className="relative">
            <input
              type="text"
              value={refinementInput}
              onChange={(e) => setRefinementInput(e.target.value)}
              placeholder="¿Algún ajuste final? Ej: 'Quita la disculpa'..."
              className="w-full pl-6 pr-14 py-4 text-sm font-medium rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={!refinementInput.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-30 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Correction Actions Overlay */}
      {isCorrecting && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-6 animate-slide-up z-30 shadow-2xl">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
                ¿Aplicar correcciones?
            </div>
            <div className="flex gap-3">
                <button 
                  onClick={onDiscardCorrection}
                  className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                    Descartar
                </button>
                <button 
                   onClick={onApplyCorrection}
                   className="px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                    <Check className="w-4 h-4" />
                    <span>Aplicar</span>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};