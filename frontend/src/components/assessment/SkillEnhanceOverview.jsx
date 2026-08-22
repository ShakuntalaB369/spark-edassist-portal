import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { DashboardCard } from '../dashboard/DashboardCard';
import { skillEnhanceService } from '../../services/skillEnhanceService';
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
  Cpu,
  TrendingUp,
  History,
  AlertTriangle,
  Flame,
  Zap,
  TrendingDown,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const SkillEnhanceOverview = ({ initialConfig, onStart, onBack, onSelectReport, consentStatus, onManageConsent, onShowParams }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRange, setFilterRange] = useState('all'); // today | 7 | 30 | all
  const [ageGroup, setAgeGroup] = useState(initialConfig?.ageGroup || '15–18');
  const [difficulty, setDifficulty] = useState(initialConfig?.difficulty || 'Medium');
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch history
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await skillEnhanceService.getMySkillEnhance();
      if (res?.success) {
        setHistory(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      const res = await skillEnhanceService.deleteSkillEnhance(deleteTargetId);
      if (res?.success) {
        setHistory(prev => prev.filter(item => item._id !== deleteTargetId));
      } else {
        throw new Error(res?.message || 'Failed to delete');
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handleStart = () => {
    onStart({ ageGroup, difficulty });
  };

  // Helper: check if date falls in today, last 7, last 30 days
  const filterByRange = (items, range) => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    return items.filter(item => {
      const date = new Date(item.completedAt);
      if (range === 'today') {
        return date.toDateString() === todayStr;
      }
      if (range === '7') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return date >= sevenDaysAgo;
      }
      if (range === '30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return date >= thirtyDaysAgo;
      }
      return true; // all
    });
  };

  const getFilteredMetrics = (items) => {
    if (items.length === 0) {
      return {
        count: 0,
        avgScore: 0,
        avgAccuracy: 0,
        questionsAttempted: 0,
        timeSpent: 0,
        improvement: 0
      };
    }

    const totalScore = items.reduce((sum, x) => sum + x.percentage, 0);
    const count = items.length;
    const avgScore = Math.round(totalScore / count);

    let totalCorrect = 0;
    let totalQuestions = 0;
    let timeSpent = 0;

    items.forEach(x => {
      totalQuestions += x.totalQuestions || 0;
      timeSpent += x.timeTaken || 0;
      totalCorrect += x.answers?.filter(ans => ans.isCorrect).length || 0;
    });

    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Calculate improvement
    let improvement = 0;
    if (items.length >= 2) {
      const half = Math.ceil(items.length / 2);
      const recent = items.slice(0, half);
      const older = items.slice(half);
      const recentAvg = recent.reduce((sum, x) => sum + x.percentage, 0) / recent.length;
      const olderAvg = older.reduce((sum, x) => sum + x.percentage, 0) / older.length;
      improvement = Math.round(recentAvg - olderAvg);
    }

    return {
      count,
      avgScore,
      avgAccuracy,
      questionsAttempted: totalQuestions,
      timeSpent: Math.round(timeSpent / 60), // in minutes
      improvement
    };
  };

  // 1. Overall stats (always derived from all items)
  const overallScore = history.length > 0 
    ? Math.round(history.reduce((sum, x) => sum + x.percentage, 0) / history.length) 
    : 0;

  const totalCorrectAll = history.reduce((sum, x) => sum + (x.answers?.filter(ans => ans.isCorrect).length || 0), 0);
  const totalQuestionsAll = history.reduce((sum, x) => sum + (x.totalQuestions || 0), 0);
  const overallAccuracy = totalQuestionsAll > 0 ? Math.round((totalCorrectAll / totalQuestionsAll) * 100) : 0;

  // Streak Calculation
  const calculateStreak = (items) => {
    if (items.length === 0) return 0;
    const uniqueDates = Array.from(new Set(items.map(x => new Date(x.completedAt).toDateString()))).map(d => new Date(d));
    uniqueDates.sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latest = new Date(uniqueDates[0]);
    latest.setHours(0,0,0,0);

    if (latest.getTime() !== today.getTime() && latest.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const curr = new Date(uniqueDates[i]);
      curr.setHours(0,0,0,0);
      const prev = new Date(uniqueDates[i+1]);
      prev.setHours(0,0,0,0);

      const diff = Math.ceil(Math.abs(curr - prev) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
      } else if (diff > 1) {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak(history);

  // Overall Improvement
  const overallImprovement = history.length >= 2 
    ? (() => {
        const half = Math.ceil(history.length / 2);
        const recent = history.slice(0, half);
        const older = history.slice(half);
        const recentAvg = recent.reduce((sum, x) => sum + x.percentage, 0) / recent.length;
        const olderAvg = older.reduce((sum, x) => sum + x.percentage, 0) / older.length;
        return Math.round(recentAvg - olderAvg);
      })()
    : 0;

  // 2. Filtered Range Analysis
  const rangeItems = filterByRange(history, filterRange);
  const rangeMetrics = getFilteredMetrics(rangeItems);

  // 3. Today's Performance
  const todayItems = filterByRange(history, 'today');
  const todayMetrics = getFilteredMetrics(todayItems);

  // 4. Competency Progress (Foundational, Applied, Collaborative, Reflective)
  const getCompetencyScores = (items) => {
    const counts = { Foundational: { total: 0, correct: 0 }, Applied: { total: 0, correct: 0 }, Collaborative: { total: 0, correct: 0 }, Reflective: { total: 0, correct: 0 } };
    items.forEach(session => {
      session.questions.forEach((q, idx) => {
        const ans = session.answers?.find(a => a.questionId === q.questionId) || session.answers?.[idx];
        const cat = q.category || ['Foundational', 'Applied', 'Collaborative', 'Reflective'][idx % 4];
        if (counts[cat]) {
          counts[cat].total++;
          if (ans?.isCorrect) {
            counts[cat].correct++;
          }
        }
      });
    });

    const results = {};
    Object.keys(counts).forEach(k => {
      results[k] = counts[k].total > 0 ? Math.round((counts[k].correct / counts[k].total) * 100) : 0;
    });
    return results;
  };

  const compScores = getCompetencyScores(history);

  // Previous Competency scores (excluding the most recent assessment, to show delta)
  const prevCompScores = history.length >= 2 ? getCompetencyScores(history.slice(1)) : null;

  // Competency Trends over time
  const getCompetencyTrends = (items) => {
    // Chronological order
    const sorted = [...items].reverse();
    const result = { Foundational: [], Applied: [], Collaborative: [], Reflective: [] };
    
    sorted.forEach((session, index) => {
      const currentSnapshot = sorted.slice(0, index + 1);
      const snapshotScores = getCompetencyScores(currentSnapshot);
      Object.keys(result).forEach(k => {
        result[k].push({ score: snapshotScores[k], assessmentIndex: index + 1 });
      });
    });
    return result;
  };

  const compTrends = getCompetencyTrends(history);

  // 5. Subject & Topic Performance
  const getSubjectMetrics = (items) => {
    const subjects = {};
    items.forEach(session => {
      session.questions.forEach((q, idx) => {
        const sub = q.subject || 'General';
        const ans = session.answers?.find(a => a.questionId === q.questionId) || session.answers?.[idx];
        if (!subjects[sub]) {
          subjects[sub] = { attempts: 0, correct: 0, history: [] };
        }
        subjects[sub].attempts++;
        if (ans?.isCorrect) {
          subjects[sub].correct++;
        }
        subjects[sub].history.push(ans?.isCorrect ? 1 : 0);
      });
    });

    const result = [];
    Object.keys(subjects).forEach(sub => {
      const attempts = subjects[sub].attempts;
      const correct = subjects[sub].correct;
      const accuracy = Math.round((correct / attempts) * 100);
      
      // Calculate Trend (accuracy of recent 3 attempts vs older attempts)
      const subHistory = subjects[sub].history;
      let trend = 'Neutral';
      if (subHistory.length >= 4) {
        const half = Math.ceil(subHistory.length / 2);
        const recentCorrect = subHistory.slice(0, half).filter(x => x === 1).length;
        const olderCorrect = subHistory.slice(half).filter(x => x === 1).length;
        trend = recentCorrect >= olderCorrect ? 'Up' : 'Down';
      }

      result.push({
        subject: sub,
        attempts,
        accuracy,
        score: accuracy, // same as accuracy for question performance
        trend
      });
    });

    return result.sort((a, b) => b.attempts - a.attempts);
  };

  const subjectPerformance = getSubjectMetrics(history);

  // 6. Strengths and Weaknesses
  const deriveInsights = () => {
    const strengths = [];
    const weaknesses = [];

    // Competency assessment
    Object.keys(compScores).forEach(k => {
      const score = compScores[k];
      if (score >= 75) {
        strengths.push({
          type: 'competency',
          title: `Strong performance in ${k} competency.`,
          detail: `You demonstrate mastery in the ${k.toLowerCase()} aspect of learning assessments.`
        });
      } else if (score < 60 && score > 0) {
        weaknesses.push({
          type: 'competency',
          title: `${k} competency is currently below average.`,
          detail: `Try focused practice on ${k.toLowerCase()} tasks to strengthen your scores.`
        });
      }
    });

    // Subject assessment
    subjectPerformance.forEach(sub => {
      if (sub.accuracy >= 80 && sub.attempts >= 3) {
        strengths.push({
          type: 'subject',
          title: `Consistently high accuracy in ${sub.subject}.`,
          detail: `Your understanding of ${sub.subject} concepts is exceptional.`
        });
      } else if (sub.accuracy < 60 && sub.attempts >= 3) {
        weaknesses.push({
          type: 'subject',
          title: `Accuracy in ${sub.subject} requires attention.`,
          detail: `Review explanations for incorrect responses in ${sub.subject}.`
        });
      }
    });

    return { strengths, weaknesses };
  };

  const insights = deriveInsights();

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <Clock className="animate-spin text-blue-500 w-10 h-10" />
        <span className="text-[14.5px] text-slate-500 font-semibold">Generating your intelligence profile...</span>
      </div>
    );
  }

  // EMPTY STATE
  if (history.length === 0) {
    return (
      <div className="flex flex-col gap-6 text-left py-4">
        {/* Header */}
        <div className="border-b border-panel-border pb-5">
          <h2 className="text-[22px] text-slate-900 dark:text-white font-bold leading-tight flex items-center gap-2">
            <span>✨ Skill Enhance</span>
          </h2>
          <p className="text-[13.5px] text-slate-500 dark:text-text-secondary mt-1">
            Track your competency growth, assessment performance, and learning progress over time.
          </p>
        </div>

        {/* Info card */}
        <div className="p-8 bg-blue-500/[0.01] border border-dashed border-blue-500/20 rounded-2xl flex flex-col items-center justify-center text-center gap-4 py-16">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center">
            <Zap className="text-blue-500" size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-[17px] text-slate-950 dark:text-white mb-1.5">Start Building Your Skill Profile</h3>
            <p className="text-[13.5px] text-slate-500 max-w-md mx-auto leading-relaxed">
              Complete your first Skill Enhance assessment to start tracking your competency growth and performance.
            </p>
          </div>
        </div>

        {/* Configuration Setup Form */}
        <DashboardCard className="p-5 flex flex-col gap-4 max-w-lg mx-auto w-full">
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
                <option value="6–10">6–10</option>
                <option value="11–14">11–14</option>
                <option value="15–18">15–18</option>
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
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-panel-border pt-4 mt-2">
            <Button variant="pill" onClick={onBack}>Cancel / Back</Button>
            <Button variant="pill-primary" onClick={handleStart} className="flex items-center gap-1.5">
              <span>Start Skill Enhance</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </DashboardCard>
      </div>
    );
  }

  // ACTIVE DASHBOARD STATE
  return (
    <>
    <div className="flex flex-col gap-6 text-left py-4">
      
      {/* 1. Header */}
      <div className="border-b border-panel-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] text-slate-900 dark:text-white font-bold leading-tight flex items-center gap-2">
            <span>✨ Skill Enhance Dashboard</span>
          </h2>
          <p className="text-[13.5px] text-slate-500 dark:text-text-secondary mt-1">
            Track your competency growth, assessment performance, and learning progress over time.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="pill" onClick={onBack}>
            Cancel / Back
          </Button>
          <Button variant="pill-primary" onClick={onShowParams || handleStart} className="flex items-center gap-1.5">
            <span>Start Skill Enhance</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      {/* Expiry / Consent alert if not granted */}
      {consentStatus !== 'granted' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
              {consentStatus === 'expired' 
                ? "⚠️ Your consent for personalized learning has expired. Personalization insights are currently unavailable." 
                : "Personalized insights are currently unavailable because personalization consent is not active."}
            </div>
          </div>
          {onManageConsent && (
            <Button
              variant="pill"
              onClick={onManageConsent}
              className="text-[11px] py-1.5 px-3 rounded-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10 shrink-0 font-bold"
            >
              Manage Consent
            </Button>
          )}
        </div>
      )}

      {/* 2. Overall Performance summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-2xl flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overall Score</span>
          <strong className="text-2xl text-slate-900 dark:text-white font-extrabold">{overallScore}%</strong>
        </div>

        <div className="p-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-2xl flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assessments</span>
          <strong className="text-2xl text-slate-900 dark:text-white font-extrabold">{history.length}</strong>
        </div>

        <div className="p-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-2xl flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Accuracy</span>
          <strong className="text-2xl text-slate-900 dark:text-white font-extrabold">{overallAccuracy}%</strong>
        </div>

        <div className="p-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-2xl flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</span>
          <strong className="text-2xl text-slate-900 dark:text-white font-extrabold flex items-center gap-1.5">
            <Flame className="text-orange-500 fill-orange-500 shrink-0" size={20} />
            <span>{streak} day{streak !== 1 ? 's' : ''}</span>
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-2xl flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Improvement</span>
          <strong className={`text-2xl font-extrabold flex items-center gap-1 ${overallImprovement >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {overallImprovement >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span>{overallImprovement >= 0 ? '+' : ''}{overallImprovement}%</span>
          </strong>
        </div>
      </div>

      {/* 3. Range Filter & Aggregated Analysis */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
          <h4 className="text-[12.8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Interval Analytics</h4>
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl text-xs font-semibold">
            {['today', '7', '30', 'all'].map(range => (
              <button
                key={range}
                onClick={() => setFilterRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterRange === range ? 'bg-white dark:bg-white/10 shadow-sm text-slate-950 dark:text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {range === 'today' ? "Today" : range === '7' ? "7 Days" : range === '30' ? "30 Days" : "All Time"}
              </button>
            ))}
          </div>
        </div>

        {rangeItems.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs italic">
            No assessments taken during this filter period.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Assessments</span>
              <strong className="text-[17px] text-slate-950 dark:text-white">{rangeMetrics.count}</strong>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Score</span>
              <strong className="text-[17px] text-slate-950 dark:text-white">{rangeMetrics.avgScore}%</strong>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Accuracy</span>
              <strong className="text-[17px] text-slate-950 dark:text-white">{rangeMetrics.avgAccuracy}%</strong>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Questions</span>
              <strong className="text-[17px] text-slate-950 dark:text-white">{rangeMetrics.questionsAttempted}</strong>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Time Spent</span>
              <strong className="text-[17px] text-slate-950 dark:text-white">{rangeMetrics.timeSpent} mins</strong>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Improvement</span>
              <strong className={`text-[17px] font-bold flex items-center gap-0.5 ${rangeMetrics.improvement >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {rangeMetrics.improvement >= 0 ? '+' : ''}{rangeMetrics.improvement}%
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Today's Performance & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Today's Performance Card */}
        <DashboardCard className="p-5 flex flex-col gap-4">
          <h3 className="font-bold text-[14.5px] text-slate-900 dark:text-white border-b border-panel-border pb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={16} className="text-amber-500" />
            <span>Today's Performance</span>
          </h3>

          {todayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3.5 my-auto">
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                You haven't completed an assessment today.
              </p>
              <Button variant="pill-primary" onClick={handleStart} className="text-xs py-1.5 px-3">
                Start Skill Enhance →
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="p-3.5 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-panel-border rounded-xl">
                <span className="text-[10.5px] font-bold text-slate-400 block mb-0.5">Assessments Today</span>
                <strong className="text-[19px] text-slate-900 dark:text-white">{todayMetrics.count}</strong>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-panel-border rounded-xl">
                <span className="text-[10.5px] font-bold text-slate-400 block mb-0.5">Average Score</span>
                <strong className="text-[19px] text-slate-900 dark:text-white">{todayMetrics.avgScore}%</strong>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-panel-border rounded-xl">
                <span className="text-[10.5px] font-bold text-slate-400 block mb-0.5">Questions Attempted</span>
                <strong className="text-[19px] text-slate-900 dark:text-white">{todayMetrics.questionsAttempted}</strong>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-panel-border rounded-xl">
                <span className="text-[10.5px] font-bold text-slate-400 block mb-0.5">Time Spent Today</span>
                <strong className="text-[19px] text-slate-900 dark:text-white">{todayMetrics.timeSpent} mins</strong>
              </div>
            </div>
          )}
        </DashboardCard>

        {/* 5. Performance Trend Chart */}
        <DashboardCard className="p-5 flex flex-col gap-4">
          <h3 className="font-bold text-[14.5px] text-slate-900 dark:text-white border-b border-panel-border pb-3 uppercase tracking-wider">
            Performance Trend
          </h3>
          {history.length < 2 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic my-auto">
              Complete at least 2 assessments to generate trend charts.
            </div>
          ) : (
            <div className="relative h-[150px] w-full pt-4">
              {/* SVG Line Chart */}
              {(() => {
                const chartHeight = 110;
                const chartWidth = 500;
                const padding = 20;
                const sortedHistory = [...history].reverse(); // oldest first
                
                const points = sortedHistory.map((item, index) => {
                  const x = padding + (index * (chartWidth - 2 * padding)) / Math.max(1, sortedHistory.length - 1);
                  const y = chartHeight - padding - (item.percentage * (chartHeight - 2 * padding)) / 100;
                  return { x, y, score: item.percentage, date: new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
                });

                const pathD = points.reduce((path, p, i) => {
                  return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
                }, "");

                return (
                  <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                    {/* Grid lines */}
                    <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(128,128,128,0.1)" strokeDasharray="3" />
                    <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(128,128,128,0.15)" />
                    
                    {/* Path line */}
                    <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Points */}
                    {points.map((p, i) => (
                      <g key={i} className="group cursor-pointer">
                        <circle cx={p.x} cy={p.y} r="4" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fontWeight="bold" className="fill-slate-900 dark:fill-white font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-black">
                          {p.score}%
                        </text>
                        {/* X-axis labels for end points */}
                        {(i === 0 || i === points.length - 1 || points.length <= 5) && (
                          <text x={p.x} y={chartHeight - 2} textAnchor="middle" fontSize="8" className="fill-slate-400 dark:fill-slate-500">
                            {p.date}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>
                );
              })()}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Grid: Competency Progress & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 7. Competency Progress */}
        <DashboardCard className="p-5 flex flex-col gap-4">
          <h3 className="font-bold text-[14.5px] text-slate-900 dark:text-white border-b border-panel-border pb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={16} className="text-blue-500" />
            <span>Competency Progress</span>
          </h3>

          <div className="flex flex-col gap-4 py-1">
            {Object.keys(compScores).map(k => {
              const score = compScores[k];
              const prevScore = prevCompScores ? prevCompScores[k] : null;
              const delta = prevScore !== null ? score - prevScore : 0;

              let barColor = 'bg-blue-600';
              if (k === 'Applied') barColor = 'bg-emerald-600';
              if (k === 'Collaborative') barColor = 'bg-indigo-600';
              if (k === 'Reflective') barColor = 'bg-amber-600';

              return (
                <div key={k} className="flex flex-col gap-1 text-left">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{k}</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 dark:text-white">{score}%</strong>
                      {prevScore !== null && delta !== 0 && (
                        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>

        {/* 8. Competency Trend */}
        <DashboardCard className="p-5 flex flex-col gap-4">
          <h3 className="font-bold text-[14.5px] text-slate-900 dark:text-white border-b border-panel-border pb-3 uppercase tracking-wider">
            Competency Trend
          </h3>
          {history.length < 2 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic my-auto">
              Complete at least 2 assessments to generate competency trends.
            </div>
          ) : (
            <div className="relative h-[150px] w-full pt-4">
              {/* SVG Competency Line Charts */}
              {(() => {
                const chartHeight = 110;
                const chartWidth = 500;
                const padding = 20;
                
                const drawLineForCompetency = (key, strokeColor) => {
                  const data = compTrends[key];
                  if (!data || data.length < 2) return null;
                  
                  const points = data.map((d, index) => {
                    const x = padding + (index * (chartWidth - 2 * padding)) / Math.max(1, data.length - 1);
                    const y = chartHeight - padding - (d.score * (chartHeight - 2 * padding)) / 100;
                    return { x, y };
                  });

                  const pathD = points.reduce((path, p, i) => {
                    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
                  }, "");

                  return (
                    <g key={key} className="group">
                      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75 hover:opacity-100 transition-opacity" />
                    </g>
                  );
                };

                return (
                  <div className="flex flex-col gap-3">
                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                      {/* Grid lines */}
                      <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(128,128,128,0.1)" strokeDasharray="3" />
                      <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(128,128,128,0.15)" />

                      {drawLineForCompetency('Foundational', '#2563eb')}
                      {drawLineForCompetency('Applied', '#059669')}
                      {drawLineForCompetency('Collaborative', '#6366f1')}
                      {drawLineForCompetency('Reflective', '#d97706')}
                    </svg>
                    
                    {/* Legend */}
                    <div className="flex justify-center gap-3 flex-wrap text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-600" /> Foundational</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-600" /> Applied</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-600" /> Collaborative</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-600" /> Reflective</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Grid: Subject Performance & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* 9. Subject & Topic Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-panel-border pb-3">
            <h3 className="font-bold text-[13.5px] text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={15} className="text-[#1E3A8A] dark:text-blue-400" />
              <span>Subject Performance</span>
            </h3>
            {subjectPerformance.length > 0 && (
              <span className="text-[11px] text-slate-400 font-medium">
                {showAllSubjects ? subjectPerformance.length : Math.min(5, subjectPerformance.length)} of {subjectPerformance.length} subjects
              </span>
            )}
          </div>

          {subjectPerformance.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <BookOpen size={22} className="text-slate-300 dark:text-slate-600" />
              <p className="text-[12.5px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs">
                Complete a Skill Enhance assessment to start building your subject performance profile.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <th className="pb-2.5 pr-4">Subject / Topic</th>
                      <th className="pb-2.5 text-right pr-4">Attempts</th>
                      <th className="pb-2.5 text-right pr-4">Accuracy</th>
                      <th className="pb-2.5 text-right pr-4">Score</th>
                      <th className="pb-2.5 text-center">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllSubjects ? subjectPerformance : subjectPerformance.slice(0, 5)).map((sub, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-slate-100 dark:border-white/[0.04] hover:bg-slate-50/60 dark:hover:bg-white/[0.015] transition-colors duration-100"
                      >
                        <td className="py-2.5 pr-4">
                          <span className="font-semibold text-[12.5px] text-slate-800 dark:text-slate-200">{sub.subject}</span>
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          <span className="text-[12px] font-semibold tabular-nums text-slate-600 dark:text-slate-400">{sub.attempts}</span>
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          <span className={`text-[12px] font-bold tabular-nums ${
                            sub.accuracy >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                            : sub.accuracy >= 50 ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-500'
                          }`}>{sub.accuracy}%</span>
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          <span className="text-[12px] font-bold tabular-nums text-[#1E3A8A] dark:text-blue-400">{sub.score}%</span>
                        </td>
                        <td className="py-2.5 text-center">
                          {sub.trend === 'Up' ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                              <ChevronUp size={11} className="text-emerald-500" strokeWidth={2.5} />
                            </span>
                          ) : sub.trend === 'Down' ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-500/10">
                              <ChevronDown size={11} className="text-rose-500" strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 font-bold text-[13px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {subjectPerformance.length > 5 && (
                <button
                  onClick={() => setShowAllSubjects(prev => !prev)}
                  className="mt-1 self-center flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors duration-150 py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {showAllSubjects ? (
                    <><ChevronUp size={13} strokeWidth={2.2} /> Show Less</>
                  ) : (
                    <><ChevronDown size={13} strokeWidth={2.2} /> Show {subjectPerformance.length - 5} More</>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* 10. Strength & Weakness Analysis */}
        <div className="flex flex-col gap-4">
          <DashboardCard className="p-5 flex flex-col gap-3">
            <h3 className="font-bold text-[13.5px] text-[#059669] border-b border-panel-border pb-2.5 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              <span>Your Strengths</span>
            </h3>
            {consentStatus !== 'granted' ? (
              <div className="py-4 text-center text-slate-400 text-xs italic">
                Personalized strengths are deactivated.
              </div>
            ) : insights.strengths.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-xs italic">
                Completing more assessments to deduce strengths.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 text-xs text-left">
                {insights.strengths.slice(0, 3).map((s, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-850 dark:text-white">{s.title}</span>
                    <span className="text-slate-450 text-[11px] leading-snug">{s.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          <DashboardCard className="p-5 flex flex-col gap-3">
            <h3 className="font-bold text-[13.5px] text-[#D97706] border-b border-panel-border pb-2.5 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={15} />
              <span>Areas to Improve</span>
            </h3>
            {consentStatus !== 'granted' ? (
              <div className="py-4 text-center text-slate-400 text-xs italic">
                Personalized weak areas are deactivated.
              </div>
            ) : insights.weaknesses.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-xs italic">
                Completing more assessments to deduce growth paths.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 text-xs text-left">
                {insights.weaknesses.slice(0, 3).map((w, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-850 dark:text-white">{w.title}</span>
                    <span className="text-slate-450 text-[11px] leading-snug">{w.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      {/* Grid: Detailed History & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Detailed Assessment History */}
        <div className="lg:col-span-2 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-panel-border pb-3">
            <h3 className="font-bold text-[13.5px] text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <History size={15} className="text-[#1E3A8A] dark:text-blue-400" />
              <span>Assessment History</span>
            </h3>
            {history.length > 0 && (
              <span className="text-[11px] text-slate-400 font-medium">
                {showAllHistory ? history.length : Math.min(3, history.length)} of {history.length}
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <History size={22} className="text-slate-300 dark:text-slate-600" />
              <p className="text-[12.5px] text-slate-400 dark:text-slate-500">No assessments completed yet.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {[...history]
                  .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                  .slice(0, showAllHistory ? undefined : 3)
                  .map((attempt) => {
                    const perfLevel = attempt.percentage >= 90 ? 'Excellent' : attempt.percentage >= 75 ? 'Strong' : attempt.percentage >= 60 ? 'Developing' : 'Needs Improvement';
                    const perfColor = attempt.percentage >= 90 ? 'text-emerald-600 dark:text-emerald-400' : attempt.percentage >= 75 ? 'text-blue-600 dark:text-blue-400' : attempt.percentage >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500';
                    const formattedDate = new Date(attempt.completedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={attempt._id} className="p-3.5 bg-slate-50 dark:bg-white/[0.015] border border-slate-200/50 dark:border-panel-border rounded-xl flex items-center justify-between gap-3 flex-wrap hover:border-slate-300 dark:hover:border-white/10 transition-all duration-100">
                        <div className="flex flex-col gap-0.5 text-left min-w-0">
                          <div className="font-bold text-[13px] text-slate-900 dark:text-white truncate">Skill Enhance Assessment</div>
                          <div className="text-[11px] text-slate-400">{formattedDate}</div>
                          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                            <span>Age: {attempt.ageGroup}</span>
                            <span>•</span>
                            <span>{attempt.difficulty}</span>
                            <span>•</span>
                            <span>{attempt.totalQuestions}Q</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-right">
                            <div className={`font-bold text-[14px] tabular-nums ${perfColor}`}>{attempt.percentage}%</div>
                            <div className="text-[10.5px] font-semibold text-slate-400">{perfLevel}</div>
                          </div>
                          <Button variant="modal" size="sm" onClick={() => onSelectReport(attempt)} className="px-3 py-1.5 font-bold text-[11px] rounded-full">
                            View Report
                          </Button>
                          <button
                            onClick={() => setDeleteTargetId(attempt._id)}
                            title="Delete Assessment"
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:border-rose-200 dark:hover:border-rose-400/30 hover:shadow-sm transition-all duration-150 shrink-0"
                          >
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 13 6"/>
                              <path d="M5 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              <path d="M4 6l.8 7.2A1 1 0 005.8 14h4.4a1 1 0 00.996-.9L12 6"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {history.length > 3 && (
                <button
                  onClick={() => setShowAllHistory(prev => !prev)}
                  className="self-center flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors duration-150 py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {showAllHistory ? (
                    <><ChevronUp size={13} strokeWidth={2.2} /> Show Less</>
                  ) : (
                    <><ChevronDown size={13} strokeWidth={2.2} /> Show {history.length - 3} More</>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Recent Activity Log */}
        <DashboardCard className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-panel-border pb-3">
            <h3 className="font-bold text-[13.5px] text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Activity
            </h3>
            {history.length > 0 && (
              <span className="text-[11px] text-slate-400 font-medium">
                {showAllActivity ? history.length : Math.min(5, history.length)} of {history.length}
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
              <Zap size={20} className="text-slate-300 dark:text-slate-600" />
              <p className="text-[12px] text-slate-400 dark:text-slate-500">No activity yet.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col text-xs text-left">
                {[...history]
                  .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                  .slice(0, showAllActivity ? undefined : 5)
                  .map((item, idx) => {
                    const date = new Date(item.completedAt);
                    const today = new Date();
                    let dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    if (date.toDateString() === today.toDateString()) {
                      dateLabel = 'Today';
                    } else {
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      if (date.toDateString() === yesterday.toDateString()) dateLabel = 'Yesterday';
                    }
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] px-1 rounded transition-colors cursor-pointer"
                        onClick={() => onSelectReport(item)}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-semibold text-[12px] text-slate-800 dark:text-slate-200 truncate">Skill Enhance</span>
                          <span className="text-[11px] text-slate-400">{dateLabel}</span>
                        </div>
                        <strong className={`text-sm font-extrabold shrink-0 ${
                          item.percentage >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                          : item.percentage >= 50 ? 'text-blue-600 dark:text-blue-400'
                          : 'text-rose-500'
                        }`}>{item.percentage}%</strong>
                      </div>
                    );
                  })}
              </div>

              {history.length > 5 && (
                <button
                  onClick={() => setShowAllActivity(prev => !prev)}
                  className="self-center flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors duration-150 py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {showAllActivity ? (
                    <><ChevronUp size={13} strokeWidth={2.2} /> Show Less</>
                  ) : (
                    <><ChevronDown size={13} strokeWidth={2.2} /> Show {history.length - 5} More</>
                  )}
                </button>
              )}
            </>
          )}
        </DashboardCard>
      </div>
    </div>

    {/* ── Delete Confirmation Modal ── */}
    {deleteTargetId && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-panel-border rounded-2xl max-w-[400px] w-full p-6 shadow-2xl animate-fade-in text-center flex flex-col gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center mx-auto">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 13 6"/>
              <path d="M5 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              <path d="M4 6l.8 7.2A1 1 0 005.8 14h4.4a1 1 0 00.996-.9L12 6"/>
            </svg>
          </div>
          {/* Text */}
          <div>
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white mb-1.5">Delete Assessment?</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete this assessment result? This action will remove the assessment from your history and cannot be undone.
            </p>
          </div>
          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="modal"
              onClick={() => setDeleteTargetId(null)}
              disabled={deleting}
              className="min-w-[90px]"
            >
              Cancel
            </Button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="min-w-[140px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-bold transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleting ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Deleting...</>
              ) : (
                'Delete Assessment'
              )}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default SkillEnhanceOverview;
