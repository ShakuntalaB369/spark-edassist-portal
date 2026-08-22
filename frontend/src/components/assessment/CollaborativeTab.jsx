import React, { useState } from 'react';
import { Users, Star, MessageSquare, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { assessmentService } from '../../services/assessmentService';
import { Button } from '../ui/Button';
import questionsData from '../../data/questions.json';
import confetti from 'canvas-confetti';

export const CollaborativeTab = () => {
  const { ageGroup, collaborativeScore, setCollaborativeScore, triggerToast } = useAssessmentContext();

  const [delegations, setDelegations] = useState({});
  const [conflictChoice, setConflictChoice] = useState(-1);
  const [peerRatings, setPeerRatings] = useState({});
  const [collabSubmitted, setCollabSubmitted] = useState(false);

  const conflictScenario = assessmentService.getConflictScenario(ageGroup);

  const handleAssignRole = (peerName, role) => {
    if (collabSubmitted) return;
    setDelegations(prev => ({
      ...prev,
      [peerName]: role
    }));
  };

  const handleSelectConflictChoice = (choiceIdx) => {
    if (collabSubmitted) return;
    setConflictChoice(choiceIdx);
  };

  const handleRatePeer = (peerName, rating) => {
    if (collabSubmitted) return;
    setPeerRatings(prev => ({
      ...prev,
      [peerName]: rating
    }));
  };

  const handleEvaluateCollaboration = () => {
    const uniqueDelegatedRoles = new Set(Object.values(delegations));
    if (Object.keys(delegations).length < questionsData.PEERS.length || uniqueDelegatedRoles.size < questionsData.PEERS.length) {
      triggerToast("Please delegate a unique project role to each virtual classmate.");
      return;
    }
    if (conflictChoice === -1) {
      triggerToast("Please choose a conflict resolution strategy.");
      return;
    }
    if (Object.keys(peerRatings).length < questionsData.PEERS.length) {
      triggerToast("Please complete the peer feedback ratings.");
      return;
    }

    const finalVal = assessmentService.evaluateCollaboration(conflictChoice, peerRatings, ageGroup);
    setCollaborativeScore(finalVal);
    setCollabSubmitted(true);
    triggerToast(`Collaboration index logged! Score: ${finalVal}% of 20%`);
    confetti({ particleCount: 30, spread: 45 });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-slate-200 dark:border-panel-border pb-5 flex justify-between items-start gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 mb-2">
            <Users size={12} /> Collaborative Synthesis Board
          </div>
          <h2 className="text-[20px] text-slate-900 dark:text-white font-bold leading-tight">Project-Based Team Dynamics</h2>
        </div>
        <div className="text-right">
          <div className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">{Math.round(collaborativeScore)} / 20</div>
          <div className="text-[11.2px] text-slate-500 dark:text-text-muted uppercase font-bold">Secured Weight</div>
        </div>
      </div>

      {!collabSubmitted ? (
        <>
          <div className="flex flex-col gap-3">
            <span className="text-[12.8px] font-bold text-slate-600 dark:text-text-secondary uppercase tracking-[0.05em]">Step 1: Delegate Project Responsibilities</span>
            <p className="text-[12px] text-slate-500 dark:text-text-muted mb-2">
              Assign a unique task to Maya, Dev, and Chloe based on their roles.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {questionsData.PEERS.map((peer, pIdx) => {
                const currentRole = delegations[peer.name] || "";
                return (
                  <div key={pIdx} className="bg-slate-200/20 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-xl p-4 flex flex-col gap-2 relative">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-[12.8px] text-collaborative">
                        {peer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[13.6px] text-slate-900 dark:text-white">{peer.name}</div>
                        <div className="text-[10.4px] bg-collaborative/10 border border-collaborative/25 text-[#8b5cf6] dark:text-[#c084fc] px-1.5 py-0.5 rounded w-fit">
                          {peer.role}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 mt-2">
                      <select 
                        className="bg-slate-200/50 dark:bg-white/4 border border-slate-300 dark:border-panel-border p-1.5 rounded-lg text-[12.8px] text-slate-900 dark:text-white outline-none focus:border-collaborative focus:bg-white dark:focus:bg-white/8"
                        value={currentRole}
                        onChange={(e) => handleAssignRole(peer.name, e.target.value)}
                      >
                        <option value="" className="bg-white dark:bg-bg-dark text-slate-900 dark:text-white">-- Assign Duty --</option>
                        <option value="data" className="bg-white dark:bg-bg-dark text-slate-900 dark:text-white">Data Analysis & Math</option>
                        <option value="visuals" className="bg-white dark:bg-bg-dark text-slate-900 dark:text-white">Visual UI & Sliders</option>
                        <option value="pitch" className="bg-white dark:bg-bg-dark text-slate-900 dark:text-white">Final Presentation Slide</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conflict Strategy */}
          <div className="bg-collaborative/3 border border-collaborative/15 rounded-xl p-5 flex flex-col gap-3">
            <span className="text-[12.8px] font-bold text-[#8b5cf6] dark:text-[#c084fc] uppercase tracking-[0.05em]">
              Step 2: Team Conflict Management Scenario
            </span>
            <p className="text-[13.6px] text-slate-600 dark:text-text-secondary">
              {conflictScenario.question}
            </p>
            <div className="flex flex-col gap-2">
              {conflictScenario.choices.map((choice, cIdx) => (
                <button 
                  key={cIdx}
                  className={`bg-slate-200/20 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-3 rounded-lg text-left text-[12.8px] transition-all duration-200 text-slate-900 dark:text-white hover:bg-slate-300/30 dark:hover:bg-white/[0.04] hover:border-collaborative/30 ${conflictChoice === cIdx ? 'bg-collaborative/8 border-collaborative' : ''}`}
                  onClick={() => handleSelectConflictChoice(cIdx)}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </div>

          {/* Peer feedback */}
          <div className="flex flex-col gap-3">
            <span className="text-[12.8px] font-bold text-slate-600 dark:text-text-secondary uppercase tracking-[0.05em]">Step 3: Submit Teammate Evaluations</span>
            <p className="text-[12px] text-slate-500 dark:text-text-muted">
              Rate how helpful their collaborative dynamics have been.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {questionsData.PEERS.map((peer, pIdx) => {
                const rating = peerRatings[peer.name] || 0;
                return (
                  <div key={pIdx} className="bg-slate-200/20 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-xl p-3">
                    <span className="text-[12.8px] font-semibold text-slate-900 dark:text-white">{peer.name}</span>
                    <div className="flex flex-col gap-1 mt-2 border-t border-slate-200 dark:border-panel-border pt-2">
                      <span className="text-[10.4px] text-slate-500 dark:text-text-secondary">Active Contribution:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            className={`bg-transparent border-none cursor-pointer text-text-muted transition-all duration-150 hover:scale-110 ${rating >= starVal ? 'text-collaborative' : ''}`}
                            onClick={() => handleRatePeer(peer.name, starVal)}
                          >
                            <Star size={12} fill={rating >= starVal ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-panel-border pt-5 mt-6">
            <Button 
              variant="modal-primary" 
              style={{ backgroundColor: 'var(--color-collaborative)' }} 
              onClick={handleEvaluateCollaboration}
            >
              <Users size={14} />
              <span>Evaluate Team Synthesis</span>
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle2 size={48} className="text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Collaboration Complete</h3>
          <p className="text-slate-600 dark:text-text-secondary text-[14.4px] mb-6 max-w-[480px] mx-auto">
            Your delegation choices and conflict mitigation strategy have been calculated. Here is what your peers wrote back to you:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-[700px] mx-auto">
            <div className="bg-slate-200/20 dark:bg-white/[0.01] border border-slate-200 dark:border-panel-border p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-purple-400" />
                <strong className="text-[13.6px] text-slate-900 dark:text-white">Maya's Review:</strong>
              </div>
              <p className="text-[12px] italic text-slate-600 dark:text-text-secondary">
                "Appreciate the clarity on tasks! Reallocating work instead of pointing fingers when we got behind kept the team energy positive."
              </p>
            </div>
            
            <div className="bg-slate-200/20 dark:bg-white/[0.01] border border-slate-200 dark:border-panel-border p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-purple-400" />
                <strong className="text-[13.6px] text-slate-900 dark:text-white">Dev's Review:</strong>
              </div>
              <p className="text-[12px] italic text-slate-600 dark:text-text-secondary">
                "It was helpful that you checked in with me rather than just telling the instructor. That support helped me finish my visual duties."
              </p>
            </div>

            <div className="bg-slate-200/20 dark:bg-white/[0.01] border border-slate-200 dark:border-panel-border p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-purple-400" />
                <strong className="text-[13.6px] text-slate-900 dark:text-white">Chloe's Review:</strong>
              </div>
              <p className="text-[12px] italic text-slate-600 dark:text-text-secondary">
                "Your organization of duties was top-notch. Having clear roles allowed me to start building the presentation speech early."
              </p>
            </div>
          </div>

          <Button 
            variant="modal" 
            className="mt-6 mx-auto"
            onClick={() => setCollabSubmitted(false)}
          >
            <RefreshCw size={12} /> Reset Team Portal
          </Button>
        </div>
      )}
    </div>
  );
};
export default CollaborativeTab;
