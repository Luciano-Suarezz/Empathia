import React from 'react';
import { ToneOption } from '../types';
import { Heart, Briefcase, Zap, Shield, Repeat, HeartPulse, Smile, ArrowRightCircle, Flame } from 'lucide-react';

interface OptionButtonProps {
  option: ToneOption;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const getIcon = (option: ToneOption) => {
  switch (option) {
    case ToneOption.EMPATHY: return <Heart className="w-3.5 h-3.5" />;
    case ToneOption.SUPER_EMPATHY: return <HeartPulse className="w-3.5 h-3.5" />;
    case ToneOption.PARAPHRASE: return <Repeat className="w-3.5 h-3.5" />;
    case ToneOption.PROFESSIONAL: return <Briefcase className="w-3.5 h-3.5" />;
    case ToneOption.SIMPLIFY: return <Zap className="w-3.5 h-3.5" />;
    case ToneOption.ASSERTIVE: return <Shield className="w-3.5 h-3.5" />;
    case ToneOption.FRIENDLY: return <Smile className="w-3.5 h-3.5" />;
    case ToneOption.DIRECT: return <ArrowRightCircle className="w-3.5 h-3.5" />;
    case ToneOption.URGENT: return <Flame className="w-3.5 h-3.5" />;
    default: return null;
  }
};

// More subtle coloring logic
const getColorClass = (option: ToneOption, isSelected: boolean) => {
  if (!isSelected) return "bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-indigo-200 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700/50";
  
  if (option === ToneOption.SUPER_EMPATHY) {
    return "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700/50 ring-1 ring-rose-500/10 dark:ring-rose-500/20 shadow-sm";
  }
  if (option === ToneOption.URGENT) {
    return "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700/50 ring-1 ring-orange-500/10 dark:ring-orange-500/20 shadow-sm";
  }
  if (option === ToneOption.FRIENDLY) {
    return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50 ring-1 ring-emerald-500/10 dark:ring-emerald-500/20 shadow-sm";
  }

  return "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 ring-1 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-sm";
};

export const OptionButton: React.FC<OptionButtonProps> = ({ option, isSelected, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200
        text-xs font-semibold active:scale-95 option-btn
        ${isSelected ? 'option-selected' : ''}
        ${getColorClass(option, isSelected)}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {getIcon(option)}
      <span>{option}</span>
    </button>
  );
};