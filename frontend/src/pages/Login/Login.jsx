import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { authService } from '../../services/authService';
import { Shield, Globe, BookOpen } from 'lucide-react';

export const Login = () => {
  const {
    setEmail,
    setUserName,
    triggerToast,
    setToken,
    setAgeGroup,
    setCountry,
    setProfileImage,
    setHasSetup,
    setIsOtpVerified
  } = useAssessmentContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    if (!window.google) {
      triggerToast("Google Sign-In is loading, please try again in a moment.", "error");
      return;
    }
    setLoading(true);
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '485458051770-placeholder.apps.googleusercontent.com',
        scope: 'openid profile email',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const res = await authService.googleLogin(tokenResponse.access_token);
              if (res.success && res.token) {
                setToken(res.token);
                setUserName(res.user.name);
                setEmail(res.user.email);
                setAgeGroup(res.user.ageGroup || '15-18');
                if (res.user.country) setCountry(res.user.country);
                if (res.user.profileImage) setProfileImage(res.user.profileImage);
                setIsOtpVerified(true);

                if (res.user.ageGroup) {
                  setHasSetup(true);
                  triggerToast("Welcome back!");
                  navigate('/dashboard');
                } else {
                  setHasSetup(false);
                  triggerToast("Authentication successful! Let's setup your profile.");
                  navigate('/setup');
                }
              } else {
                throw new Error(res.message || "Authentication failed");
              }
            } catch (err) {
              console.error(err);
              const errMsg = err.response?.data?.message || "Google Authentication failed. Please try again.";
              triggerToast(errMsg, "error");
            } finally {
              setLoading(false);
            }
          } else {
            setLoading(false);
            triggerToast("Google authentication was cancelled.", "error");
          }
        },
        error_callback: (err) => {
          setLoading(false);
          console.error(err);
          triggerToast("Google authentication error.", "error");
        }
      });
      client.requestAccessToken();
    } catch (e) {
      console.error(e);
      setLoading(false);
      triggerToast("Failed to initialize Google Sign-In client.", "error");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 font-body relative overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}>

      {/* ── Educational background icons ────────────────────────────────────
          Scattered around the page edges. Low-opacity line-art in slate tones.
          Float animations are extremely slow and barely visible.
      ──────────────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes edu-float-a {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-10px) rotate(1.5deg); }
        }
        @keyframes edu-float-b {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-7px) rotate(-1deg); }
        }
        @keyframes edu-float-c {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-12px); }
        }
        .edu-a { animation: edu-float-a 9s ease-in-out infinite; }
        .edu-b { animation: edu-float-b 11s ease-in-out infinite; }
        .edu-c { animation: edu-float-c 13s ease-in-out infinite; }
        @media (max-width: 768px) {
          .edu-bg-icon { opacity: 0 !important; }
        }
      `}</style>

      {/* Open Book — top-left */}
      <svg className="edu-bg-icon edu-a fixed pointer-events-none" style={{ top: '7%', left: '5%', width: 88, height: 88, opacity: 0.16, color: '#475569' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>

      {/* Atom — top-right */}
      <svg className="edu-bg-icon edu-b fixed pointer-events-none" style={{ top: '5%', right: '7%', width: 96, height: 96, opacity: 0.15, color: '#475569' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2"/>
        <ellipse cx="12" cy="12" rx="10" ry="4"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>
      </svg>

      {/* Graduation Cap — far top-right corner */}
      <svg className="edu-bg-icon edu-c fixed pointer-events-none" style={{ top: '11%', right: '2%', width: 70, height: 70, opacity: 0.14, color: '#475569' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c0 2.2 2.7 4 6 4s6-1.8 6-4v-5"/>
      </svg>

      {/* Globe — middle-left edge */}
      <svg className="edu-bg-icon edu-a fixed pointer-events-none" style={{ top: '42%', left: '1.5%', width: 78, height: 78, opacity: 0.15, color: '#475569', animationDelay: '2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/>
        <path d="M2 12h20"/>
        <path d="M2 7h20M2 17h20" opacity="0.6"/>
      </svg>

      {/* Light bulb — top center-left */}
      <svg className="edu-bg-icon edu-b fixed pointer-events-none" style={{ top: '3%', left: '28%', width: 64, height: 64, opacity: 0.13, color: '#475569', animationDelay: '4s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.2 4.16-3 5.2V17H9v-2.8C7.2 13.16 6 11.22 6 9a6 6 0 0 1 6-6z"/>
        <path d="M9 17h6"/>
      </svg>

      {/* Pencil — bottom-left */}
      <svg className="edu-bg-icon edu-c fixed pointer-events-none" style={{ bottom: '8%', left: '5%', width: 72, height: 72, opacity: 0.15, color: '#475569', animationDelay: '1.5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        <path d="m15 5 4 4"/>
      </svg>

      {/* Calculator — bottom-right */}
      <svg className="edu-bg-icon edu-a fixed pointer-events-none" style={{ bottom: '8%', right: '5%', width: 72, height: 72, opacity: 0.15, color: '#475569', animationDelay: '3s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="8" y1="6" x2="16" y2="6"/>
        <line x1="8" y1="11" x2="9" y2="11"/><line x1="12" y1="11" x2="13" y2="11"/><line x1="16" y1="11" x2="17" y2="11"/>
        <line x1="8" y1="15" x2="9" y2="15"/><line x1="12" y1="15" x2="13" y2="15"/><line x1="16" y1="15" x2="17" y2="15"/>
        <line x1="8" y1="19" x2="9" y2="19"/><line x1="12" y1="19" x2="13" y2="19"/><line x1="16" y1="19" x2="17" y2="19"/>
      </svg>

      {/* Bar Chart — bottom center-right */}
      <svg className="edu-bg-icon edu-b fixed pointer-events-none" style={{ bottom: '4%', right: '24%', width: 68, height: 68, opacity: 0.14, color: '#475569', animationDelay: '5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
        <line x1="2"  y1="20" x2="22" y2="20"/>
      </svg>

      {/* Sigma / Math — top center-right */}
      <svg className="edu-bg-icon edu-c fixed pointer-events-none" style={{ top: '4%', right: '26%', width: 62, height: 62, opacity: 0.13, color: '#475569', animationDelay: '6s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 4H6l6 8-6 8h12"/>
      </svg>

      {/* Compass — middle-right edge */}
      <svg className="edu-bg-icon edu-a fixed pointer-events-none" style={{ top: '40%', right: '1.5%', width: 76, height: 76, opacity: 0.15, color: '#475569', animationDelay: '3.5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
      </svg>

      {/* Computer monitor — bottom-left area */}
      <svg className="edu-bg-icon edu-b fixed pointer-events-none" style={{ bottom: '11%', left: '19%', width: 66, height: 66, opacity: 0.13, color: '#475569', animationDelay: '7s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>

      {/* Book 2 (smaller) — top-left mid */}
      <svg className="edu-bg-icon edu-c fixed pointer-events-none" style={{ top: '23%', left: '2.5%', width: 54, height: 54, opacity: 0.12, color: '#64748B', animationDelay: '2.5s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/>
      </svg>


      <div className="w-full max-w-[920px] grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-[#1e293b] relative z-10"
        style={{ backgroundColor: 'var(--surface)' }}>

        {/* Left — Branding panel */}
        <div className="col-span-1 md:col-span-5 flex flex-col items-center justify-center p-8 md:p-12 text-center relative overflow-hidden"
          style={{ backgroundColor: 'var(--primary)' }}>

          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Floating academic icons */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
            <svg className="absolute top-[12%] left-[8%] w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <svg className="absolute bottom-[12%] right-[8%] w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
            </svg>
            <svg className="absolute top-[16%] right-[10%] w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
            <svg className="absolute bottom-[18%] left-[10%] w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" />
            </svg>
          </div>

          {/* Logo */}
          <div className="relative z-10 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)' }}>
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-[0.06em] font-heading leading-none">
                SPARK
              </h1>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mt-2">
                EdAssist Framework
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2 w-full max-w-[200px]">
              {[
                { icon: BookOpen, text: 'Competency-Based Assessment' },
                { icon: Globe,    text: 'Global Education Standards'  },
                { icon: Shield,   text: 'Secure & Fair Platform'       },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11.5px] font-medium text-white/80"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <Icon size={13} className="shrink-0 text-white/70" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Authentication panel */}
        <div className="col-span-1 md:col-span-7 flex flex-col justify-center p-8 md:p-12 text-left"
          style={{ backgroundColor: 'var(--surface)' }}>

          {/* Verified badge */}
          <div className="flex mb-7">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--background)' }}>
              <Shield size={11} />
              <span>Secure Verification</span>
            </div>
          </div>

          <h2 className="text-[28px] font-bold font-heading leading-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Welcome Back
          </h2>
          <p className="text-[13.5px] mb-8" style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue your assessment journey.
          </p>

          {/* Google Button — official Google sign-in style */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-medium text-[14px] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{
              backgroundColor: '#ffffff',
              color: '#3c4043',
              border: '1px solid #DADCE0',
              boxShadow: '0 1px 2px rgba(60,64,67,0.08)',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F8F9FA'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(60,64,67,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(60,64,67,0.08)'; }}
          >
            {/* Authentic multicolor Google "G" */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          {/* Footer links */}
          <div className="mt-10 pt-6 flex gap-5 text-[11.5px]"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <a href="#terms" className="hover:underline transition-colors">Terms &amp; Conditions</a>
            <span>·</span>
            <a href="#privacy" className="hover:underline transition-colors">Privacy Notice</a>
            <span>·</span>
            <a href="#support" className="hover:underline transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
