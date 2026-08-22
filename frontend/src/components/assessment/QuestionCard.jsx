import React from 'react';
import { OptionCard } from './OptionCard';

export const QuestionCard = ({ questionData, selectedAnswerIndex, onSelectAnswer, isLocked = false }) => {
  const isShortAnswer = questionData.questionType === 'Short Answer';

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[12px] bg-blue-500/10 border border-blue-500/20 text-blue-300 w-fit px-2 py-1 rounded font-semibold">
        {questionData.taxonomy}
      </div>
      <p className="text-[18.4px] font-semibold text-slate-900 dark:text-white">
        {questionData.question}
      </p>
      
      {isShortAnswer ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={selectedAnswerIndex || ''}
            onChange={(e) => onSelectAnswer(e.target.value)}
            disabled={isLocked}
            placeholder="Write your answer here..."
            maxLength={500}
            className="w-full min-h-[140px] bg-slate-200/50 dark:bg-white/[0.04] border border-slate-300 dark:border-panel-border px-4 py-3 rounded-xl text-[14px] text-slate-900 dark:text-white outline-none focus:border-collaborative focus:bg-white dark:focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.25)] placeholder:text-slate-400 dark:placeholder:text-text-muted transition-all duration-200 resize-y"
          />
          <div className="text-[12px] text-right text-slate-500 dark:text-text-muted">
            {(selectedAnswerIndex || '').length} / 500 characters
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(questionData.options || []).map((opt, oIdx) => (
            <OptionCard 
              key={oIdx} 
              optionText={opt}
              isSelected={selectedAnswerIndex === oIdx}
              onClick={() => onSelectAnswer(oIdx)}
              isLocked={isLocked}
            />
          ))}
        </div>
      )}
    </div>
  );
};
