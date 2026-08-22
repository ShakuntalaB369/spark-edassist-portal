import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';

export const OTP = () => {
  const { 
    userName, 
    email, 
    setIsOtpVerified, 
    triggerToast, 
    setToken,
    setUserName,
    setAgeGroup,
    setCountry,
    setProfileImage,
    setHasSetup
  } = useAssessmentContext();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = useRef([]);

  // Focus the first input box on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (newOtp[index] !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "") {
        if (index > 0) {
          inputRefs.current[index - 1].focus();
          const newOtp = [...otp];
          newOtp[index - 1] = "";
          setOtp(newOtp);
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasteData)) return;
    const digits = pasteData.slice(0, 6).split("");
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      if (digits[i]) {
        newOtp[i] = digits[i];
      }
    }
    setOtp(newOtp);
    const focusIndex = Math.min(digits.length, 5);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
    e.preventDefault();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the full 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authService.verifyOtp(userName, email, otpCode);
      if (res.success && res.token) {
        setToken(res.token);
        setUserName(res.user.name);
        setAgeGroup(res.user.ageGroup || '15-18');
        if (res.user.country) setCountry(res.user.country);
        if (res.user.profileImage) setProfileImage(res.user.profileImage);
        setHasSetup(true);
        setSuccess(true);
        setIsOtpVerified(true);
        triggerToast("Email verified successfully!");
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        throw new Error(res.message || "Invalid code");
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Incorrect verification code.";
      setError(errMsg);
      triggerToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      const res = await authService.sendOtp(userName, email);
      if (res.success) {
        setResendTimer(60);
        setOtp(new Array(6).fill(""));
        setError(null);
        triggerToast("A new verification code has been sent!");
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Please wait before requesting another verification code.";
      triggerToast(errMsg, "error");
    }
  };

  // Trigger verify automatically once 6 digits are typed
  useEffect(() => {
    if (otp.join("").length === 6 && !success && !loading) {
      handleVerify();
    }
  }, [otp]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 font-body relative overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Faint grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #94A3B8 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Two-Column Responsive Wrapper */}
      <div
        className="w-full max-w-[920px] grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] border relative z-10"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        
        {/* Left — Branding panel */}
        <div
          className="col-span-1 md:col-span-5 flex flex-col items-center justify-center p-8 md:p-12 text-center relative overflow-hidden border-b md:border-b-0 md:border-r"
          style={{ backgroundColor: 'var(--primary)', borderColor: 'rgba(255,255,255,0.15)' }}
        >
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 flex flex-col items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)' }}
            >
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-[0.06em] font-heading leading-none">SPARK</h1>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mt-2">EdAssist Framework</p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold text-white/80 mt-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Shield size={14} className="shrink-0 text-white/70" />
              <span>Email Verification</span>
            </div>
          </div>
        </div>

        {/* Right — Verification panel */}
        <div
          className="col-span-1 md:col-span-7 flex flex-col justify-center p-8 md:p-12 text-left relative"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="absolute top-6 left-6 md:left-8 flex items-center gap-1 text-[13px] font-semibold bg-transparent border-none cursor-pointer p-0 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← Back
          </button>

          {/* Badge */}
          <div className="flex mb-7 mt-6 md:mt-0">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--background)' }}
            >
              <Shield size={11} />
              <span>Secure Verification</span>
            </div>
          </div>

          <h2 className="text-[28px] font-bold font-heading leading-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Verify Your Email
          </h2>
          <p className="text-[13.5px] mb-8" style={{ color: 'var(--text-secondary)' }}>
            We sent a code to: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{email || 'your email'}</span>
          </p>

          {success ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 animate-fade-in text-center">
              <CheckCircle2 size={48} className="text-emerald-500 animate-bounce" />
              <p className="text-white font-semibold text-[15.2px]">✓ Email Verified</p>
              <p className="text-slate-400 text-[12.8px]">Redirecting to profile setup...</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              {/* OTP Boxes */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--primary)' }}>Enter 6-Digit Code</label>
                <div className="flex justify-between gap-1.5 sm:gap-2 max-w-[360px] w-full">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      ref={el => inputRefs.current[index] = el}
                      value={data}
                      onChange={e => handleChange(e.target, index)}
                      onKeyDown={e => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      className="w-10 h-10 sm:w-12 sm:h-12 text-center text-[22px] sm:text-[24px] font-bold rounded-xl outline-none transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--background)',
                        border: '1.5px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div className="text-rose-400 text-[13px] font-semibold text-center bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                  {error.includes("expired") ? "⚠ " : "✕ "} {error}
                </div>
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center justify-center gap-2 text-slate-400 text-[13px] font-semibold">
                  <Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)' }} />
                  <span>Verifying...</span>
                </div>
              )}

              {/* Verify button */}
              <Button 
                type="submit" 
                variant="pill-primary" 
                disabled={loading || otp.join("").length < 6}
                className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#60A5FA] hover:to-[#A855F7] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all duration-300 mt-2 flex justify-center items-center gap-2"
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', justifyContent: 'center' }}
              >
                <span>{loading ? "Verifying..." : "Verify OTP"}</span>
              </Button>

              {/* Resend Code / Change Email */}
              <div className="flex flex-col gap-2 mt-4 text-[13px] text-slate-500 text-center md:text-left">
                <div>
                  Didn't receive the code?{' '}
                  {resendTimer > 0 ? (
                    <span className="text-slate-400 font-medium">Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="bg-transparent border-none cursor-pointer p-0 font-semibold hover:underline transition-colors"
                      style={{ color: 'var(--primary)' }}
                    >
                      Resend Code
                    </button>
                  )}
                </div>
                <div>
                  <button 
                    type="button" 
                    onClick={() => navigate('/login')}
                    className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-0 font-medium hover:underline"
                  >
                    Change Email
                  </button>
                </div>
              </div>
            </form>
          )}

          <div
            className="mt-10 pt-6 flex gap-5 text-[11.5px]"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
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

export default OTP;
