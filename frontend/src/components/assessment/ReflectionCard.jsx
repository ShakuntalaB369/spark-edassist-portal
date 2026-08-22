import React from 'react';
import { Sparkles } from 'lucide-react';
import { StatCard } from '../dashboard/StatCard';

export const ReflectionCard = ({ signature }) => {
  if (!signature) return null;

  return (
    <div className="bg-gradient-to-br from-reflective/5 to-collaborative/5 border border-reflective/25 rounded-xl p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10.4px] uppercase text-text-muted font-bold">Cognitive Profile Unlocked</span>
          <div className="text-[18.4px] font-extrabold text-[#fbbf24]">{signature.type}</div>
        </div>
        <Sparkles size={24} className="text-[#fbbf24] animate-pulse-glow" />
      </div>

      <p className="text-[13.6px] text-slate-600 dark:text-text-secondary leading-[1.5]">
        {signature.description}
      </p>

      <div className="grid grid-cols-3 gap-3 mt-2">
        <StatCard 
          value={`${signature.conceptual} / 10`}
          label="Conceptual Analysis"
        />
        <StatCard 
          value={`${signature.pragmatic} / 10`}
          label="Pragmatic Execution"
        />
        <StatCard 
          value={`${signature.collaborative} / 10`}
          label="Collaborative Spirit"
        />
      </div>
    </div>
  );
};
export default ReflectionCard;
