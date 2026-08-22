import React from 'react';
import { Sparkles } from 'lucide-react';

export const OptionCard = ({ optionText, isSelected, isCorrect, isIncorrect, onClick, isLocked }) => {
  let btnClass = "w-full bg-slate-200/40 dark:bg-white/[0.02] border border-slate-300 dark:border-panel-border p-4 rounded-xl text-left cursor-pointer transition-all duration-200 flex justify-between items-center font-medium hover:bg-slate-300/50 dark:hover:bg-white/[0.05] hover:border-slate-400 dark:hover:border-white/15 hover:translate-x-[3px] text-slate-900 dark:text-white";

  if (isSelected) {
    btnClass = "w-full border-foundational bg-foundational/10 dark:bg-foundational/8 p-4 rounded-xl text-left cursor-pointer transition-all duration-200 flex justify-between items-center font-medium hover:translate-x-[3px] text-foundational dark:text-white";
  }
  if (isLocked) {
    if (isCorrect) {
      btnClass = "w-full border-applied bg-applied/8 p-4 rounded-xl text-left cursor-default transition-all duration-200 flex justify-between items-center font-medium text-emerald-600 dark:text-emerald-400";
    } else if (isIncorrect) {
      btnClass = "w-full border-red-500 bg-red-500/8 p-4 rounded-xl text-left cursor-default transition-all duration-200 flex justify-between items-center font-medium text-red-600 dark:text-red-300";
    } else {
      btnClass = "w-full bg-slate-200/10 dark:bg-white/[0.01] border border-slate-200 dark:border-panel-border p-4 rounded-xl text-left cursor-default transition-all duration-200 flex justify-between items-center font-medium text-slate-400 dark:text-text-muted";
    }
  }

  return (
    <button 
      className={btnClass}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
    >
      <span>{optionText}</span>
      {isSelected && !isLocked && <Sparkles size={14} className="text-blue-400" />}
    </button>
  );
};
