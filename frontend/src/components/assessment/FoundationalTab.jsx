import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, RefreshCw, Cpu, Users, PenTool } from 'lucide-react';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { QuestionCard } from './QuestionCard';
import { ResultCard } from './ResultCard';
import { AssessmentConfiguration } from './AssessmentConfiguration';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';

export const FoundationalTab = () => {
  const {
    foundationalScore,
    appliedScore,
    collaborativeScore,
    reflectiveScore,
    configuration,
    questions,
    currentQuestionIndex,
    selectedAnswers,
    completed: quizLocked,
    selectAnswer: handleSelectQuizAnswer,
    nextQuestion: handleNextQuizQuestion,
    resetAssessment: resetQuiz,
    generateAssessment,
    score,
    answerStatus,
    answeredQuestions,
    submitAnswer,
    report,
    reportLoading,
    reportError,
    generateReport
  } = useAssessmentContext();

  const questionsWithCorrectIndex = questions.map((q, idx) => {
    const verified = answeredQuestions[idx] || {};
    const selectedIdx = selectedAnswers[idx];
    return {
      ...q,
      taxonomy: q.bloomLevel || q.taxonomy,
      correctIndex: verified.correct === true ? selectedIdx : -1,
      explanation: verified.explanation || '',
      references: verified.references || []
    };
  });

  const isCorrupted = !questions || (questions.length > 0 && (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length));
  if (isCorrupted && !quizLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assessment session unavailable.</h3>
        <Button variant="pill-primary" onClick={resetQuiz} className="mt-2">
          Return to Assessment
        </Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <AssessmentConfiguration onGenerate={generateAssessment} />
    );
  }

  const isAnswered = answeredQuestions[currentQuestionIndex] !== undefined;
  const isCorrect = answeredQuestions[currentQuestionIndex]?.correct;

  const currentVal = selectedAnswers[currentQuestionIndex];
  const isShortAns = questions[currentQuestionIndex]?.questionType === 'Short Answer';
  const isSubmitDisabled = currentVal === undefined || 
    (isShortAns && typeof currentVal === 'string' && currentVal.trim() === '');

  const category = configuration?.category || 'Foundational';
  
  const getCategoryDetails = () => {
    switch (category) {
      case 'Applied':
        return {
          title: "Applied Competency Assessment",
          subtitle: "Authentic Professional Scenario Check",
          scoreDisplay: `${Math.round(appliedScore)} / 30`,
          weight: "30%",
          badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          progressColor: "bg-applied",
          icon: <Cpu size={12} />,
          message: "You have completed the applied competency assessment. Your knowledge levels have been updated in the Mastery Wheel."
        };
      case 'Collaborative':
        return {
          title: "Collaborative Competency Assessment",
          subtitle: "Active Team Synergy Check",
          scoreDisplay: `${Math.round(collaborativeScore)} / 20`,
          weight: "20%",
          badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
          progressColor: "bg-collaborative",
          icon: <Users size={12} />,
          message: "You have completed the collaborative competency assessment. Your knowledge levels have been updated in the Mastery Wheel."
        };
      case 'Reflective':
        return {
          title: "Reflective Competency Assessment",
          subtitle: "Metacognitive Reflection Check",
          scoreDisplay: `${Math.round(reflectiveScore)} / 10`,
          weight: "10%",
          badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
          progressColor: "bg-reflective",
          icon: <PenTool size={12} />,
          message: "You have completed the reflective competency assessment. Your knowledge levels have been updated in the Mastery Wheel."
        };
      default: // Foundational
        return {
          title: "Foundational Analytics Assessment",
          subtitle: "Bloom's Taxonomy Conceptual Check",
          scoreDisplay: `${Math.round(foundationalScore)} / 40`,
          weight: "40%",
          badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          progressColor: "bg-foundational",
          icon: <BookOpen size={12} />,
          message: "You have completed the foundational conceptual check. Your knowledge levels have been updated in the Mastery Wheel."
        };
    }
  };

  const catDetails = getCategoryDetails();

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-panel-border pb-5 flex justify-between items-start gap-4">
        <div>
          <div className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1 rounded-full border mb-2 ${catDetails.badgeClass}`}>
            {catDetails.icon} {catDetails.title}
          </div>
          <h2 className="text-[20px] text-slate-900 dark:text-white font-bold leading-tight">{catDetails.subtitle}</h2>
        </div>
        <div className="text-right">
          <div className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">{catDetails.scoreDisplay}</div>
          <div className="text-[11.2px] text-text-muted uppercase font-bold">Secured Weight</div>
        </div>
      </div>

      {!quizLocked ? (
        <>
          <div className="h-1 bg-white/5 rounded-sm overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-300 ${catDetails.progressColor}`}
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[13.5px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>Score: {score} / {questions.length}</span>
          </div>

          {questionsWithCorrectIndex.length > 0 && (
            <QuestionCard
              questionData={questionsWithCorrectIndex[currentQuestionIndex]}
              selectedAnswerIndex={selectedAnswers[currentQuestionIndex]}
              onSelectAnswer={handleSelectQuizAnswer}
              isLocked={isAnswered}
            />
          )}

          {/* Real-time Correct / Incorrect status banner */}
          {isAnswered && (
            <div className={`mt-4 p-4 rounded-xl border font-bold text-[15px] flex items-center gap-2 ${
              isCorrect 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}>
              <span>{isCorrect ? '✓ Correct' : '✕ Incorrect'}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-panel-border pt-5 mt-6">
            {!isAnswered ? (
              <Button 
                variant="modal-primary"
                disabled={isSubmitDisabled}
                onClick={submitAnswer}
              >
                <span>Submit Answer</span>
                <ChevronRight size={14} />
              </Button>
            ) : (
              <Button 
                variant="modal-primary"
                onClick={handleNextQuizQuestion}
              >
                <span>
                  {currentQuestionIndex === questions.length - 1 ? "Complete Quiz" : "Next Question"}
                </span>
                <ChevronRight size={14} />
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{category} Assessment Completed</h3>
          <p className="text-slate-600 dark:text-text-secondary text-[14.4px] mb-6 max-w-[450px] mx-auto">
            {catDetails.message}
          </p>

          {/* AI REPORT LOADING STATE */}
          {reportLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center my-6 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-xl">
              <RefreshCw size={40} className="text-collaborative animate-spin" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white animate-pulse">Analyzing Your Performance...</h3>
              <p className="text-slate-500 dark:text-text-secondary text-[14px]">Reviewing your strengths, learning patterns, and next steps.</p>
            </div>
          )}

          {/* AI REPORT ERROR STATE */}
          {reportError && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center my-6 max-w-[600px] mx-auto">
              <p className="text-rose-600 dark:text-rose-400 font-bold mb-3">{reportError}</p>
              <Button variant="modal-primary" onClick={generateReport} className="mx-auto">
                Try Again
              </Button>
            </div>
          )}

          {/* AI REPORT DISPLAY SECTION */}
          {report && !reportLoading && (
            <div className="mt-8 border border-slate-200 dark:border-panel-border bg-slate-100 dark:bg-white/[0.02] p-6 rounded-2xl text-left flex flex-col gap-6 max-w-[600px] mx-auto mb-8 shadow-sm">
              <div className="border-b border-slate-200 dark:border-panel-border pb-4">
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Your AI Performance Report</h3>
              </div>
              
              {/* OVERALL PERFORMANCE */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center bg-white dark:bg-white/[0.04] p-4 rounded-xl border border-slate-200 dark:border-panel-border">
                <div>
                  <div className="text-[11px] text-text-muted font-bold uppercase">Score</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">{report.score} / {report.totalQuestions}</div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted font-bold uppercase">Percentage</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">{report.percentage}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted font-bold uppercase">Rating</div>
                  <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{report.performanceLevel}</div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted font-bold uppercase">Category</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">{category}</div>
                </div>
                <div>
                  <div className="text-[11px] text-text-muted font-bold uppercase">Weight</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">{catDetails.weight}</div>
                </div>
              </div>

              {/* STRENGTHS */}
              {report.report?.strengths?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Strengths</h4>
                  <ul className="flex flex-col gap-1.5">
                    {report.report.strengths.map((str, sIdx) => (
                      <li key={sIdx} className="text-[13.5px] text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                        <span>✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* WEAK AREAS */}
              {report.report?.weakAreas?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Areas To Improve</h4>
                  <ul className="flex flex-col gap-1.5">
                    {report.report.weakAreas.map((wk, wIdx) => (
                      <li key={wIdx} className="text-[13.5px] text-rose-600 dark:text-rose-400 flex items-start gap-2">
                        <span>•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* BLOOM PERFORMANCE */}
              {report.report?.bloomAnalysis && Object.keys(report.report.bloomAnalysis).length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bloom's Taxonomy Performance</h4>
                  <div className="flex flex-col gap-3">
                    {Object.entries(report.report.bloomAnalysis).map(([level, data]) => (
                      <div key={level} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[13px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{level}</span>
                          <span className="font-bold text-slate-500 dark:text-text-muted">{data.correct} / {data.attempted} ({data.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-foundational transition-all duration-300" style={{ width: `${data.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CATEGORY PERFORMANCE */}
              {report.report?.categoryAnalysis && Object.keys(report.report.categoryAnalysis).length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category Performance</h4>
                  <div className="flex flex-col gap-3">
                    {Object.entries(report.report.categoryAnalysis).map(([cat, data]) => (
                      <div key={cat} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[13px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{cat}</span>
                          <span className="font-bold text-slate-500 dark:text-text-muted">{data.correct} / {data.attempted} ({data.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-applied transition-all duration-300" style={{ width: `${data.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DIFFICULTY PERFORMANCE */}
              {report.report?.difficultyAnalysis && Object.keys(report.report.difficultyAnalysis).length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Difficulty Performance</h4>
                  <div className="flex flex-col gap-3">
                    {Object.entries(report.report.difficultyAnalysis).map(([diff, data]) => (
                      <div key={diff} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[13px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{diff}</span>
                          <span className="font-bold text-slate-500 dark:text-text-muted">{data.correct} / {data.attempted} ({data.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-collaborative transition-all duration-300" style={{ width: `${data.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECOMMENDATIONS */}
              {report.report?.recommendations?.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Personalized Recommendations</h4>
                  <div className="flex flex-col gap-4">
                    {report.report.recommendations.map((rec, rIdx) => (
                      <div key={rIdx} className="bg-white dark:bg-white/[0.04] border-l-[3px] border-l-collaborative p-4 rounded-r-xl border border-slate-200 dark:border-panel-border border-l-0">
                        <div className="font-bold text-[13.5px] text-slate-900 dark:text-white">{rec.topic}</div>
                        <div className="text-[11.5px] text-slate-500 dark:text-text-muted italic mb-1.5">Reason: {rec.reason}</div>
                        <div className="text-[13px] text-slate-700 dark:text-text-secondary leading-relaxed">{rec.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUGGESTED NEXT TOPICS */}
              {report.report?.suggestedTopics?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suggested Next Topics</h4>
                  <ul className="flex flex-col gap-1.5">
                    {report.report.suggestedTopics.map((top, tIdx) => (
                      <li key={tIdx} className="text-[13.5px] text-slate-700 dark:text-text-secondary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>{top}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PERFORMANCE SUMMARY */}
              {report.report?.summary && (
                <div className="flex flex-col gap-2 bg-white dark:bg-white/[0.04] p-5 rounded-xl border border-slate-200 dark:border-panel-border">
                  <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Performance Summary</h4>
                  <p className="text-[13.5px] text-slate-700 dark:text-text-secondary leading-relaxed">{report.report.summary}</p>
                </div>
              )}
            </div>
          )}
          
          <ResultCard 
            questions={questionsWithCorrectIndex}
            selectedAnswers={selectedAnswers}
          />
          
          <Button variant="modal" onClick={resetQuiz} className="mt-6 mx-auto">
            <RefreshCw size={12} /> Restart Quiz
          </Button>
        </div>
      )}
    </div>
  );
};
export default FoundationalTab;
