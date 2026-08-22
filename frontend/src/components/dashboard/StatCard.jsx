import React from 'react';

export const StatCard = ({ value, label, valueColorClass = 'text-slate-900 dark:text-white' }) => {
  return (
    <div className="bg-slate-200/50 dark:bg-white/[0.02] border border-slate-300 dark:border-panel-border rounded-xl p-4 text-center flex flex-col items-center justify-center gap-1">
      <span className={`font-heading text-2xl font-extrabold ${valueColorClass}`}>
        {value}
      </span>
      <span className="text-[11.2px] text-slate-500 dark:text-text-secondary uppercase font-bold">
        {label}
      </span>
    </div>
  );
};
