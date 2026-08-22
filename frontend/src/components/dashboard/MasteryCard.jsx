import React, { useState } from 'react';
import { getMasteryStatus } from '../../utils/scoreCalculator';

export const MasteryCard = ({ scores, totalScore }) => {
  const [tooltip, setTooltip] = useState(null);
  const masteryStatus = getMasteryStatus(totalScore);

  const radius = 78;
  const strokeWidth = 16;
  const circ = 2 * Math.PI * radius;

  const lenFoundational = circ * 0.40;
  const lenApplied = circ * 0.30;
  const lenCollaborative = circ * 0.20;
  const lenReflective = circ * 0.10;

  const pctFoundational = Math.min(Math.max((scores.foundationalScore || 0) / 40, 0), 1);
  const pctApplied = Math.min(Math.max((scores.appliedScore || 0) / 30, 0), 1);
  const pctCollaborative = Math.min(Math.max((scores.collaborativeScore || 0) / 20, 0), 1);
  const pctReflective = Math.min(Math.max((scores.reflectiveScore || 0) / 10, 0), 1);

  const fillFoundational = lenFoundational * pctFoundational;
  const fillApplied = lenApplied * pctApplied;
  const fillCollaborative = lenCollaborative * pctCollaborative;
  const fillReflective = lenReflective * pctReflective;

  const offsetFoundational = 0;
  const offsetApplied = -lenFoundational;
  const offsetCollaborative = -(lenFoundational + lenApplied);
  const offsetReflective = -(lenFoundational + lenApplied + lenCollaborative);

  const handleMouseMove = (e, title, weight, score, maxScore) => {
    const bounds = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const performancePercent = Math.round((score / maxScore) * 100);
    setTooltip({ x, y, title, weight, performance: `${performancePercent}%` });
  };

  const statusColor = totalScore >= 70
    ? 'text-emerald-600 dark:text-emerald-400'
    : totalScore >= 40
    ? 'text-blue-600 dark:text-blue-400'
    : 'text-slate-500 dark:text-slate-400';

  return (
    <div className="flex flex-col items-center justify-center py-3 relative select-none">
      <div className="relative w-[210px] h-[210px] flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Track backgrounds */}
          <circle cx="105" cy="105" r={radius} fill="none" stroke="rgba(30,58,138,0.08)" strokeWidth={strokeWidth}
            strokeDasharray={`${lenFoundational} ${circ - lenFoundational}`} strokeDashoffset={offsetFoundational} />
          <circle cx="105" cy="105" r={radius} fill="none" stroke="rgba(5,150,105,0.08)" strokeWidth={strokeWidth}
            strokeDasharray={`${lenApplied} ${circ - lenApplied}`} strokeDashoffset={offsetApplied} />
          <circle cx="105" cy="105" r={radius} fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth={strokeWidth}
            strokeDasharray={`${lenCollaborative} ${circ - lenCollaborative}`} strokeDashoffset={offsetCollaborative} />
          <circle cx="105" cy="105" r={radius} fill="none" stroke="rgba(217,119,6,0.08)" strokeWidth={strokeWidth}
            strokeDasharray={`${lenReflective} ${circ - lenReflective}`} strokeDashoffset={offsetReflective} />

          {/* Active fills */}
          <circle cx="105" cy="105" r={radius} fill="none" stroke="#1E3A8A" strokeWidth={strokeWidth}
            strokeDasharray={`${fillFoundational} ${circ - fillFoundational}`} strokeDashoffset={offsetFoundational}
            strokeLinecap="round"
            className="transition-[stroke-dasharray] duration-700 ease-out cursor-pointer"
            onMouseMove={(e) => handleMouseMove(e, 'Foundational', '40%', scores.foundationalScore || 0, 40)}
            onMouseLeave={() => setTooltip(null)} />
          <circle cx="105" cy="105" r={radius} fill="none" stroke="#059669" strokeWidth={strokeWidth}
            strokeDasharray={`${fillApplied} ${circ - fillApplied}`} strokeDashoffset={offsetApplied}
            strokeLinecap="round"
            className="transition-[stroke-dasharray] duration-700 ease-out cursor-pointer"
            onMouseMove={(e) => handleMouseMove(e, 'Applied', '30%', scores.appliedScore || 0, 30)}
            onMouseLeave={() => setTooltip(null)} />
          <circle cx="105" cy="105" r={radius} fill="none" stroke="#6366F1" strokeWidth={strokeWidth}
            strokeDasharray={`${fillCollaborative} ${circ - fillCollaborative}`} strokeDashoffset={offsetCollaborative}
            strokeLinecap="round"
            className="transition-[stroke-dasharray] duration-700 ease-out cursor-pointer"
            onMouseMove={(e) => handleMouseMove(e, 'Collaborative', '20%', scores.collaborativeScore || 0, 20)}
            onMouseLeave={() => setTooltip(null)} />
          <circle cx="105" cy="105" r={radius} fill="none" stroke="#D97706" strokeWidth={strokeWidth}
            strokeDasharray={`${fillReflective} ${circ - fillReflective}`} strokeDashoffset={offsetReflective}
            strokeLinecap="round"
            className="transition-[stroke-dasharray] duration-700 ease-out cursor-pointer"
            onMouseMove={(e) => handleMouseMove(e, 'Reflective', '10%', scores.reflectiveScore || 0, 10)}
            onMouseLeave={() => setTooltip(null)} />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="font-heading text-[38px] font-extrabold text-slate-900 dark:text-white leading-none tabular-nums">{totalScore}</div>
          <div className="text-[9.5px] text-slate-400 uppercase tracking-[0.12em] font-semibold mt-1">Total Index</div>
          <div className={`text-[11px] font-semibold mt-1 ${statusColor}`}>{masteryStatus}</div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl shadow-lg z-[1600] text-left pointer-events-none text-[11.5px] min-w-[130px] flex flex-col gap-0.5 animate-fade-in"
          style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y + 10}px` }}
        >
          <div className="font-bold text-slate-900 dark:text-white">{tooltip.title}</div>
          <div className="text-slate-500">Weight: <span className="font-semibold text-slate-700 dark:text-slate-300">{tooltip.weight}</span></div>
          <div className="text-slate-500">Score: <span className="font-semibold text-slate-700 dark:text-slate-300">{tooltip.performance}</span></div>
        </div>
      )}
    </div>
  );
};

export default MasteryCard;
