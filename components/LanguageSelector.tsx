import React from 'react';
import { OutputLanguage } from '../types';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: OutputLanguage;
  onChange: (lang: OutputLanguage) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onChange, disabled }) => {
  const primaryLanguages = [
    OutputLanguage.ES,
    OutputLanguage.PT,
    OutputLanguage.EN,
    OutputLanguage.FR
  ];

  const otherLanguages = [
    OutputLanguage.IT,
    OutputLanguage.DE,
    OutputLanguage.NL,
    OutputLanguage.RO,
    OutputLanguage.EL,
    OutputLanguage.PL,
    OutputLanguage.CS,
    OutputLanguage.SV,
    OutputLanguage.DA,
    OutputLanguage.FI,
    OutputLanguage.HU,
    OutputLanguage.BG,
    OutputLanguage.NO,
    OutputLanguage.SK,
    OutputLanguage.HR,
    OutputLanguage.SR,
    OutputLanguage.UK,
    OutputLanguage.LT,
    OutputLanguage.LV,
    OutputLanguage.ET,
    OutputLanguage.SL,
    OutputLanguage.RU,
    OutputLanguage.ZH,
    OutputLanguage.JA
  ].sort();

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors group">
        <Globe className="w-4 h-4 text-gray-500 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
        <select
          value={selectedLanguage}
          onChange={(e) => onChange(e.target.value as OutputLanguage)}
          disabled={disabled}
          className="w-full sm:w-auto appearance-none bg-transparent border-none text-sm font-medium text-gray-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-4 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundImage: 'none' }} // Remove default arrow in some browsers
        >
          <option value={OutputLanguage.AUTO} className="bg-white dark:bg-slate-800">{OutputLanguage.AUTO}</option>
          
          <optgroup label="Principales" className="bg-white dark:bg-slate-800">
            {primaryLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </optgroup>

          <optgroup label="Otros" className="bg-white dark:bg-slate-800">
            {otherLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </optgroup>
        </select>
        {/* Custom arrow for better styling */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="w-3 h-3 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};