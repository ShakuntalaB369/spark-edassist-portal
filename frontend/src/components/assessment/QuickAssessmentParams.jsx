import React, { useState } from 'react';
import { Zap, ChevronDown, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

const AGE_GROUPS = ['6-10', '11-14', '15-18', '19-25', '26+'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const DIFFICULTY_META = {
  Easy:   { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
  Medium: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  Hard:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' },
};

const StyledSelect = ({ id, value, onChange, options }) => (
  <div className="relative">
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-[14px] font-semibold outline-none transition-all duration-150 cursor-pointer bg-white border-slate-300 text-slate-900"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </div>
);

export const QuickAssessmentParams = ({ initialConfig, onStart, onBack }) => {
  const [ageGroup,   setAgeGroup]   = useState(initialConfig?.ageGroup   || '15-18');
  const [difficulty, setDifficulty] = useState(initialConfig?.difficulty || 'Medium');
  const [errors,     setErrors]     = useState({});

  const diffMeta = DIFFICULTY_META[difficulty] || DIFFICULTY_META.Medium;

  const validate = () => {
    const e = {};
    if (!ageGroup)   e.ageGroup   = 'Please select an age group.';
    if (!difficulty) e.difficulty = 'Please select a difficulty level.';
    return e;
  };

  const handleStart = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    onStart({ ageGroup, difficulty });
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 380 }}>
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}
          >
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-slate-900 dark:text-white leading-tight">
              Quick Assessment Parameters
            </h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
              Personalise your Skill Enhance session
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="param-age-group" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Age Group
            </label>
            <StyledSelect
              id="param-age-group"
              value={ageGroup}
              onChange={v => { setAgeGroup(v); setErrors(p => ({ ...p, ageGroup: undefined })); }}
              options={AGE_GROUPS}
            />
            {errors.ageGroup && (
              <p className="flex items-center gap-1 text-[11.5px] text-rose-500">
                <AlertCircle size={12} /> {errors.ageGroup}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="param-difficulty" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Difficulty
            </label>
            <StyledSelect
              id="param-difficulty"
              value={difficulty}
              onChange={v => { setDifficulty(v); setErrors(p => ({ ...p, difficulty: undefined })); }}
              options={DIFFICULTIES}
            />
            {errors.difficulty && (
              <p className="flex items-center gap-1 text-[11.5px] text-rose-500">
                <AlertCircle size={12} /> {errors.difficulty}
              </p>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 border"
          style={{ background: diffMeta.bg, borderColor: diffMeta.border }}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: diffMeta.dot }} />
          <span className="text-[13px] font-semibold" style={{ color: diffMeta.color }}>
            {difficulty} difficulty &middot; Ages {ageGroup}
          </span>
          <span className="ml-auto text-[11.5px] text-slate-400 hidden sm:block">
            {difficulty === 'Easy'   && 'Foundational concepts & basic comprehension'}
            {difficulty === 'Medium' && 'Applied knowledge & analytical thinking'}
            {difficulty === 'Hard'   && 'Advanced reasoning & critical evaluation'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 mt-6 border-t border-slate-200 dark:border-white/10">
        <Button variant="pill" onClick={onBack}>
          Cancel / Back
        </Button>
        <Button variant="pill-primary" onClick={handleStart}>
          Start Assessment
        </Button>
      </div>
    </div>
  );
};
