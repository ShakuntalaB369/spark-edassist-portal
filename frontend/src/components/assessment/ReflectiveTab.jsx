import React, { useState } from 'react';
import { PenTool, Sparkles, RefreshCw } from 'lucide-react';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { assessmentService } from '../../services/assessmentService';
import { ReflectionCard } from './ReflectionCard';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';

export const ReflectiveTab = () => {
  const { reflectiveScore, setReflectiveScore, triggerToast } = useAssessmentContext();

  const [journalText, setJournalText] = useState("");
  const [reflectiveSubmitted, setReflectiveSubmitted] = useState(false);
  const [learningSignature, setLearningSignature] = useState(null);

  const handleEvaluateReflection = () => {
    if (journalText.trim().length < 30) {
      triggerToast("Please write a meaningful reflection (at least 30 characters) to analyze growth.");
      return;
    }

    const result = assessmentService.evaluateReflection(journalText);
    setReflectiveScore(result.score);
    setLearningSignature(result.signature);
    setReflectiveSubmitted(true);
    triggerToast(`Journal analyzed! Learning signature: "${result.signature.type}" unlocked.`);
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-200 dark:border-panel-border pb-5 flex justify-between items-start gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-2">
            <PenTool size={12} /> Reflective Metacognition Journal
          </div>
          <h2 className="text-[20px] text-slate-900 dark:text-white font-bold leading-tight">Learning Signature & Metacognitive Log</h2>
        </div>
        <div className="text-right">
          <div className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">{Math.round(reflectiveScore)} / 10</div>
          <div className="text-[11.2px] text-slate-500 dark:text-text-muted uppercase font-bold">Secured Weight</div>
        </div>
      </div>

      {!reflectiveSubmitted ? (
        <>
          <div className="bg-amber-500/5 border-l-3 border-l-reflective p-4 rounded-r-xl">
            <div className="text-[13.6px] font-bold text-amber-600 dark:text-amber-400 mb-1">Cognitive Reflection Log</div>
            <p className="text-[12.8px] text-slate-600 dark:text-text-secondary">
              Metacognition is the anchor of growth. Log what you found difficult in the previous tasks, how you overcame those bottlenecks, and what you discovered about your own learning methods.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[13.6px] font-semibold text-slate-600 dark:text-text-secondary uppercase tracking-[0.05em]">
              Personal Reflective Journal Entry
            </label>
            <textarea 
              className="bg-slate-200/50 dark:bg-white/[0.02] border border-slate-300 dark:border-panel-border rounded-xl p-4 resize-y min-h-[140px] text-[14.4px] outline-none transition-all duration-200 focus:border-reflective focus:bg-white dark:focus:bg-white/[0.04] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.15)] text-slate-900 dark:text-white" 
              placeholder="Write your reflection here (e.g. 'I noticed that while answering the series/parallel circuit question, I had to visualize the actual current flowing. In the team scenario, I realized my first instinct was to work alone, but checking in with Dev saved our schedule...')"
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
            />
            <div className="text-[12px] text-slate-500 dark:text-text-muted text-right">
              {journalText.length} characters (Min 30)
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-panel-border pt-5 mt-6">
            <Button 
              variant="pill-primary" 
              style={{ backgroundColor: 'var(--color-reflective, #f59e0b)' }} 
              onClick={handleEvaluateReflection}
            >
              <Sparkles size={14} />
              <span>Analyze Learning Signature</span>
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <ReflectionCard signature={learningSignature} />

          <Button 
            variant="modal" 
            className="w-fit"
            onClick={() => setReflectiveSubmitted(false)}
          >
            <RefreshCw size={12} /> Edit Reflection
          </Button>
        </div>
      )}
    </div>
  );
};
export default ReflectiveTab;
