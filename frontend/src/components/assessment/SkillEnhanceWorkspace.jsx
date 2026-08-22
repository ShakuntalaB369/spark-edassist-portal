import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { DashboardCard } from '../dashboard/DashboardCard';
import { 
  ChevronRight, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  History, 
  BookOpen, 
  Globe, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  Info,
  ShieldAlert
} from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import skillEnhanceService from '../../services/skillEnhanceService';

export const SkillEnhanceWorkspace = ({
  questions,
  currentQuestionIndex,
  selectedAnswers,
  answeredQuestions,
  score,
  sessionComplete,
  sessionResult,
  loading,
  error,
  answerStatus,
  handleSelectAnswer,
  submitAnswer,
  nextQuestion,
  onFinish,
  onManageConsent
}) => {
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showQuestionsLog, setShowQuestionsLog] = useState(false);

  useEffect(() => {
    if (sessionComplete) {
      setLoadingHistory(true);
      skillEnhanceService.getMySkillEnhance()
        .then(res => {
          if (res.success) {
            setHistoryList(res.data);
          }
        })
        .catch(err => console.error('Failed to load history:', err))
        .finally(() => setLoadingHistory(false));
    }
  }, [sessionComplete]);

  if (loading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        <p className="text-[14px] text-slate-500 dark:text-text-secondary font-medium">Generating diverse Skill Enhance questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Failed to start session</h3>
        <p className="text-[14px] text-slate-500 max-w-[400px]">{error}</p>
        <Button variant="pill-primary" onClick={onFinish}>Return to Dashboard</Button>
      </div>
    );
  }

  if (sessionComplete && sessionResult) {
    const report = sessionResult.report || {};
    const exploredSubjects = Array.from(new Set(questions.map(q => q.subject)));
    const exploredContexts = Array.from(new Set(questions.map(q => q.globalContext)));
    const accuracy = sessionResult.percentage;
    const timeTakenSec = sessionResult.timeTaken || 0;
    
    const formatTime = (secs) => {
      if (!secs) return '0s';
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    // Calculate rating details
    const performanceLevel = sessionResult.percentage >= 90 ? 'Excellent' :
                             sessionResult.percentage >= 75 ? 'Strong' :
                             sessionResult.percentage >= 60 ? 'Developing' : 'Needs Improvement';

    // Global Benchmark Mock Data
    const globalBenchmark = 71;
    const isAboveBenchmark = accuracy >= globalBenchmark;
    const benchmarkDiff = Math.abs(accuracy - globalBenchmark);

    // Identify strongest/weakest competency dimension
    const categoryAnalysis = report.categoryAnalysis || {};
    let strongestComp = 'None';
    let weakestComp = 'None';
    let maxPct = -1;
    let minPct = 101;
    const improvementRequiredComps = [];

    Object.entries(categoryAnalysis).forEach(([cat, data]) => {
      const pct = data.percentage;
      if (pct > maxPct) {
        maxPct = pct;
        strongestComp = cat;
      }
      if (pct < minPct) {
        minPct = pct;
        weakestComp = cat;
      }
      if (pct < 70) {
        improvementRequiredComps.push(cat);
      }
    });

    // History Analysis
    const otherAttempts = historyList.filter(h => h._id !== sessionResult._id);
    const lastAttempt = otherAttempts.length > 0 ? otherAttempts[0] : null;
    const historyImprovement = lastAttempt 
      ? accuracy - lastAttempt.percentage
      : 0;

    return (
      <div className="flex flex-col gap-6 text-left">
        {/* Header Block */}
        <div className="border-b border-panel-border pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
              <Sparkles size={13} className="text-purple-400" />
              <span>Skill Enhance Assessment Report</span>
            </div>
            <h2 className="text-[22px] text-slate-900 dark:text-white font-bold leading-tight">Overall Student Performance</h2>
            <p className="text-[13px] text-slate-500 dark:text-text-secondary mt-1">
              Assessment completed on {new Date(sessionResult.completedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="pill-primary" onClick={onFinish}>
              Finish & Return
            </Button>
          </div>
        </div>

        {/* SECTION 1: Overall Performance Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardCard className="p-4 flex flex-col justify-between hover:border-blue-500/20 transition-all">
            <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{score}</span>
              <span className="text-slate-400 dark:text-slate-500 text-[14px]">/ {questions.length}</span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">Questions Correct</span>
          </DashboardCard>

          <DashboardCard className="p-4 flex flex-col justify-between hover:border-emerald-500/20 transition-all">
            <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">Accuracy</span>
            <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {accuracy}%
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-500 h-full" style={{ width: `${accuracy}%` }} />
            </div>
          </DashboardCard>

          <DashboardCard className="p-4 flex flex-col justify-between hover:border-purple-500/20 transition-all">
            <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">Time Taken</span>
            <div className="mt-2 flex items-center gap-1.5 text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              <Clock size={20} className="shrink-0" />
              <span>{formatTime(timeTakenSec)}</span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">Total Duration</span>
          </DashboardCard>

          <DashboardCard className="p-4 flex flex-col justify-between hover:border-amber-500/20 transition-all">
            <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">Performance</span>
            <div className="mt-2 text-xl font-extrabold text-amber-600 dark:text-amber-500">
              {performanceLevel}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">Based on score percentage</span>
          </DashboardCard>

          <DashboardCard className="p-4 flex flex-col justify-between col-span-2 lg:col-span-1 hover:border-blue-500/25 transition-all">
            <span className="text-[11.5px] text-slate-400 font-bold uppercase tracking-wider">Global Benchmark</span>
            <div className="mt-2 flex flex-col gap-0.5">
              <div className="text-[13px] text-slate-500">Benchmark: <strong className="text-slate-700 dark:text-slate-300">{globalBenchmark}%</strong></div>
              <div className={`text-[13.5px] font-bold mt-1 flex items-center gap-1 ${isAboveBenchmark ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isAboveBenchmark ? (
                  <>
                    <span>Above Benchmark</span>
                    <span className="text-[11px] font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-600">+{benchmarkDiff}%</span>
                  </>
                ) : (
                  <>
                    <span>Below Benchmark</span>
                    <span className="text-[11px] font-medium bg-rose-500/10 px-1.5 py-0.5 rounded text-rose-600">-{benchmarkDiff}%</span>
                  </>
                )}
              </div>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Compared globally</span>
          </DashboardCard>
        </div>

        {/* SECTION 2: Core Competencies and Bloom's Taxonomy Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Competency Dimensions */}
          <DashboardCard className="p-5 flex flex-col gap-4">
            <div className="border-b border-panel-border pb-3 flex justify-between items-center">
              <h3 className="font-bold text-[15px] text-slate-900 dark:text-white flex items-center gap-2">
                <Award size={16} className="text-blue-500" />
                <span>Competency Dimensions</span>
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              {['Foundational', 'Applied', 'Collaborative', 'Reflective'].map(dim => {
                const data = categoryAnalysis[dim] || { attempted: 0, correct: 0, percentage: 0 };
                const colorClass = dim === 'Foundational' ? 'bg-[#1E3A8A]' :
                                   dim === 'Applied' ? 'bg-emerald-500' :
                                   dim === 'Collaborative' ? 'bg-purple-500' : 'bg-amber-500';
                return (
                  <div key={dim} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[12.5px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{dim} Mastery</span>
                      <span className="font-bold text-slate-500 dark:text-text-muted">
                        {data.correct} / {data.attempted} ({data.percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${data.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 p-3.5 bg-slate-200/40 dark:bg-white/[0.02] border border-slate-300 dark:border-panel-border rounded-xl text-[12.5px] flex flex-col gap-2">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Strongest competency</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 mt-0.5">
                  🌟 {strongestComp} ({categoryAnalysis[strongestComp]?.percentage || 0}%)
                </span>
              </div>
              <div className="border-t border-slate-300 dark:border-panel-border pt-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Needs Improvement</span>
                <span className="text-rose-500 font-bold flex items-center gap-1 mt-0.5">
                  ⚠️ {improvementRequiredComps.length > 0 ? improvementRequiredComps.join(', ') : weakestComp} 
                  {weakestComp !== 'None' && ` (${categoryAnalysis[weakestComp]?.percentage || 0}%)`}
                </span>
              </div>
            </div>
          </DashboardCard>

          {/* Bloom's Taxonomy Performance */}
          <DashboardCard className="p-5 flex flex-col gap-4">
            <div className="border-b border-panel-border pb-3">
              <h3 className="font-bold text-[15px] text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-500" />
                <span>Bloom's Taxonomy Performance</span>
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map(level => {
                const data = (report.bloomAnalysis && report.bloomAnalysis[level]) || { attempted: 0, correct: 0, percentage: 0 };
                return (
                  <div key={level} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{level}</span>
                      <span className="font-bold text-slate-400 dark:text-text-muted">
                        {data.correct}/{data.attempted} ({data.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${data.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        </div>

        {/* SECTION 3: Subject & Topic Performance Breakdown */}
        <DashboardCard className="p-5 flex flex-col gap-4">
          <div className="border-b border-panel-border pb-3">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-500" />
              <span>Subject &amp; Topic Analysis</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-panel-border text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Subject / Topic</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Strength Level</th>
                  <th className="py-2.5 px-3">Improvement Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.subjectAnalysis || {}).map(([subject, data]) => {
                  const strengthColor = data.strengthLevel === 'Mastery' ? 'text-emerald-500 bg-emerald-500/10' :
                                        data.strengthLevel === 'Proficient' ? 'text-blue-500 bg-blue-500/10' :
                                        'text-rose-500 bg-rose-500/10';
                  return (
                    <tr key={subject} className="border-b border-panel-border last:border-0 hover:bg-slate-200/20 dark:hover:bg-white/[0.01]">
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{subject}</td>
                      <td className="py-3 px-3 font-medium text-slate-500 dark:text-text-secondary">{data.correct} / {data.attempted}</td>
                      <td className="py-3 px-3 font-bold text-slate-700 dark:text-white">{data.percentage}%</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${strengthColor}`}>
                          {data.strengthLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-text-muted text-[12px]">{data.improvementRequirement}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        {/* SECTION 4: Strengths & Areas to Improve */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DashboardCard className="p-5 flex flex-col gap-3 border-l-4 border-l-emerald-500">
            <h3 className="font-bold text-[14.5px] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Your Strengths</span>
            </h3>
            <ul className="list-none flex flex-col gap-2">
              {report.strengths?.map((str, idx) => (
                <li key={idx} className="text-[13px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{str}</span>
                </li>
              )) || <li className="text-[13px] text-slate-500">Calculated strengths loading...</li>}
            </ul>
          </DashboardCard>

          <DashboardCard className="p-5 flex flex-col gap-3 border-l-4 border-l-rose-500">
            <h3 className="font-bold text-[14.5px] text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <XCircle size={16} />
              <span>Areas to Improve</span>
            </h3>
            <ul className="list-none flex flex-col gap-2">
              {report.weakAreas?.map((weak, idx) => (
                <li key={idx} className="text-[13px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{weak}</span>
                </li>
              )) || <li className="text-[13px] text-slate-500">Review correct answers to identify gaps.</li>}
            </ul>
          </DashboardCard>
        </div>

        {/* SECTION 5: Personalized Recommendations */}
        {report.personalizationDeactivated ? (
          <DashboardCard className="p-5 flex flex-col gap-4 border-l-4 border-l-amber-500 bg-amber-500/5">
            <h3 className="font-bold text-[15px] text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>Personalization Disabled</span>
            </h3>
            <p className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              Personalized recommendations are unavailable because permission for personalized analysis is not currently active.
            </p>
            {onManageConsent && (
              <Button
                variant="pill"
                onClick={onManageConsent}
                className="w-fit text-[12px] py-1.5 px-3 rounded-full mt-1 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
              >
                Manage Consent
              </Button>
            )}
          </DashboardCard>
        ) : (
          report.recommendations && report.recommendations.length > 0 && (
            <DashboardCard className="p-5 flex flex-col gap-4 border-l-4 border-l-purple-500">
              <h3 className="font-bold text-[15px] text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <Sparkles size={16} />
                <span>Recommended Next Steps</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.recommendations.map((rec, rIdx) => (
                  <div key={rIdx} className="bg-slate-200/40 dark:bg-white/[0.01] border border-slate-300 dark:border-panel-border p-4 rounded-xl">
                    <div className="font-bold text-[14px] text-slate-900 dark:text-white">{rec.topic}</div>
                    <div className="text-[11.5px] text-slate-400 dark:text-text-muted italic mt-0.5">Reason: {rec.reason}</div>
                    <p className="text-[13px] text-slate-600 dark:text-text-secondary leading-relaxed mt-2">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            </DashboardCard>
          )
        )}

        {/* SECTION 6: Assessment History & Progress */}
        <DashboardCard className="p-5 flex flex-col gap-4">
          <div className="border-b border-panel-border pb-3">
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white flex items-center gap-2">
              <History size={16} className="text-blue-500" />
              <span>Progress &amp; Assessment History</span>
            </h3>
          </div>
          {loadingHistory ? (
            <div className="py-4 text-center text-slate-500 text-[13px]">Analyzing historical assessments...</div>
          ) : otherAttempts.length === 0 ? (
            <div className="py-4 text-center text-slate-400 text-[13px] italic">
              🎉 This is your first completed Skill Enhance assessment. Complete more sessions to see your progress dashboard expand!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Progress Summary Info Card */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-xl text-[13.5px] text-blue-700 dark:text-blue-400 flex items-start gap-3">
                <Info size={16} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Progress Summary: </span>
                  {historyImprovement > 0 ? (
                    <span>Your score improved by <strong className="text-emerald-500 font-extrabold">{historyImprovement}%</strong> compared to your previous assessment. Great progress! Keep practicing the weak topics below to maintain this trajectory.</span>
                  ) : historyImprovement < 0 ? (
                    <span>Your score decreased by <strong className="text-rose-500 font-extrabold">{Math.abs(historyImprovement)}%</strong> compared to your previous session. Don't worry! Review the recommended steps and re-attempt the weak concepts.</span>
                  ) : (
                    <span>Your score remains consistent at <strong className="font-bold">{accuracy}%</strong>. Push yourself by trying a higher difficulty level or multi-disciplinary configs!</span>
                  )}
                </div>
              </div>

              {/* History List */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Recent Skill Enhance Assessments</span>
                {historyList.slice(0, 4).map((h) => {
                  const isCurrent = h._id === sessionResult._id;
                  return (
                    <div key={h._id} className={`flex justify-between items-center p-3 rounded-xl border text-[13px] transition-all ${
                      isCurrent 
                        ? 'bg-purple-500/5 border-purple-500/30 font-semibold' 
                        : 'bg-slate-200/40 dark:bg-white/[0.01] border-slate-300 dark:border-panel-border'
                    }`}>
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-slate-400" />
                        <div>
                          <span className="text-slate-800 dark:text-slate-200">
                            Skill Enhance Assessment ({h.ageGroup}) {isCurrent && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded ml-2 uppercase font-bold">Current</span>}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                            Completed {new Date(h.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{h.percentage}%</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">{h.score} / {h.totalQuestions}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DashboardCard>

        {/* SECTION 7: Complete Assessment Question Log */}
        <DashboardCard className="p-5 flex flex-col gap-4">
          <button 
            type="button"
            onClick={() => setShowQuestionsLog(!showQuestionsLog)}
            className="flex justify-between items-center w-full font-bold text-[15px] text-slate-900 dark:text-white"
          >
            <span className="flex items-center gap-2">
              <BookOpen size={16} className="text-blue-500" />
              <span>Review Assessment Questions ({questions.length})</span>
            </span>
            <span className="text-xs text-purple-500 hover:underline">{showQuestionsLog ? 'Hide Details ▴' : 'Show Details ▾'}</span>
          </button>

          {showQuestionsLog && (
            <div className="flex flex-col gap-4 border-t border-panel-border pt-4 mt-1">
              {questions.map((q, qIdx) => {
                const ans = answeredQuestions[qIdx] || {};
                const isCorrect = ans.isCorrect === true;
                return (
                  <div key={qIdx} className="bg-slate-200/40 dark:bg-white/[0.01] p-5 rounded-2xl border border-slate-300 dark:border-panel-border flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="text-[11px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold uppercase">
                          {q.bloomLevel || 'Bloom'}
                        </span>
                        <span className="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase">
                          {q.category || 'Dimension'}
                        </span>
                        <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                          {q.subject}
                        </span>
                      </div>
                      <span className={`flex items-center gap-1 text-[12px] font-bold ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isCorrect ? '✓ Correct' : '✕ Incorrect'}
                      </span>
                    </div>
                    <p className="font-semibold text-[14px] text-slate-900 dark:text-white leading-relaxed">{q.question}</p>
                    
                    {/* Render options if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="flex flex-col gap-1.5 my-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = opt === ans.selectedAnswer;
                          const isActualCorrect = opt === q.correctAnswer;
                          return (
                            <div 
                              key={optIdx} 
                              className={`p-2.5 rounded-xl border text-[13px] transition-all duration-200 ${
                                isSelected 
                                  ? (isCorrect 
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold' 
                                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold') 
                                  : opt === q.correctAnswer 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold' 
                                    : 'bg-slate-100 dark:bg-white/[0.01] border-slate-200 dark:border-panel-border text-slate-700 dark:text-text-secondary'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{opt}</span>
                                {isSelected && <span className="text-[10px] font-bold uppercase tracking-wider">{isCorrect ? 'Chosen Correct Answer' : 'Your Answer'}</span>}
                                {!isSelected && isActualCorrect && <span className="text-[10px] font-bold uppercase tracking-wider">Correct Answer</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanations */}
                    <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl text-[12.5px] leading-relaxed text-slate-600 dark:text-text-secondary mt-1">
                      <strong>Reasoning:</strong> {q.explanation}
                    </div>

                    {/* Resources */}
                    {q.references && q.references.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recommended Reading</span>
                        <div className="flex flex-wrap gap-2">
                          {q.references.map((ref, refIdx) => (
                            <a 
                              key={refIdx} 
                              href={ref.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[12px] bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 px-3 py-1 rounded-lg border border-slate-300 dark:border-panel-border text-slate-700 dark:text-slate-300 inline-flex items-center gap-1 hover:underline"
                            >
                              <span>{ref.title || ref.source}</span>
                              <ArrowUpRight size={12} className="text-slate-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DashboardCard>

        {/* Action Button */}
        <div className="flex justify-end border-t border-panel-border pt-5 mt-6">
          <Button variant="pill-primary" onClick={onFinish}>
            Finish & Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answeredQuestions[currentQuestionIndex] !== undefined;
  const isCorrect = answeredQuestions[currentQuestionIndex]?.isCorrect;
  const selectedIdx = selectedAnswers[currentQuestionIndex];
  const isShortAns = currentQuestion?.questionType === 'Short Answer';
  const isSubmitDisabled = selectedIdx === undefined || 
    (isShortAns && typeof selectedIdx === 'string' && selectedIdx.trim() === '');

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="border-b border-panel-border pb-5 flex justify-between items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="zapGradientAssess" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#zapGradientAssess)" stroke="url(#zapGradientAssess)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Skill Enhance Assessment</span>
          </div>
          <h2 className="text-[20px] text-slate-900 dark:text-white font-bold leading-tight">Randomized Multi-Subject Challenge</h2>
        </div>
        <div className="text-right">
          <div className="font-heading text-lg font-bold text-slate-500 dark:text-text-secondary">Question {currentQuestionIndex + 1} / {questions.length}</div>
        </div>
      </div>

      <div className="h-1 bg-white/5 rounded-sm overflow-hidden relative">
        <div 
          className="h-full transition-all duration-300 bg-purple-500"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Meta country/subject labels */}
      <div className="flex gap-2">
        <span className="text-[11.5px] font-bold px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
          🌏 {currentQuestion.globalContext.toUpperCase()}
        </span>
        <span className="text-[11.5px] font-bold px-3 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
          📚 {currentQuestion.subject.toUpperCase()}
        </span>
      </div>

      <QuestionCard
        questionData={{
          ...currentQuestion,
          taxonomy: currentQuestion.questionType
        }}
        selectedAnswerIndex={selectedIdx}
        onSelectAnswer={handleSelectAnswer}
        isLocked={isAnswered}
      />

      {/* Correct / Incorrect active feedback only */}
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
            onClick={nextQuestion}
            disabled={loading}
          >
            <span>
              {currentQuestionIndex === questions.length - 1 ? (loading ? "Completing..." : "Complete Session") : "Next Question"}
            </span>
            <ChevronRight size={14} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SkillEnhanceWorkspace;
