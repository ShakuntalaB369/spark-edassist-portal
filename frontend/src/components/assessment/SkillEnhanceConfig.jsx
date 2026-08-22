import React, { useState } from 'react';
import { Button } from '../ui/Button';

export const SkillEnhanceConfig = ({ onGenerate, onBack }) => {
  const [ageGroup, setAgeGroup] = useState('15–18');
  const [difficulty, setDifficulty] = useState('Medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({ ageGroup, difficulty });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left max-w-[500px] mx-auto py-6">
      <div>
        <h2 className="text-[20px] text-slate-900 dark:text-white font-bold leading-tight mb-2">✨ Skill Enhance Configuration</h2>
        <p className="text-[13px] text-slate-500 dark:text-text-muted leading-relaxed">
          Configure your multi-subject, global perspectives challenge.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-bold text-slate-500 dark:text-text-secondary uppercase tracking-wider">
          Age Group *
        </label>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="bg-slate-200/50 dark:bg-white/[0.04] border border-slate-300 dark:border-panel-border px-4 py-2.5 rounded-xl text-[14px] text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
        >
          <option value="6–10" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">6–10</option>
          <option value="11–14" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">11–14</option>
          <option value="15–18" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">15–18</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-bold text-slate-500 dark:text-text-secondary uppercase tracking-wider">
          Difficulty *
        </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="bg-slate-200/50 dark:bg-white/[0.04] border border-slate-300 dark:border-panel-border px-4 py-2.5 rounded-xl text-[14px] text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
        >
          <option value="Easy" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">Easy</option>
          <option value="Medium" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">Medium</option>
          <option value="Hard" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">Hard</option>
        </select>
      </div>

      <div className="flex gap-3 justify-end border-t border-panel-border pt-5 mt-4">
        <Button variant="pill" type="button" onClick={onBack}>
          Cancel
        </Button>
        <Button variant="pill-primary" type="submit">
          ✨ Start Skill Enhance
        </Button>
      </div>
    </form>
  );
};

export default SkillEnhanceConfig;
