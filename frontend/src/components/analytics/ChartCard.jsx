import React from 'react';
import { CheckCircle2, TrendingUp } from 'lucide-react';

export const ChartCard = ({ rippleNodes }) => {
  const completedCount = rippleNodes.filter(n => n.status === 'completed').length;
  const progressPercentage = Math.min((completedCount / 4) * 100, 100);

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp size={13} className="text-slate-400 dark:text-slate-500" />
        <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">
          From Assessment to Impact
        </span>
      </div>

      {/* Stepper container */}
      <div className="relative overflow-x-auto scrollbar-thin pb-1">
        <div className="flex items-start min-w-[520px] md:min-w-0 relative px-2 pt-3 pb-4 gap-0">
          
          {/* Connector background track */}
          <div className="absolute top-[28px] left-[32px] right-[32px] h-[2px] bg-slate-200 dark:bg-white/8 rounded-full" />
          {/* Active fill */}
          <div
            className="absolute top-[28px] left-[32px] h-[2px] bg-[#1E3A8A] dark:bg-blue-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `calc(${progressPercentage}% * ((100% - 64px) / 100%))` }}
          />

          {rippleNodes.map((node, nIdx) => {
            const isCompleted = node.status === 'completed';
            const isActive = node.status === 'active';
            const isInactive = node.status === 'inactive';

            return (
              <div
                key={node.id}
                className={`flex flex-col items-center text-center flex-1 relative z-20 transition-all duration-300 ${
                  isInactive ? 'opacity-40' : 'opacity-100'
                }`}
              >
                {/* Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 transition-all duration-300 ${
                    isActive
                      ? 'ring-4 ring-blue-100 dark:ring-blue-500/20 text-white shadow-md'
                      : isCompleted
                      ? 'text-white'
                      : 'bg-slate-100 dark:bg-white/5 border-2 border-slate-300 dark:border-white/15 text-slate-400'
                  }`}
                  style={{
                    backgroundColor: (isActive || isCompleted) ? 'var(--primary)' : undefined,
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : nIdx + 1}
                </div>

                {/* Text */}
                <div className="mt-2 px-1">
                  <div className={`text-[11.5px] leading-snug font-bold ${
                    isActive
                      ? 'text-[#1E3A8A] dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {node.label}
                  </div>
                  <div className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed max-w-[100px]">
                    {node.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
