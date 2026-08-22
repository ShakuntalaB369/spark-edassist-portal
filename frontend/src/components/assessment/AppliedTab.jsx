import React, { useState } from 'react';
import { Cpu, BrainCircuit, Sparkles, RefreshCw } from 'lucide-react';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { assessmentService } from '../../services/assessmentService';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';

export const AppliedTab = () => {
  const { ageGroup, appliedScore, setAppliedScore, triggerToast } = useAssessmentContext();
  
  const scenario = assessmentService.getAppliedScenario(ageGroup);
  
  const [appliedChoice, setAppliedChoice] = useState(-1);
  const [appliedText, setAppliedText] = useState("");
  const [appliedSubmitted, setAppliedSubmitted] = useState(false);
  const [appliedEval, setAppliedEval] = useState(null);

  const handleSelectAppliedChoice = (choiceIdx) => {
    if (appliedSubmitted) return;
    setAppliedChoice(choiceIdx);
  };

  const handleEvaluateApplied = () => {
    if (appliedChoice === -1) {
      triggerToast("Please select a strategic direction first.");
      return;
    }
    if (appliedText.trim().length < 20) {
      triggerToast("Please write a detailed response (at least 20 characters) for a realistic evaluation.");
      return;
    }

    const result = assessmentService.evaluateApplied(appliedText, appliedChoice, ageGroup);
    setAppliedScore(result.score);
    setAppliedEval(result.evalDetails);
    setAppliedSubmitted(true);
    triggerToast(`Applied Competency assessment finished! Score: ${result.score}% of 30%`);
    confetti({ particleCount: 30, spread: 45 });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-200 dark:border-panel-border pb-5 flex justify-between items-start gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-2">
            <Cpu size={12} /> Applied Competency Simulation
          </div>
          <h2 className="text-[20px] text-slate-900 dark:text-white font-bold leading-tight">Authentic Professional Scenario Task</h2>
        </div>
        <div className="text-right">
          <div className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">{Math.round(appliedScore)} / 30</div>
          <div className="text-[11.2px] text-slate-500 dark:text-text-muted uppercase font-bold">Secured Weight</div>
        </div>
      </div>

      {!appliedSubmitted ? (
        <>
          <div className="bg-slate-200/20 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-xl p-5">
            <div className="text-[17.6px] font-bold text-slate-900 dark:text-white mb-2">{scenario.title}</div>
            <p className="text-slate-600 dark:text-text-secondary text-[14.4px] mb-5">{scenario.desc}</p>
            <div className="bg-emerald-500/5 border border-dashed border-emerald-500/20 p-4 rounded-lg text-[13.6px] text-slate-600 dark:text-text-secondary">
              <strong>{scenario.challenge}</strong>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13.6px] font-semibold text-slate-600 dark:text-text-secondary uppercase tracking-[0.05em]">Step 1: Choose Your Strategic Project Direction</label>
            <div className="grid grid-cols-1 gap-3">
              {scenario.choices.map((choice, cIdx) => (
                <div 
                  key={cIdx} 
                  className={`bg-slate-200/20 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-xl p-4 cursor-pointer transition-all duration-200 text-[13.6px] flex gap-3 hover:bg-slate-300/30 dark:hover:bg-white/[0.05] hover:border-emerald-500/30 ${appliedChoice === cIdx ? 'bg-emerald-500/8 border-applied' : ''}`}
                  onClick={() => handleSelectAppliedChoice(cIdx)}
                >
                  <div className="font-extrabold text-applied">{cIdx + 1}</div>
                  <div className="text-slate-900 dark:text-white">{choice.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[13.6px] font-semibold text-slate-600 dark:text-text-secondary uppercase tracking-[0.05em]">
              Step 2: Propose Your Execution Strategy
            </label>
            <p className="text-[12px] text-slate-500 dark:text-text-muted mb-1">
              {scenario.prompt}
            </p>
            <textarea 
              className="bg-slate-200/50 dark:bg-white/[0.02] border border-slate-300 dark:border-panel-border rounded-xl p-4 resize-y min-h-[120px] text-[14.4px] outline-none transition-all duration-200 focus:border-applied focus:bg-white dark:focus:bg-white/[0.04] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] text-slate-900 dark:text-white" 
              placeholder="Type your strategic proposal here (must be at least 20 characters)..."
              value={appliedText}
              onChange={(e) => setAppliedText(e.target.value)}
            />
            <div className="text-[12px] text-slate-500 dark:text-text-muted text-right">
              {appliedText.length} characters (Min 20)
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-panel-border pt-5 mt-6">
            <Button 
              variant="modal-success"
              onClick={handleEvaluateApplied}
            >
              <Sparkles size={14} />
              <span>Submit for AI Evaluation</span>
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 flex flex-col gap-4 animate-fade-in text-left">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[16px]">
            <BrainCircuit size={20} />
            <span>AI Assessment Engine: Evaluation Report</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3 my-2">
            <div className="bg-slate-200/50 dark:bg-black/20 border border-slate-300 dark:border-panel-border p-3 rounded-lg text-center">
              <div className="font-heading text-[21.6px] font-extrabold text-slate-900 dark:text-white">{appliedEval?.problemSolving} / 10</div>
              <div className="text-[11.2px] text-slate-500 dark:text-text-secondary uppercase">Problem Solving</div>
            </div>
            <div className="bg-slate-200/50 dark:bg-black/20 border border-slate-300 dark:border-panel-border p-3 rounded-lg text-center">
              <div className="font-heading text-[21.6px] font-extrabold text-slate-900 dark:text-white">{appliedEval?.practicalApp} / 10</div>
              <div className="text-[11.2px] text-slate-500 dark:text-text-secondary uppercase">Practical App</div>
            </div>
            <div className="bg-slate-200/50 dark:bg-black/20 border border-slate-300 dark:border-panel-border p-3 rounded-lg text-center">
              <div className="font-heading text-[21.6px] font-extrabold text-slate-900 dark:text-white">{appliedEval?.criticalThink} / 10</div>
              <div className="text-[11.2px] text-slate-500 dark:text-text-secondary uppercase">Critical Thinking</div>
            </div>
          </div>

          <p className="text-[13.6px] text-slate-600 dark:text-text-secondary leading-[1.5]">
            <strong>Assessment Summary:</strong> {appliedEval?.feedback}
          </p>

          <div className="bg-slate-200/50 dark:bg-black/15 p-4 rounded-lg text-[12.8px] text-slate-600 dark:text-text-secondary">
            <strong>Submitted Draft:</strong>
            <p className="italic mt-1">"{appliedText}"</p>
          </div>

          <Button 
            variant="modal" 
            className="w-fit"
            onClick={() => setAppliedSubmitted(false)}
          >
            <RefreshCw size={12} /> Re-Submit Proposal
          </Button>
        </div>
      )}
    </div>
  );
};
export default AppliedTab;
