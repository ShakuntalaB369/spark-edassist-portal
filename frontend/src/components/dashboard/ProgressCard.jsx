import React from 'react';
import { formatPercentage } from '../../utils/formatter';

export const ProgressCard = ({
  title,
  weight,
  score,
  maxScore,
  colorClass,
  isActive,
  onClick
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <div
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer group ${
        isActive
          ? 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10'
          : 'hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorClass }} />
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">
          {title}
          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-normal ml-1">({weight}%)</span>
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">
          {formatPercentage(score)}
        </span>
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${percentage}%`, backgroundColor: colorClass }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
