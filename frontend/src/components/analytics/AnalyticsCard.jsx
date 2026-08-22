import React from 'react';

const ICON_MAP = {
  'DEEPER UNDERSTANDING': (
    <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'PERSONALIZED ASSESSMENT': (
    <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
    </svg>
  ),
  'TARGETED IMPROVEMENT': (
    <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),
  'REAL-WORLD COMPETENCY': (
    <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeLinecap="round"/>
    </svg>
  ),
};

export const AnalyticsCard = ({ label, value, colorClass }) => {
  return (
    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-[#1e293b] rounded-xl p-4 flex flex-col gap-3 hover:border-slate-300 dark:hover:border-white/10 transition-colors duration-150">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 ${colorClass}`}>
        {ICON_MAP[label] || null}
      </div>
      <div>
        <div className={`text-[14px] font-bold leading-snug ${colorClass}`}>{value}</div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mt-1">{label}</div>
      </div>
    </div>
  );
};

export default AnalyticsCard;
