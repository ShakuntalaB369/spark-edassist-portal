import React from 'react';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { useProgress } from '../../hooks/useProgress';
import { DashboardCard } from '../dashboard/DashboardCard';
import { MasteryCard } from '../dashboard/MasteryCard';
import { ProgressCard } from '../dashboard/ProgressCard';
import questionsData from '../../data/questions.json';
import { Target, Pencil, ShieldCheck } from 'lucide-react';

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
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
};

export const Sidebar = ({ onEditProfile, onPrivacyClick }) => {
  const {
    userName,
    ageGroup,
    eduContext,
    foundationalScore,
    appliedScore,
    collaborativeScore,
    reflectiveScore,
    activeTab,
    setActiveTab,
    country,
    profileImage
  } = useAssessmentContext();

  const { totalMasteryScore, contextAdvice } = useProgress({
    foundationalScore,
    appliedScore,
    collaborativeScore,
    reflectiveScore
  }, eduContext);

  return (
    <div className="flex flex-col gap-5 w-full lg:w-[360px] shrink-0 print:hidden">
      {/* Profile Card */}
      <DashboardCard className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {profileImage ? (
            <img src={profileImage} alt={userName} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-white/10 shadow-sm" />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold text-white uppercase shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {userName.charAt(0)}
            </div>
          )}
          <div className="text-left min-w-0">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug truncate">{userName}</h3>
            <div className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
              Age Group: <span className="font-semibold text-slate-700 dark:text-slate-200">{ageGroup}</span>
            </div>
            {country?.name && (
              <div className="flex items-center gap-1.5 mt-1">
                {renderFlagImage(country.code, "w-4 h-3 object-cover rounded-sm shadow-sm")}
                <span className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium">{country.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Edit Profile icon */}
          <button
            onClick={onEditProfile}
            title="Edit Profile"
            className="w-8 h-8 rounded-xl flex items-center justify-center
              bg-blue-50 dark:bg-blue-500/10
              border border-blue-100 dark:border-blue-500/20
              text-[#1E3A8A] dark:text-blue-400
              hover:bg-blue-100 dark:hover:bg-blue-500/20
              hover:border-blue-200 dark:hover:border-blue-400/30
              hover:shadow-sm
              transition-all duration-150 cursor-pointer shrink-0"
          >
            <Pencil size={15} strokeWidth={2} />
          </button>

          {/* Privacy & Consent icon */}
          <button
            onClick={onPrivacyClick}
            title="Privacy & Consent Settings"
            className="w-8 h-8 rounded-xl flex items-center justify-center
              bg-indigo-50 dark:bg-indigo-500/10
              border border-indigo-100 dark:border-indigo-500/20
              text-indigo-700 dark:text-indigo-400
              hover:bg-indigo-100 dark:hover:bg-indigo-500/20
              hover:border-indigo-200 dark:hover:border-indigo-400/30
              hover:shadow-sm
              transition-all duration-150 cursor-pointer shrink-0"
          >
            <ShieldCheck size={15} strokeWidth={2} />
          </button>
        </div>

      </DashboardCard>

      {/* Mastery Framework Card */}
      <DashboardCard className="flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">
            Mastery Framework
          </h3>
        </div>

        <MasteryCard
          scores={{ foundationalScore, appliedScore, collaborativeScore, reflectiveScore }}
          totalScore={totalMasteryScore}
        />

        <div className="flex flex-col gap-2 mt-3">
          <ProgressCard
            title="Foundational"
            weight={40}
            score={foundationalScore}
            maxScore={40}
            colorClass="#1E3A8A"
            isActive={activeTab === 'foundational'}
            onClick={() => setActiveTab('foundational')}
          />
          <ProgressCard
            title="Applied"
            weight={30}
            score={appliedScore}
            maxScore={30}
            colorClass="#059669"
            isActive={activeTab === 'applied'}
            onClick={() => setActiveTab('applied')}
          />
          <ProgressCard
            title="Collaborative"
            weight={20}
            score={collaborativeScore}
            maxScore={20}
            colorClass="#6366F1"
            isActive={activeTab === 'collaborative'}
            onClick={() => setActiveTab('collaborative')}
          />
          <ProgressCard
            title="Reflective"
            weight={10}
            score={reflectiveScore}
            maxScore={10}
            colorClass="#D97706"
            isActive={activeTab === 'reflective'}
            onClick={() => setActiveTab('reflective')}
          />
        </div>
      </DashboardCard>

      {/* Context Card */}
      <DashboardCard className="p-4 border-l-[3px]" style={{ borderLeftColor: 'var(--success)' }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Target size={15} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-snug mb-1">{contextAdvice.title}</h4>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">{contextAdvice.tagline}</p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};
