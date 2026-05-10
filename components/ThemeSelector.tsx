import React, { useState, useEffect, useRef } from 'react';
import { Palette, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const THEMES = [
  { id: 'original', name: 'Original', icon: '✨' },
  { id: 'glassmorphism', name: 'Glassmorphism', icon: '🪟' },
  { id: 'ios', name: 'iOS 26 Liquid', icon: '🍎' },
  { id: 'neumorphism', name: 'Neumorphism', icon: '🧴' },
  { id: 'claymorphism', name: 'Claymorphism', icon: '🧱' },
  { id: 'auroramorphism', name: 'Auroramorphism', icon: '🌌' },
  { id: 'neo-brutalism', name: 'Neo-Brutalism', icon: '⚡' },
  { id: 'bento-grid', name: 'Bento Grid', icon: '🍱' },
  { id: 'skeuomorphism', name: 'Skeuomorphism', icon: '📱' },
  { id: 'y2k', name: 'Retro Y2K', icon: '💿' },
  { id: 'cyber-neon', name: 'Cyber Neon', icon: '🌠' },
  { id: 'dopamine', name: 'Dopamine Design', icon: '🎉' },
  { id: 'opencode', name: 'OpenCode', icon: '💻' },
];

export const ThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('empathia_custom_theme');
    return saved || 'original';
  });

  useEffect(() => {
    if (activeTheme === 'original') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', activeTheme);
    }
    localStorage.setItem('empathia_custom_theme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedThemeItem = THEMES.find(t => t.id === activeTheme) || THEMES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all border
          ${activeTheme !== 'original' 
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' 
            : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'} hover:shadow-md`}
        title="Cambiar Diseño Visual"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-semibold hidden sm:inline-block">
          {selectedThemeItem.icon} {selectedThemeItem.name}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden z-50"
          >
            <div className="p-2 space-y-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setActiveTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${activeTheme === theme.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' 
                      : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{theme.icon}</span>
                    <span>{theme.name}</span>
                  </div>
                  {activeTheme === theme.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
