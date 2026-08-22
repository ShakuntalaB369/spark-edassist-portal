import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import questionsData from '../../data/questions.json';

export const AssessmentConfig = () => {
  const {
    userName,
    setUserName,
    ageGroup,
    setAgeGroup,
    eduContext,
    setEduContext,
    setHasSetup,
    triggerToast
  } = useAssessmentContext();

  const navigate = useNavigate();

  const handleSetupSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      triggerToast("Please enter a name to configure your profile.");
      return;
    }
    setHasSetup(true);
    const ageTitle = questionsData.AGE_GROUPS.find(a => a.id === ageGroup)?.title || '';
    triggerToast(`Welcome ${userName}! SPARK Portal loaded with ${ageTitle} framework.`);
    navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-body"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Faint grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #94A3B8 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div
        className="w-full max-w-[660px] rounded-2xl p-8 md:p-10 border shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] relative z-10 text-left animate-fade-in"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Branding */}
        <div className="flex items-center gap-2.5 mb-7">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-heading font-bold text-[15px] tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>SPARK</div>
            <div className="text-[10px] font-semibold tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--text-secondary)' }}>EdAssist Framework</div>
          </div>
        </div>

        <h1 className="text-[24px] font-heading font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Set Up Your Profile
        </h1>
        <p className="text-[13.5px] mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Configure your learning profile to receive a personalized, competency-based assessment experience.
        </p>

        <form onSubmit={handleSetupSubmit} className="flex flex-col gap-6">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-secondary)' }}>
              Student Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Alex Rivera"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          {/* Age Group */}
          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-secondary)' }}>
              Age &amp; Implementation Stage
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {questionsData.AGE_GROUPS.map(age => (
                <div
                  key={age.id}
                  className="p-4 rounded-xl border cursor-pointer transition-all duration-150 text-center flex flex-col items-center justify-center gap-1 hover:border-[var(--primary)]"
                  style={{
                    backgroundColor: ageGroup === age.id ? 'var(--background)' : 'transparent',
                    borderColor: ageGroup === age.id ? 'var(--primary)' : 'var(--border)',
                    boxShadow: ageGroup === age.id ? '0 0 0 1px var(--primary)' : 'none',
                  }}
                  onClick={() => setAgeGroup(age.id)}
                >
                  <span className="font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>{age.title}</span>
                  <span className="text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>{age.subtitle}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Context */}
          <div className="flex flex-col gap-2">
            <label className="text-[11.5px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-secondary)' }}>
              Global Educational Context
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {questionsData.EDU_CONTEXTS.map(ctx => (
                <div
                  key={ctx.id}
                  className="p-4 rounded-xl border cursor-pointer transition-all duration-150 text-center flex flex-col items-center justify-center gap-1"
                  style={{
                    backgroundColor: eduContext === ctx.id ? 'var(--background)' : 'transparent',
                    borderColor: eduContext === ctx.id ? 'var(--primary)' : 'var(--border)',
                    boxShadow: eduContext === ctx.id ? '0 0 0 1px var(--primary)' : 'none',
                  }}
                  onClick={() => setEduContext(ctx.id)}
                >
                  <span className="font-bold text-[13.5px]" style={{ color: 'var(--text-primary)' }}>{ctx.title}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{ctx.subtitle}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="pill-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', justifyContent: 'center' }}
          >
            Configure Assessment Environment →
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AssessmentConfig;
