import React, { useEffect, useState } from 'react';
import { BookOpen, Cpu, Users, PenTool, ChevronDown, ChevronUp } from 'lucide-react';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { useProgress } from '../../hooks/useProgress';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import { ChartCard } from '../../components/analytics/ChartCard';
import { FoundationalTab } from '../../components/assessment/FoundationalTab';
import { AppliedTab } from '../../components/assessment/AppliedTab';
import { CollaborativeTab } from '../../components/assessment/CollaborativeTab';
import { ReflectiveTab } from '../../components/assessment/ReflectiveTab';
import { Button } from '../../components/ui/Button';
import { assessmentService } from '../../services/assessmentService';
import { authService } from '../../services/authService';
import { AssessmentConfiguration } from '../../components/assessment/AssessmentConfiguration';
import { SkillEnhanceWorkspace } from '../../components/assessment/SkillEnhanceWorkspace';
import { SkillEnhanceHistory } from '../../components/assessment/SkillEnhanceHistory';
import { SkillEnhanceConfig } from '../../components/assessment/SkillEnhanceConfig';
import { SkillEnhanceOverview } from '../../components/assessment/SkillEnhanceOverview';
import { QuickAssessmentParams } from '../../components/assessment/QuickAssessmentParams';
import { CountrySelect } from '../../components/assessment/CountrySelect';
import { useSkillEnhance } from '../../hooks/useSkillEnhance';
import confetti from 'canvas-confetti';
import { consentService } from '../../services/consentService';
import { ConsentModal } from '../../components/common/ConsentModal';
import { PrivacySettings } from '../../components/common/PrivacySettings';
import { validateConsentContext } from '../../utils/consentValidation';
import { ConsentConflictWarning } from '../../components/common/ConsentConflictWarning';

const SVGLineChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const padding = 35;
  const chartHeight = 160;
  const chartWidth = 500;
  
  // Map scores to chart points
  const points = data.map((d, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / Math.max(1, data.length - 1);
    const y = chartHeight - padding - (d.percentage * (chartHeight - 2 * padding)) / 100;
    return { x, y, score: d.percentage, label: d.configuration?.subject || 'Test' };
  });

  const pathD = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  return (
    <div className="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-5 rounded-2xl">
      <h4 className="text-[12.8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Performance Over Time</h4>
      <div className="relative h-[160px] w-full">
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(128,128,128,0.15)" strokeDasharray="3" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(128,128,128,0.15)" strokeDasharray="3" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(128,128,128,0.2)" />

          {/* Line Path */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="#8b5cf6"
                stroke="#fff"
                strokeWidth="2"
                className="transition-all duration-200 hover:r-7"
              />
              {/* Tooltip on hover */}
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#8b5cf6"
                fontWeight="bold"
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-black"
              >
                {p.score}%
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

const CategoryAnalysisDashboard = ({ category, history, onBack, handleViewReport, loadingReportId, onDeleteClick }) => {
  const [showAllCatHistory, setShowAllCatHistory] = useState(false);
  const catItems = history.filter(item => item.configuration?.category === category);
  
  if (catItems.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="border-b border-panel-border pb-5 flex justify-between items-center">
          <div className="text-left">
            <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/[0.04] text-slate-500 border border-slate-300 dark:border-panel-border uppercase tracking-wider mb-2 inline-block">
              {category} Competency Analysis
            </span>
            <h2 className="text-[20px] text-slate-900 dark:text-white font-bold leading-tight">No assessments completed in this category yet.</h2>
          </div>
          <Button variant="pill" onClick={onBack}>← Back to Generator</Button>
        </div>
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-8 rounded-2xl text-center flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-slate-500 dark:text-text-secondary text-[14.5px]">
            Complete a {category} assessment to start building your competency profile.
          </p>
        </div>
      </div>
    );
  }

  // 1. Overall Category Score (Average percentage)
  const totalPercentage = catItems.reduce((sum, item) => sum + item.percentage, 0);
  const overallScore = Math.round(totalPercentage / catItems.length);

  // 2. Total Assessments
  const totalAssessments = catItems.length;

  // 3. Total Questions Attempted
  const totalQuestions = catItems.reduce((sum, item) => sum + item.totalQuestions, 0);

  // 4. Correct Answers
  const correctAnswers = catItems.reduce((sum, item) => sum + item.score, 0);

  // 5. Accuracy
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  // 6. Progress / Improvement (Difference between last and first assessment)
  const lastScore = catItems[0].percentage;
  const firstScore = catItems[catItems.length - 1].percentage;
  const improvement = lastScore - firstScore;
  const improvementSign = improvement >= 0 ? `+${improvement}%` : `${improvement}%`;

  const visibleCatItems = catItems.filter(item => !item.deletedFromHistory);

  // 7. Performance over time (in chronological order, i.e., reversed visibleCatItems)
  const chronologicalItems = [...visibleCatItems].reverse();

  // 8. Difficulty Analysis
  const difficultyMap = { Easy: { score: 0, total: 0 }, Medium: { score: 0, total: 0 }, Hard: { score: 0, total: 0 } };
  catItems.forEach(item => {
    const diff = item.configuration?.difficulty || 'Medium';
    if (difficultyMap[diff]) {
      difficultyMap[diff].score += item.score;
      difficultyMap[diff].total += item.totalQuestions;
    }
  });

  // 9. Bloom's Taxonomy Analysis (aggregate from report.bloomAnalysis)
  const bloomMap = {};
  catItems.forEach(item => {
    if (item.report?.bloomAnalysis) {
      Object.entries(item.report.bloomAnalysis).forEach(([level, data]) => {
        if (!bloomMap[level]) bloomMap[level] = { correct: 0, attempted: 0 };
        bloomMap[level].correct += data.correct;
        bloomMap[level].attempted += data.attempted;
      });
    }
  });

  // 10. Strengths
  const strengths = [];
  catItems.forEach(item => {
    if (item.report?.strengths) {
      item.report.strengths.forEach(str => {
        if (!strengths.includes(str)) strengths.push(str);
      });
    }
  });

  // 11. Areas to Improve
  const weakAreas = [];
  catItems.forEach(item => {
    if (item.report?.weakAreas) {
      item.report.weakAreas.forEach(wk => {
        if (!weakAreas.includes(wk)) weakAreas.push(wk);
      });
    }
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="border-b border-panel-border pb-5 flex justify-between items-center">
        <div>
          <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 uppercase tracking-wider mb-2 inline-block">
            {category} Competency Analysis
          </span>
          <h2 className="text-[20px] text-slate-900 dark:text-white font-bold leading-tight">Detailed Performance Metrics</h2>
        </div>
        <Button variant="pill" onClick={onBack}>← Back to Generator</Button>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-4 rounded-2xl text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Overall Score</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{overallScore}%</div>
        </div>
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-4 rounded-2xl text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Assessments</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalAssessments}</div>
        </div>
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-4 rounded-2xl text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Questions</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalQuestions}</div>
        </div>
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-4 rounded-2xl text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Accuracy</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{accuracy}%</div>
        </div>
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-4 rounded-2xl text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Improvement</div>
          <div className={`text-2xl font-extrabold mt-1 ${improvement >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {improvementSign}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PERFORMANCE GRAPH */}
        <SVGLineChart data={chronologicalItems} />

        {/* DIFFICULTY ANALYSIS */}
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-5 rounded-2xl flex flex-col gap-3">
          <h4 className="text-[12.8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Difficulty Accuracy</h4>
          <div className="flex flex-col gap-3.5">
            {Object.entries(difficultyMap).map(([diff, data]) => {
              const percentage = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
              return (
                <div key={diff} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{diff}</span>
                    <span className="font-bold text-slate-500 dark:text-text-muted">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${diff === 'Easy' ? 'bg-emerald-500' : diff === 'Medium' ? 'bg-blue-500' : 'bg-rose-500'}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BLOOM PERFORMANCE */}
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-5 rounded-2xl flex flex-col gap-3">
          <h4 className="text-[12.8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bloom's Taxonomy Accuracy</h4>
          <div className="flex flex-col gap-3">
            {Object.keys(bloomMap).length > 0 ? (
              Object.entries(bloomMap).map(([level, data]) => {
                const percentage = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
                return (
                  <div key={level} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{level}</span>
                      <span className="font-bold text-slate-500 dark:text-text-muted">{percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 dark:text-text-muted text-[13px] py-4">No Bloom's taxonomy mapping available.</p>
            )}
          </div>
        </div>

        {/* STRENGTHS & AREAS TO IMPROVE */}
        <div className="flex flex-col gap-6">
          {/* STRENGTHS */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-5 rounded-2xl flex flex-col gap-3">
            <h4 className="text-[12.8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Strengths</h4>
            {strengths.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {strengths.slice(0, 4).map((str, sIdx) => (
                  <li key={sIdx} className="text-[13.5px] text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                    <span>✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-text-muted text-[13.5px]">Complete more tests to generate category-specific strengths.</p>
            )}
          </div>

          {/* AREAS TO IMPROVE */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-5 rounded-2xl flex flex-col gap-3">
            <h4 className="text-[12.8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Areas to Improve</h4>
            {weakAreas.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {weakAreas.slice(0, 4).map((wk, wIdx) => (
                  <li key={wIdx} className="text-[13.5px] text-rose-600 dark:text-rose-400 flex items-start gap-2">
                    <span>•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-text-muted text-[13.5px]">No critical areas to improve identified yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORY HISTORY */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-5 rounded-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[12.8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{category} Assessment History</h4>
          <span className="text-[11px] text-slate-400 font-medium">
            {showAllCatHistory ? visibleCatItems.length : Math.min(5, visibleCatItems.length)} of {visibleCatItems.length}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {[...visibleCatItems]
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, showAllCatHistory ? undefined : 5)
            .map((item) => (
              <div key={item._id} className="flex justify-between items-center bg-slate-200/40 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-300 dark:border-panel-border transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="font-bold text-[14px] text-slate-900 dark:text-white">
                    {item.configuration?.subject} ({item.configuration?.difficulty})
                  </div>
                  <div className="text-[11.5px] text-slate-500 dark:text-text-secondary">
                    Completed {new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-extrabold text-[15px] tabular-nums ${item.percentage >= 70 ? 'text-emerald-600 dark:text-emerald-400' : item.percentage >= 50 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>{item.percentage}%</div>
                    <div className="text-[11.5px] text-slate-500 dark:text-text-muted">{item.score} / {item.totalQuestions}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="modal"
                      size="sm"
                      disabled={loadingReportId === item._id}
                      onClick={() => handleViewReport(item._id)}
                    >
                      {loadingReportId === item._id ? 'Loading...' : 'View Report'}
                    </Button>
                    <button
                      onClick={() => onDeleteClick(item._id)}
                      title="Delete assessment"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all duration-150 shrink-0"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 13 6"/>
                        <path d="M5 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        <path d="M4 6l.8 7.2A1 1 0 005.8 14h4.4a1 1 0 00.996-.9L12 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {catItems.length > 5 && (
          <button
            onClick={() => setShowAllCatHistory(prev => !prev)}
            className="self-center flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors duration-150 py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {showAllCatHistory ? (
              <><ChevronUp size={13} strokeWidth={2.2} /> Show Less</>
            ) : (
              <><ChevronDown size={13} strokeWidth={2.2} /> Show {catItems.length - 5} More</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const {
    hasSetup,
    toastMessage,
    foundationalScore,
    setFoundationalScore,
    appliedScore,
    setAppliedScore,
    collaborativeScore,
    setCollaborativeScore,
    reflectiveScore,
    setReflectiveScore,
    activeTab,
    setActiveTab,
    eduContext,
    questions,
    configuration,
    generateAssessment,
    triggerToast,
    userName,
    setUserName,
    ageGroup,
    setAgeGroup,
    country,
    setCountry,
    profileImage,
    setProfileImage
  } = useAssessmentContext();



  const skillEnhance = useSkillEnhance(triggerToast);
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState(null); // null | 'normal' | 'skill-enhance'
  const [skillHistoryRefresh, setSkillHistoryRefresh] = useState(0);
  const [skillEnhanceConfig, setSkillEnhanceConfig] = useState({ ageGroup: ageGroup || '15–18', difficulty: 'Medium' });

  // Consent collection state and actions
  const [consentStatus, setConsentStatus] = useState(null); // null | 'granted' | 'declined'
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [consentConflict, setConsentConflict] = useState(null); // null | { status, message }


  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const res = await consentService.getConsentStatus('skill_enhancement_personalization');
        if (res?.success && res.data) {
          setConsentStatus(res.data.status);
        }
      } catch (err) {
        console.error("Failed to check consent status:", err);
      }
    };
    fetchConsent();
  }, []);

  const handleStartSkillEnhanceClick = () => {
    const validation = validateConsentContext(
      consentStatus ? { status: consentStatus, isExpired: consentStatus === 'expired', purpose: 'skill_enhancement_personalization' } : null,
      'skill_enhancement_personalization'
    );

    if (validation.isAllowed) {
      setActiveWorkspaceMode('skill-enhance-overview');
    } else {
      setConsentConflict({
        status: validation.status,
        message: validation.message
      });
      setActiveWorkspaceMode('skill-enhance-conflict');
    }
  };

  const handleConsentAllow = async () => {
    try {
      const res = await consentService.recordConsent('skill_enhancement_personalization', 'granted');
      if (res?.success) {
        setConsentStatus('granted');
        setIsConsentModalOpen(false);
        triggerToast("Personalization consent granted!");
        if (activeWorkspaceMode !== 'privacy') {
          setActiveWorkspaceMode('skill-enhance-overview');
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to save consent decision.", "error");
    }
  };

  const handleConsentDecline = async () => {
    try {
      const res = await consentService.recordConsent('skill_enhancement_personalization', 'declined');
      if (res?.success) {
        setConsentStatus('declined');
        setIsConsentModalOpen(false);
        triggerToast("Consent declined. Personalization is required for Skill Enhance.", "info");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to save consent decision.", "error");
    }
  };

  const handleToggleConsent = async () => {
    const targetStatus = consentStatus === 'granted' ? 'declined' : 'granted';
    try {
      const res = await consentService.recordConsent('skill_enhancement_personalization', targetStatus);
      if (res?.success) {
        setConsentStatus(targetStatus);
        if (targetStatus === 'granted') {
          triggerToast("Personalization consent granted! You can now use Skill Enhance.");
        } else {
          triggerToast("Personalization consent withdrawn.", "info");
          if (activeWorkspaceMode && activeWorkspaceMode.startsWith('skill-enhance')) {
            setActiveWorkspaceMode(null);
            skillEnhance.resetSession();
          }
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to update consent decision.", "error");
    }
  };

  const handleManageConsentClick = () => {
    if (consentStatus === 'expired') {
      setIsConsentModalOpen(true);
    } else {
      handleToggleConsent();
    }
  };

  useEffect(() => {
    if (ageGroup) {
      setSkillEnhanceConfig(prev => ({ ...prev, ageGroup }));
    }
  }, [ageGroup]);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editAgeGroup, setEditAgeGroup] = useState(ageGroup);
  const [editCountry, setEditCountry] = useState(country || { name: 'India', code: 'IN' });
  const [editProfileImage, setEditProfileImage] = useState(profileImage || '');
  const [profileSaving, setProfileSaving] = useState(false);

  const SUPPORTED_PROFILE_COUNTRIES = [
    { name: 'South Korea', code: 'KR' },
    { name: 'Japan', code: 'JP' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Slovenia', code: 'SI' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Germany', code: 'DE' },
    { name: 'Finland', code: 'FI' },
    { name: 'Norway', code: 'NO' },
    { name: 'Ireland', code: 'IE' },
    { name: 'Singapore', code: 'SG' },
    { name: 'France', code: 'FR' },
    { name: 'China', code: 'CN' },
    { name: 'Hong Kong', code: 'HK' },
    { name: 'Sweden', code: 'SE' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Australia', code: 'AU' },
    { name: 'Iceland', code: 'IS' },
    { name: 'Canada', code: 'CA' },
    { name: 'India', code: 'IN' },
    { name: 'Spain', code: 'ES' },
    { name: 'IB Model', code: 'UN' },
    { name: 'UN SDG 4', code: 'UN' }
  ];

  const renderFlagImage = (code, className = "w-5 h-3.5 object-cover rounded-sm shadow-sm inline-block") => {
    if (!code) return null;
    const lowerCode = code.toLowerCase();
    const url = lowerCode === 'un' 
      ? 'https://flagcdn.com/w40/un.png' 
      : `https://flagcdn.com/w40/${lowerCode}.png`;
    return (
      <img 
        src={url} 
        alt={code} 
        className={className} 
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await authService.updateProfile({
        name: editName,
        ageGroup: editAgeGroup,
        country: editCountry,
        profileImage: editProfileImage
      });
      if (res.success) {
        setUserName(res.user.name);
        setAgeGroup(res.user.ageGroup);
        setCountry(res.user.country);
        setProfileImage(res.user.profileImage);
        
        const session = JSON.parse(localStorage.getItem('spark_session')) || {};
        session.userName = res.user.name;
        session.ageGroup = res.user.ageGroup;
        session.country = res.user.country;
        session.profileImage = res.user.profileImage;
        localStorage.setItem('spark_session', JSON.stringify(session));

        triggerToast("Profile updated successfully.");
        setShowEditProfile(false);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to update profile.", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleOpenEditProfile = () => {
    setEditName(userName);
    setEditAgeGroup(ageGroup);
    setEditCountry(country || { name: 'India', code: 'IN' });
    setEditProfileImage(profileImage || '');
    setShowEditProfile(true);
  };

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [selectedHistoryReport, setSelectedHistoryReport] = useState(null);
  const [loadingReportId, setLoadingReportId] = useState(null);
  const [selectedHistoryTab, setSelectedHistoryTab] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showAllAssessmentHistory, setShowAllAssessmentHistory] = useState(false);

  const { totalMasteryScore, anxietyIndex, rippleNodes } = useProgress({
    foundationalScore,
    appliedScore,
    collaborativeScore,
    reflectiveScore,
    history
  }, eduContext);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      const res = await assessmentService.deleteAssessment(deleteTargetId);
      if (res.success) {
        setHistory(prev => prev.map(item => item._id === deleteTargetId ? { ...item, deletedFromHistory: true } : item));
        triggerToast("Assessment deleted successfully.");
      } else {
        throw new Error(res.message || "Failed to delete assessment");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Unable to delete assessment.", "error");
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const res = await assessmentService.getMyAssessments();
        if (res.success) {
          setHistory(res.data);
        }
        
        // Fetch and map mastery values
        const masteryRes = await assessmentService.getMyMastery();
        if (masteryRes.success && masteryRes.data) {
          const { foundational, applied, collaborative, reflective } = masteryRes.data;
          setFoundationalScore(foundational * 0.40);
          setAppliedScore(applied * 0.30);
          setCollaborativeScore(collaborative * 0.20);
          setReflectiveScore(reflective * 0.10);
        }
      } catch (err) {
        console.error('Failed to load history or mastery', err);
        const errMsg = err.response?.data?.message || "Unable to load assessment history.";
        setHistoryError(errMsg);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleViewReport = async (id) => {
    setLoadingReportId(id);
    try {
      const res = await assessmentService.getAssessmentById(id);
      if (res.success) {
        setSelectedHistoryReport(res.data);
      }
    } catch (err) {
      console.error('Failed to load report details', err);
    } finally {
      setLoadingReportId(null);
    }
  };

  useEffect(() => {
    if (hasSetup && totalMasteryScore >= 95) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [totalMasteryScore, hasSetup]);

  if (!hasSetup) return null;

  return (
    <div className="w-full min-h-screen flex flex-col font-body bg-[#F5F7FA] dark:bg-[#080B12] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {toastMessage && (
        <div className="fixed inset-0 bg-transparent pointer-events-none z-[99999] flex items-start justify-center pt-20 px-6">
          <div className="bg-white dark:bg-[#101522] border border-slate-200 dark:border-[#1e293b] shadow-lg px-5 py-3 rounded-xl max-w-[400px] flex items-center gap-3 pointer-events-auto animate-slide-up">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-[13.5px] font-semibold text-slate-800 dark:text-white">{toastMessage}</p>
          </div>
        </div>
      )}

      <Header />

      <main className="max-w-[1400px] w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 md:gap-7 grow">
        <Sidebar 
          onEditProfile={handleOpenEditProfile} 
          onPrivacyClick={() => setActiveWorkspaceMode('privacy')} 
        />

        <div className="flex flex-col gap-6 w-full">
          {(() => {
            const activeHighlight = questions.length > 0 ? configuration?.category : selectedHistoryTab;
            return (
              <nav className={`grid grid-cols-4 bg-white dark:bg-[#101522] p-1 rounded-xl border border-slate-200 dark:border-[#1e293b] print:hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors duration-300 ${questions.length > 0 ? 'pointer-events-none' : ''}`}>
                <button 
                  onClick={() => setSelectedHistoryTab(selectedHistoryTab === 'Foundational' ? null : 'Foundational')}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[12px] font-semibold rounded-lg transition-all duration-150 ${activeHighlight === 'Foundational' ? 'bg-[#EFF6FF] dark:bg-blue-500/10 text-[#1E3A8A] dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <BookOpen size={15} />
                  <span>Foundational</span>
                </button>

                <button 
                  onClick={() => setSelectedHistoryTab(selectedHistoryTab === 'Applied' ? null : 'Applied')}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[12px] font-semibold rounded-lg transition-all duration-150 ${activeHighlight === 'Applied' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <Cpu size={15} />
                  <span>Applied</span>
                </button>

                <button 
                  onClick={() => setSelectedHistoryTab(selectedHistoryTab === 'Collaborative' ? null : 'Collaborative')}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[12px] font-semibold rounded-lg transition-all duration-150 ${activeHighlight === 'Collaborative' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <Users size={15} />
                  <span>Collaborative</span>
                </button>

                <button 
                  onClick={() => setSelectedHistoryTab(selectedHistoryTab === 'Reflective' ? null : 'Reflective')}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[12px] font-semibold rounded-lg transition-all duration-150 ${activeHighlight === 'Reflective' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <PenTool size={15} />
                  <span>Reflective</span>
                </button>
              </nav>
            );
          })()}

          {questions.length > 0 ? (
            <DashboardCard className="min-h-[380px]">
              <FoundationalTab />
            </DashboardCard>
          ) : activeWorkspaceMode === 'privacy' ? (
            <DashboardCard className="min-h-[380px] !p-4 sm:!p-6">
              <div className="flex justify-between items-center mb-4 px-1 sm:px-0">
                <Button 
                  variant="pill" 
                  onClick={() => setActiveWorkspaceMode(null)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl text-[13px] font-bold shadow-sm flex items-center justify-center"
                >
                  ← Back to Entry Options
                </Button>
              </div>
              <PrivacySettings 
                triggerToast={triggerToast}
                onTriggerConsentModal={() => setIsConsentModalOpen(true)}
                consentStatus={consentStatus}
                setConsentStatus={setConsentStatus}
              />
            </DashboardCard>
          ) : activeWorkspaceMode === 'skill-enhance-conflict' ? (
            <DashboardCard className="min-h-[380px]">
              <ConsentConflictWarning 
                status={consentConflict?.status}
                message={consentConflict?.message}
                onReviewConsent={() => setIsConsentModalOpen(true)}
                onContinueWithoutPersonalization={() => {
                  setActiveWorkspaceMode('skill-enhance-overview');
                }}
                onBack={() => setActiveWorkspaceMode(null)}
              />
            </DashboardCard>
          ) : activeWorkspaceMode === 'skill-enhance' ? (
            <DashboardCard className="min-h-[380px]">
              <SkillEnhanceWorkspace 
                {...skillEnhance}
                onFinish={() => {
                  skillEnhance.resetSession();
                  setActiveWorkspaceMode(null);
                  setSkillHistoryRefresh(prev => prev + 1);
                }}
                onManageConsent={() => {
                  skillEnhance.resetSession();
                  setActiveWorkspaceMode('privacy');
                }}
              />
            </DashboardCard>
          ) : selectedHistoryTab ? (
            <DashboardCard className="min-h-[380px]">
              <CategoryAnalysisDashboard 
                category={selectedHistoryTab} 
                history={history} 
                onBack={() => setSelectedHistoryTab(null)} 
                handleViewReport={handleViewReport} 
                loadingReportId={loadingReportId} 
                onDeleteClick={setDeleteTargetId}
              />
            </DashboardCard>
          ) : activeWorkspaceMode === 'skill-enhance-overview' ? (
            <DashboardCard className="min-h-[380px]">
              <SkillEnhanceOverview 
                initialConfig={skillEnhanceConfig}
                onStart={(config) => {
                  setSkillEnhanceConfig(config);
                  setActiveWorkspaceMode('skill-enhance');
                  skillEnhance.startSkillEnhance(config.ageGroup, config.difficulty);
                }}
                onBack={() => setActiveWorkspaceMode(null)}
                onSelectReport={(report) => setSelectedHistoryReport(report)}
                consentStatus={consentStatus}
                onManageConsent={() => setActiveWorkspaceMode('privacy')}
                onShowParams={() => setActiveWorkspaceMode('skill-enhance-params')}
              />
            </DashboardCard>
          ) : activeWorkspaceMode === 'skill-enhance-params' ? (
            <DashboardCard className="min-h-[380px]">
              <QuickAssessmentParams
                initialConfig={skillEnhanceConfig}
                onStart={(config) => {
                  setSkillEnhanceConfig(config);
                  setActiveWorkspaceMode('skill-enhance');
                  skillEnhance.startSkillEnhance(config.ageGroup, config.difficulty);
                }}
                onBack={() => setActiveWorkspaceMode('skill-enhance-overview')}
              />
            </DashboardCard>
          ) : activeWorkspaceMode === 'skill-enhance-config' ? (
            <DashboardCard className="min-h-[380px]">
              <SkillEnhanceConfig 
                onGenerate={(config) => {
                  setSkillEnhanceConfig(config);
                  setActiveWorkspaceMode('skill-enhance-overview');
                }}
                onBack={() => setActiveWorkspaceMode(null)}
              />
            </DashboardCard>
          ) : activeWorkspaceMode === 'normal' ? (
            <DashboardCard className="min-h-[380px]">
              <div className="flex justify-between items-center mb-4">
                <Button variant="pill" onClick={() => setActiveWorkspaceMode(null)}>← Back to Entry Options</Button>
              </div>
              <AssessmentConfiguration onGenerate={generateAssessment} />
            </DashboardCard>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:hidden">
                {/* Normal Assessment Card */}
                <DashboardCard className="flex flex-col justify-between p-6 text-left hover:border-[#1E3A8A]/30 dark:hover:border-blue-500/25 transition-all duration-200 group">
                  <div className="flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
                      <BookOpen size={18} className="text-[#1E3A8A] dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-[15.5px] font-bold text-slate-900 dark:text-white mb-1.5">Normal Assessment</h3>
                      <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Build competency through structured assessment, selecting customized subjects, categories, and frameworks.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <Button variant="pill-primary" className="w-fit" onClick={() => setActiveWorkspaceMode('normal')}>
                      Start Assessment →
                    </Button>
                  </div>
                </DashboardCard>

                {/* Skill Enhance Card */}
                <DashboardCard className="flex flex-col justify-between p-6 text-left hover:border-amber-300/50 dark:hover:border-amber-500/25 transition-all duration-200 group">
                  <div className="flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#D97706" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[15.5px] font-bold text-slate-900 dark:text-white mb-1.5">Skill Enhance</h3>
                      <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Explore randomized questions across diverse academic subjects and global educational contexts.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <Button variant="pill-primary" className="w-fit" onClick={handleStartSkillEnhanceClick}>
                      Start Skill Enhance →
                    </Button>
                    {consentStatus && (() => {
                        const isGranted  = consentStatus === 'granted';
                        const isExpired  = consentStatus === 'expired';
                        const label      = isGranted ? 'Withdraw Personalization'
                                         : isExpired ? 'Review Personalization'
                                         : 'Enable Personalization';
                        const base = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold border transition-all duration-150 cursor-pointer";
                        const style = isGranted
                          ? `${base} text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 dark:text-amber-400 dark:border-amber-500/40 dark:bg-amber-500/10 dark:hover:bg-amber-500/20`
                          : `${base} text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 dark:text-blue-400 dark:border-blue-500/40 dark:bg-blue-500/10 dark:hover:bg-blue-500/20`;
                        return (
                          <button onClick={handleManageConsentClick} className={style}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isGranted ? 'bg-amber-500' : 'bg-blue-500'}`} />
                            {label}
                          </button>
                        );
                      })()
                    }
                  </div>
                </DashboardCard>
              </div>

              {/* Assessment History Section */}
              <DashboardCard className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">Assessment History</h3>
                  {history.filter(item => !item.deletedFromHistory).length > 0 && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {showAllAssessmentHistory ? history.filter(item => !item.deletedFromHistory).length : Math.min(5, history.filter(item => !item.deletedFromHistory).length)} of {history.filter(item => !item.deletedFromHistory).length}
                    </span>
                  )}
                </div>

                {historyLoading ? (
                  <p className="text-[13px] text-slate-400 dark:text-slate-500 py-2">Loading history...</p>
                ) : historyError ? (
                  <p className="text-[13px] text-rose-500">{historyError}</p>
                ) : history.filter(item => !item.deletedFromHistory).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                      <BookOpen size={18} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-slate-600 dark:text-slate-400">No assessments yet</p>
                      <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">Complete your first assessment to see your history.</p>
                    </div>
                  </div>
                ) : (() => {
                  // Flatten all items sorted newest→oldest, then apply limit
                  const nonDeleted = history.filter(item => !item.deletedFromHistory);
                  const sorted = [...nonDeleted].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                  const visible = showAllAssessmentHistory ? sorted : sorted.slice(0, 5);
                  // Re-group visible items by category
                  const catColors = {
                    Foundational: 'text-[#1E3A8A] dark:text-blue-400',
                    Applied: 'text-emerald-700 dark:text-emerald-400',
                    Collaborative: 'text-indigo-700 dark:text-indigo-400',
                    Reflective: 'text-amber-700 dark:text-amber-500'
                  };
                  const grouped = {};
                  visible.forEach(item => {
                    const cat = item.configuration?.category || 'Other';
                    if (!grouped[cat]) grouped[cat] = [];
                    grouped[cat].push(item);
                  });
                  return (
                    <>
                      <div className="flex flex-col gap-5">
                        {Object.entries(grouped).map(([catName, catItems]) => (
                          <div key={catName} className="flex flex-col gap-1 text-left">
                            <div className={`text-[10.5px] font-bold uppercase tracking-[0.1em] pb-2 border-b border-slate-100 dark:border-[#1e293b] mb-1 ${catColors[catName] || 'text-slate-500'}`}>
                              {catName}
                            </div>
                            <div className="flex flex-col divide-y divide-slate-100 dark:divide-[#1e293b]">
                              {catItems.map((item) => (
                                <div key={item._id} className="flex justify-between items-center py-3 hover:bg-slate-50 dark:hover:bg-white/[0.015] px-1 rounded-lg transition-colors duration-100">
                                  <div className="flex flex-col gap-0.5 text-left">
                                    <div className="font-semibold text-[13.5px] text-slate-900 dark:text-white">
                                      {item.configuration?.subject}
                                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal ml-1.5">({item.configuration?.difficulty})</span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                      {new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className={`font-bold text-[15px] tabular-nums ${item.percentage >= 70 ? 'text-emerald-600 dark:text-emerald-400' : item.percentage >= 50 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                        {item.percentage}%
                                      </div>
                                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                        {item.score} / {item.totalQuestions}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="modal"
                                        size="sm"
                                        disabled={loadingReportId === item._id}
                                        onClick={() => handleViewReport(item._id)}
                                      >
                                        {loadingReportId === item._id ? 'Loading...' : 'View Report'}
                                      </Button>
                                      <button
                                        onClick={() => setDeleteTargetId(item._id)}
                                        title="Delete assessment"
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all duration-150 shrink-0"
                                      >
                                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="3 6 13 6"/>
                                          <path d="M5 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                                          <path d="M4 6l.8 7.2A1 1 0 005.8 14h4.4a1 1 0 00.996-.9L12 6"/>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {history.length > 5 && (
                        <button
                          onClick={() => setShowAllAssessmentHistory(prev => !prev)}
                          className="self-center flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors duration-150 py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                          {showAllAssessmentHistory ? (
                            <><ChevronUp size={13} strokeWidth={2.2} /> Show Less</>
                          ) : (
                            <><ChevronDown size={13} strokeWidth={2.2} /> Show {history.length - 5} More</>
                          )}
                        </button>
                      )}
                    </>
                  );
                })()}
              </DashboardCard>

              {/* Skill Enhance History Section */}
              <DashboardCard className="flex flex-col gap-3">
                <SkillEnhanceHistory
                  triggerToast={triggerToast}
                  onSelectReport={(report) => setSelectedHistoryReport(report)}
                  refreshTrigger={skillHistoryRefresh}
                />
              </DashboardCard>
            </>
          )}

          <DashboardCard className="flex flex-col gap-5">
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-4">System Outcomes &amp; Expected Impact</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <AnalyticsCard
                  label="DEEPER UNDERSTANDING"
                  value="Competency Growth"
                  colorClass="text-[#1E3A8A] dark:text-blue-400"
                />
                <AnalyticsCard
                  label="PERSONALIZED ASSESSMENT"
                  value="Adaptive"
                  colorClass="text-emerald-700 dark:text-emerald-400"
                />
                <AnalyticsCard
                  label="TARGETED IMPROVEMENT"
                  value="Skill Development"
                  colorClass="text-indigo-700 dark:text-indigo-400"
                />
                <AnalyticsCard
                  label="REAL-WORLD COMPETENCY"
                  value="Global Readiness"
                  colorClass="text-amber-700 dark:text-amber-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-[#1e293b] pt-4">
              <ChartCard rippleNodes={rippleNodes} />
            </div>
          </DashboardCard>

          <Footer />
        </div>
      </main>

      {selectedHistoryReport && (() => {
        const isSkillEnhanceReport = !selectedHistoryReport.configuration;
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-[1200] flex items-center justify-center p-4">
            <div className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-2xl w-full p-6 shadow-2xl animate-fade-in relative max-h-[88vh] overflow-y-auto ${isSkillEnhanceReport ? 'max-w-[1000px]' : 'max-w-[600px]'}`}>
              <button 
                onClick={() => setSelectedHistoryReport(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer text-sm font-bold z-[1250]"
              >
                ✕
              </button>
              
              {isSkillEnhanceReport ? (
                <SkillEnhanceWorkspace
                  questions={selectedHistoryReport.questions}
                  answeredQuestions={(() => {
                    const answersMap = {};
                    selectedHistoryReport.answers.forEach((ans) => {
                      const qIdx = selectedHistoryReport.questions.findIndex(q => q.questionId === ans.questionId);
                      if (qIdx !== -1) {
                        answersMap[qIdx] = {
                          isCorrect: ans.isCorrect,
                          selectedAnswer: ans.selectedAnswer
                        };
                      }
                    });
                    return answersMap;
                  })()}
                  score={selectedHistoryReport.score}
                  sessionComplete={true}
                  sessionResult={selectedHistoryReport}
                  onFinish={() => setSelectedHistoryReport(null)}
                  onManageConsent={() => {
                    setSelectedHistoryReport(null);
                    setActiveWorkspaceMode('privacy');
                  }}
                />
              ) : (
                <div className="text-left flex flex-col gap-6">
                  <div className="border-b border-slate-200 dark:border-panel-border pb-4 pr-8">
                    <h3 className="text-[16px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {selectedHistoryReport.configuration?.subject} Report
                    </h3>
                    <p className="text-[12px] text-slate-500 dark:text-text-muted mt-1">
                      {selectedHistoryReport.configuration?.category} • {new Date(selectedHistoryReport.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* OVERALL PERFORMANCE */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center bg-white dark:bg-white/[0.04] p-4 rounded-xl border border-slate-200 dark:border-panel-border">
                    <div>
                      <div className="text-[11px] text-text-muted font-bold uppercase">Score</div>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {selectedHistoryReport.score} / {selectedHistoryReport.totalQuestions}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted font-bold uppercase">Percentage</div>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {selectedHistoryReport.percentage}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted font-bold uppercase">Rating</div>
                      <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                        {selectedHistoryReport.percentage >= 90 ? 'Excellent' :
                         selectedHistoryReport.percentage >= 75 ? 'Strong' :
                         selectedHistoryReport.percentage >= 60 ? 'Developing' : 'Needs Improvement'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted font-bold uppercase">Category</div>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {selectedHistoryReport.configuration?.category}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted font-bold uppercase">Weight</div>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {selectedHistoryReport.configuration?.category === 'Foundational' ? '40%' : selectedHistoryReport.configuration?.category === 'Applied' ? '30%' : selectedHistoryReport.configuration?.category === 'Collaborative' ? '20%' : '10%'}
                      </div>
                    </div>
                  </div>

                  {/* STRENGTHS */}
                  {selectedHistoryReport.report?.strengths?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Strengths</h4>
                      <ul className="flex flex-col gap-1.5">
                        {selectedHistoryReport.report.strengths.map((str, sIdx) => (
                          <li key={sIdx} className="text-[13.5px] text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                            <span>✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* WEAK AREAS */}
                  {selectedHistoryReport.report?.weakAreas?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Areas To Improve</h4>
                      <ul className="flex flex-col gap-1.5">
                        {selectedHistoryReport.report.weakAreas.map((wk, wIdx) => (
                          <li key={wIdx} className="text-[13.5px] text-rose-600 dark:text-rose-400 flex items-start gap-2">
                            <span>•</span>
                            <span>{wk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* BLOOM PERFORMANCE */}
                  {selectedHistoryReport.report?.bloomAnalysis && Object.keys(selectedHistoryReport.report.bloomAnalysis).length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bloom's Taxonomy Performance</h4>
                      <div className="flex flex-col gap-3">
                        {Object.entries(selectedHistoryReport.report.bloomAnalysis).map(([level, data]) => (
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
                  {selectedHistoryReport.report?.categoryAnalysis && Object.keys(selectedHistoryReport.report.categoryAnalysis).length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category Performance</h4>
                      <div className="flex flex-col gap-3">
                        {Object.entries(selectedHistoryReport.report.categoryAnalysis).map(([cat, data]) => (
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
                  {selectedHistoryReport.report?.difficultyAnalysis && Object.keys(selectedHistoryReport.report.difficultyAnalysis).length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Difficulty Performance</h4>
                      <div className="flex flex-col gap-3">
                        {Object.entries(selectedHistoryReport.report.difficultyAnalysis).map(([diff, data]) => (
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
                  {selectedHistoryReport.report?.recommendations?.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Personalized Recommendations</h4>
                      <div className="flex flex-col gap-4">
                        {selectedHistoryReport.report.recommendations.map((rec, rIdx) => (
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
                  {selectedHistoryReport.report?.suggestedTopics?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suggested Next Topics</h4>
                      <ul className="flex flex-col gap-1.5">
                        {selectedHistoryReport.report.suggestedTopics.map((top, tIdx) => (
                          <li key={tIdx} className="text-[13.5px] text-slate-700 dark:text-text-secondary flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span>{top}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                   {/* PERFORMANCE SUMMARY */}
                  {selectedHistoryReport.report?.summary && (
                    <div className="flex flex-col gap-2 bg-white dark:bg-white/[0.04] p-5 rounded-xl border border-slate-200 dark:border-panel-border">
                      <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Performance Summary</h4>
                      <p className="text-[13.5px] text-slate-700 dark:text-text-secondary leading-relaxed">{selectedHistoryReport.report.summary}</p>
                    </div>
                  )}

                  {/* ASSESSMENT QUESTIONS & ANSWERS */}
                  {selectedHistoryReport.questions?.length > 0 && (
                    <div className="flex flex-col gap-4 mt-6 border-t border-slate-200 dark:border-panel-border pt-6">
                      <h4 className="text-[14px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Assessment Questions & Answers</h4>
                      <div className="flex flex-col gap-3">
                        {selectedHistoryReport.questions.map((q, qIdx) => {
                          const ans = selectedHistoryReport.answers?.find(a => a.questionId === q.questionId) || {};
                          const isCorrect = ans.isCorrect === true;
                          return (
                            <div key={qIdx} className="bg-white dark:bg-white/[0.04] p-5 rounded-2xl border border-slate-200 dark:border-panel-border flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                  <span className="text-[11px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold uppercase">
                                    {q.bloomLevel || q.taxonomy || 'Bloom'}
                                  </span>
                                  <span className="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase">
                                    {q.questionType}
                                  </span>
                                </div>
                                <span className={`flex items-center gap-1 text-[12px] font-bold ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {isCorrect ? '✓ Correct' : '✕ Incorrect'}
                                </span>
                              </div>
                              <p className="font-semibold text-[14px] text-slate-900 dark:text-white leading-relaxed">{q.question}</p>
                              
                              {/* Render MCQ options if they exist */}
                              {q.options && q.options.length > 0 && (
                                <div className="flex flex-col gap-1.5 my-1">
                                  {q.options.map((opt, optIdx) => {
                                    const isSelected = opt === ans.selectedAnswer;
                                    const isActualCorrect = opt === q.correctAnswer;
                                    return (
                                      <div 
                                        key={optIdx} 
                                        className={`p-2.5 rounded-xl border text-[13px] transition-all duration-200 ${isSelected ? (isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold') : opt === q.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold' : 'bg-slate-100 dark:bg-white/[0.01] border-slate-200 dark:border-panel-border text-slate-700 dark:text-text-secondary'}`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span>{opt}</span>
                                          {isSelected && <span className="text-[10px] font-bold uppercase tracking-wider">{isCorrect ? 'Chosen Correct Answer' : 'Your Answer'}</span>}
                                          {!isSelected && opt === q.correctAnswer && <span className="text-[10px] font-bold uppercase tracking-wider">Correct Answer</span>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {ans.reasoning && (
                                <div className="bg-slate-50 dark:bg-white/[0.03] border-l-[3px] border-l-[#1E3A8A] dark:border-l-blue-500 p-4 rounded-r-xl text-[13px] text-slate-700 dark:text-slate-300 mt-1">
                                  <strong>Explanation:</strong> {ans.reasoning || q.explanation}
                                  
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
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-[1300] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-2xl max-w-[400px] w-full p-6 shadow-2xl animate-fade-in relative text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-rose-500" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-slate-900 dark:text-white mb-2">Delete Assessment?</h3>
            <p className="text-[13.5px] text-slate-500 dark:text-text-muted mb-6 leading-relaxed">
              Are you sure you want to permanently delete this assessment? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="modal" 
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="modal-primary" 
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="!bg-rose-600 hover:!bg-rose-700 !text-white border-none font-semibold"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-[1300] flex items-center justify-center p-4">
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-2xl max-w-[450px] w-full p-6 shadow-2xl animate-fade-in relative text-left flex flex-col gap-4">
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Profile Settings</h3>
            
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3 my-2">
              <div className="relative">
                {editProfileImage ? (
                  <img src={editProfileImage} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-white/10 shadow-sm" />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-[28px] font-bold text-white uppercase"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {editName.charAt(0) || 'A'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-[#1E3A8A] hover:bg-blue-700 text-white rounded-full p-1.5 cursor-pointer shadow-lg flex items-center justify-center w-7 h-7 text-[12px] transition-colors">
                  📷
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <span className="text-[11.5px] text-slate-500">Click camera icon to change photo</span>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-500 dark:text-text-secondary uppercase tracking-wider font-semibold">Name</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-[#1e293b] px-4 py-2.5 rounded-xl text-[14px] text-slate-900 dark:text-white outline-none focus:border-[#1E3A8A] dark:focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Age Group */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-500 dark:text-text-secondary uppercase tracking-wider font-semibold">Age Group</label>
              <select
                value={editAgeGroup}
                onChange={(e) => setEditAgeGroup(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-[#1e293b] px-4 py-2.5 rounded-xl text-[14px] text-slate-900 dark:text-white outline-none focus:border-[#1E3A8A] dark:focus:border-blue-500 transition-colors"
              >
                <option value="6–10" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">6–10</option>
                <option value="11–14" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">11–14</option>
                <option value="15–18" className="bg-white dark:bg-[#1a1b26] text-slate-900 dark:text-slate-100">15–18</option>
              </select>
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-500 dark:text-text-secondary uppercase tracking-wider font-semibold">Country</label>
              <CountrySelect 
                value={editCountry.code}
                onChange={(selected) => setEditCountry(selected)}
                countries={SUPPORTED_PROFILE_COUNTRIES}
              />
            </div>

            <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-[#1e293b] pt-5 mt-4">
              <Button variant="modal" type="button" onClick={() => setShowEditProfile(false)} disabled={profileSaving}>
                Cancel
              </Button>
              <Button variant="modal-primary" type="submit" disabled={profileSaving}>
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Consent collection Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onAllow={handleConsentAllow}
        onDecline={handleConsentDecline}
        purposeText={consentStatus === 'expired' ? "⚠️ Your consent for personalized learning has expired. Please grant fresh consent to continue personalizing your learning experience and recommendations." : ""}
      />
    </div>
  );
};
export default Dashboard;
