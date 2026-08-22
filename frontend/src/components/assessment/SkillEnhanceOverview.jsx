import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { DashboardCard } from '../dashboard/DashboardCard';
import { 
  Sparkles, 
  Layers, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Globe,
  Award,
  Cpu
} from 'lucide-react';

export const SkillEnhanceOverview = ({ initialConfig, onStart, onBack }) => {
  const [ageGroup, setAgeGroup] = useState(initialConfig?.ageGroup || '15–18');
  const [difficulty, setDifficulty] = useState(initialConfig?.difficulty || 'Medium');

  const handleStart = () => {
    onStart({ ageGroup, difficulty });
  };

  return (
    <div className="flex flex-col gap-6 text-left py-4">
      {/* Header Section */}
      <div className="border-b border-panel-border pb-5">
        <h2 className="text-[22px] text-slate-900 dark:text-white font-bold leading-tight flex items-center gap-2">
          <span>✨ Skill Enhance</span>
        </h2>
        <p className="text-[13.5px] text-slate-500 dark:text-text-secondary mt-1">
          Build and strengthen your competencies through diverse academic subjects, real-world challenges, and global educational perspectives.
        </p>
      </div>

      {/* Assessment Overview Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-200/40 dark:bg-white/[0.01] border border-slate-300 dark:border-panel-border rounded-2xl flex flex-col gap-2">
          <BookOpen className="text-blue-500 w-5 h-5" />
          <strong className="text-[13.5px] text-slate-900 dark:text-white">Multi-Subject Assessment</strong>
          <span className="text-[11.5px] text-slate-400">Questions spanning multiple disciplines.</span>
        </div>

        <div className="p-4 bg-slate-200/40 dark:bg-white/[0.01] border border-slate-300 dark:border-panel-border rounded-2xl flex flex-col gap-2">
          <Globe className="text-emerald-500 w-5 h-5" />
          <strong className="text-[13.5px] text-slate-900 dark:text-white">Global Perspectives</strong>
          <span className="text-[11.5px] text-slate-400">Aligned with global benchmarks and frameworks.</span>
        </div>

        <div className="p-4 bg-slate-200/40 dark:bg-white/[0.01] border border-slate-300 dark:border-panel-border rounded-2xl flex flex-col gap-2">
          <Award className="text-purple-500 w-5 h-5" />
          <strong className="text-[13.5px] text-slate-900 dark:text-white">Competency-Based Evaluation</strong>
          <span className="text-[11.5px] text-slate-400">Focuses on skills beyond rote memory.</span>
        </div>

        <div className="p-4 bg-slate-200/40 dark:bg-white/[0.01] border border-slate-300 dark:border-panel-border rounded-2xl flex flex-col gap-2">
          <Cpu className="text-amber-500 w-5 h-5" />
          <strong className="text-[13.5px] text-slate-900 dark:text-white">Adaptive Skill Development</strong>
          <span className="text-[11.5px] text-slate-400">Customized learning paths based on performance.</span>
        </div>
      </div>

      {/* Competency Framework Preview */}
      <DashboardCard className="p-5">
        <h3 className="font-bold text-[15px] text-slate-900 dark:text-white flex items-center gap-2 border-b border-panel-border pb-3">
          <Layers size={16} className="text-blue-500 shrink-0" />
          <span>Competency Framework</span>
        </h3>
        <p className="text-[13px] text-slate-500 leading-relaxed mt-2">
          The assessment evaluates your strengths, growth areas, and proficiency score across four essential dimensions:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-[12px]">
          <div className="p-3 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-xl">
            <span className="font-bold text-[#1E3A8A] dark:text-blue-400 block mb-0.5">Foundational</span>
            <span className="text-slate-400 dark:text-text-muted">Core concepts and factual recall.</span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-xl">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Applied</span>
            <span className="text-slate-400 dark:text-text-muted">Practical problem-solving scenarios.</span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-xl">
            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-0.5">Collaborative</span>
            <span className="text-slate-400 dark:text-text-muted">Conflict resolution and peer synthesis.</span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-xl">
            <span className="font-bold text-amber-600 dark:text-amber-500 block mb-0.5">Reflective</span>
            <span className="text-slate-400 dark:text-text-muted">Self-evaluation and cognitive logic.</span>
          </div>
        </div>
      </DashboardCard>

      {/* Configuration & Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Inline Compact Configuration */}
        <DashboardCard className="p-5 flex flex-col gap-4">
          <h3 className="font-bold text-[15px] text-slate-900 dark:text-white flex items-center gap-2 border-b border-panel-border pb-3">
            <Cpu size={16} className="text-purple-500 shrink-0" />
            <span>Customize Assessment Parameters</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 dark:text-text-secondary uppercase tracking-wider">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="bg-slate-200/50 dark:bg-white/[0.04] border border-slate-300 dark:border-panel-border px-3 py-2 rounded-xl text-[13px] text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
              >
                <option value="6–10" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">6–10</option>
                <option value="11–14" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">11–14</option>
                <option value="15–18" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">15–18</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 dark:text-text-secondary uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-slate-200/50 dark:bg-white/[0.04] border border-slate-300 dark:border-panel-border px-3 py-2 rounded-xl text-[13px] text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
              >
                <option value="Easy" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">Easy</option>
                <option value="Medium" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">Medium</option>
                <option value="Hard" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px] text-slate-500 mt-2 border-t border-panel-border pt-3">
            <div>Type: <strong>Skill Enhance</strong></div>
            <div>Subjects: <strong>Multiple Subjects</strong></div>
            <div>Questions: <strong>10 (Dynamic)</strong></div>
            <div>Est. Time: <strong>15 Minutes</strong></div>
          </div>
        </DashboardCard>

        {/* Assessment Structure & Guidelines */}
        <div className="flex flex-col gap-4">
          <DashboardCard className="p-5 flex flex-col gap-3">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white flex items-center gap-2 border-b border-panel-border pb-3">
              <BookOpen size={16} className="text-emerald-500 shrink-0" />
              <span>What You'll Be Assessed On</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[12.5px] text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Subject knowledge</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Problem solving</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Application of concepts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Critical thinking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Collaborative thinking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Reflection and reasoning</span>
              </div>
            </div>
          </DashboardCard>

          {/* Quick Instructions */}
          <DashboardCard className="p-5 flex flex-col gap-3 bg-blue-500/[0.02] border-blue-500/20">
            <h3 className="font-bold text-[14px] text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle size={15} className="text-[#1E3A8A] dark:text-blue-400 shrink-0" />
              <span>Instructions</span>
            </h3>
            <ul className="list-disc pl-4 text-[12.5px] text-slate-600 dark:text-slate-300 flex flex-col gap-1">
              <li>Select option inputs carefully before clicking start.</li>
              <li>Complete all questions sequentially.</li>
              <li>Do not refresh or exit the browser window.</li>
            </ul>
          </DashboardCard>
        </div>
      </div>

      {/* Navigation CTA footer */}
      <div className="flex justify-end gap-3 border-t border-panel-border pt-5 mt-4">
        <Button variant="pill" onClick={onBack}>
          Cancel / Back
        </Button>
        <Button variant="pill-primary" onClick={handleStart} className="flex items-center gap-1">
          <span>Start Assessment</span>
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
};

export default SkillEnhanceOverview;
