import React, { useState, useRef, useEffect } from 'react';
import { Globe, RefreshCw, Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { useAssessmentContext } from '../../context/AssessmentContext';
import { useProgress } from '../../hooks/useProgress';

export const Header = () => {
  const { eduContext, handleResetProfile, theme, toggleTheme } = useAssessmentContext();
  const { contextAdvice } = useProgress({
    foundationalScore: 0,
    appliedScore: 0,
    collaborativeScore: 0,
    reflectiveScore: 0
  }, eduContext);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const navBtnBase = "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.8px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-150 border border-transparent hover:border-slate-200 dark:hover:border-white/10 cursor-pointer";

  return (
    <header className="bg-white/95 dark:bg-[#0c1018]/95 border-b border-slate-200 dark:border-[#1e293b] px-5 md:px-8 h-[60px] sticky top-0 z-[1100] flex justify-between items-center print:hidden backdrop-blur-sm transition-colors duration-300">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="navLogoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#navLogoGrad)" stroke="url(#navLogoGrad)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <div className="font-heading font-bold text-[17px] text-slate-900 dark:text-white tracking-tight leading-none">SPARK</div>
          <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-400 dark:text-slate-500 mt-0.5">Assessment Portal</div>
        </div>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-2">
        {/* Context badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 pointer-events-none">
          <Globe size={12} className="shrink-0" />
          <span>{contextAdvice.title}</span>
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />

        <button className={navBtnBase} onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-500" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button className={navBtnBase} onClick={handleResetProfile}>
          <RefreshCw size={13} />
          <span>Reconfigure</span>
        </button>

        <button
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.8px] font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 transition-all duration-150 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 cursor-pointer"
          onClick={handleResetProfile}
        >
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>

      {/* Mobile Hamburger */}
      <div className="flex md:hidden items-center" ref={menuRef}>
        <button
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {isMobileMenuOpen && (
          <div className="absolute right-4 top-[64px] w-[220px] bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg py-1.5 z-[1200] animate-fade-in">
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Context</div>
              <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Globe size={12} />
                <span>{contextAdvice.title}</span>
              </div>
            </div>

            <button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-500" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button onClick={() => { handleResetProfile(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <RefreshCw size={13} />
              <span>Reconfigure</span>
            </button>

            <div className="border-t border-slate-100 dark:border-white/5 mt-1 pt-1">
              <button onClick={() => { handleResetProfile(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer">
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
