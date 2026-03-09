import React, { useState } from 'react';
import { X, Globe } from 'lucide-react';
import { InfoLanguage, GUIDE_CONTENT, DISCLAIMER_CONTENT } from '../content/infoContent';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'GUIDE' | 'DISCLAIMER';
  forced?: boolean; // New prop for mandatory acceptance
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, type, forced = false }) => {
  const [language, setLanguage] = useState<InfoLanguage>('ES');

  if (!isOpen) return null;

  const contentSource = type === 'GUIDE' ? GUIDE_CONTENT : DISCLAIMER_CONTENT;
  const content = contentSource[language];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop - Disable click if forced */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={forced ? undefined : onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700 animate-slide-up overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <h2 className={`text-lg font-bold ${type === 'DISCLAIMER' ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {content.title}
          </h2>
          
          {/* Hide Close button if forced */}
          {!forced && (
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 bg-gray-50 dark:bg-slate-950/50 border-b border-gray-100 dark:border-slate-800 overflow-x-auto">
            <Globe className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            {(['ES', 'EN', 'PT', 'FR'] as InfoLanguage[]).map((lang) => (
                <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`
                        px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap
                        ${language === lang 
                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' 
                            : 'text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800'}
                    `}
                >
                    {lang}
                </button>
            ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto text-gray-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            <div dangerouslySetInnerHTML={{ __html: content.body as string }} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/30 flex justify-end">
          <button
            onClick={onClose}
            className={`
                px-6 py-2 rounded-xl text-sm font-semibold transition-transform active:scale-95 shadow-lg
                ${forced 
                    ? 'bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto' 
                    : 'bg-gray-900 dark:bg-slate-700 text-white hover:bg-gray-800 dark:hover:bg-slate-600'}
            `}
          >
            {forced ? (language === 'ES' ? 'Aceptar y Continuar' : 'Accept & Continue') : 'Entendido'}
          </button>
        </div>
      </div>
    </div>
  );
};