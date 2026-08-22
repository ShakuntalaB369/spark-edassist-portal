import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import DashboardCard from '../dashboard/DashboardCard';

export const ResultCard = ({ questions, selectedAnswers }) => {
  return (
    <div className="flex flex-col gap-3 text-left max-w-[600px] mx-auto">
      {questions.map((q, qIdx) => {
        const ansIdx = selectedAnswers[qIdx];
        const isCorrect = ansIdx === q.correctIndex;
        return (
          <DashboardCard 
            key={qIdx} 
            className="!p-4 mb-3"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-semibold">
                {q.taxonomy}
              </span>
              <span className={`flex items-center gap-1 text-[12px] font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <p className="font-semibold text-[14.4px] mb-2 text-slate-900 dark:text-white">{q.question}</p>
            <p className="text-[12px] text-slate-600 dark:text-text-muted">
              <strong>Your Answer:</strong> {q.options && q.options[ansIdx] !== undefined ? q.options[ansIdx] : ansIdx}
            </p>
            <div className="bg-slate-100 dark:bg-white/[0.02] border-l-[3px] border-l-foundational p-4 rounded-r-xl text-[13.6px] text-slate-700 dark:text-text-secondary mt-2">
              <strong>Reasoning:</strong> {q.explanation}
              
              {q.references && q.references.length > 0 && (
                <div className="mt-3 border-t border-slate-200 dark:border-white/5 pt-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Reference & Further Learning</div>
                  <div className="flex flex-col gap-1.5">
                    {q.references.map((ref, rIdx) => (
                      <a 
                        key={rIdx}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12.5px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5 font-normal"
                      >
                        <span>🔗</span>
                        <span>{ref.source} — {ref.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DashboardCard>
        );
      })}
    </div>
  );
};
