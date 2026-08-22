import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  className = '',
  disabled = false,
  style = {}
}) => {
  let baseClass = "";
  let inlineStyle = { ...style };

  if (variant === 'pill') {
    baseClass = "px-3.5 py-1.5 rounded-lg text-[12.8px] font-medium cursor-pointer transition-all duration-150 flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white";
  } else if (variant === 'pill-primary') {
    baseClass = "text-white border-none px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2 hover:opacity-90 hover:-translate-y-[1px] active:translate-y-0";
    inlineStyle = {
      backgroundColor: 'var(--primary)',
      boxShadow: '0 4px 14px rgba(30,58,138,0.2)',
      ...style,
    };
  } else if (variant === 'modal') {
    baseClass = "px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white";
  } else if (variant === 'modal-primary') {
    baseClass = "px-5 py-2 rounded-lg text-[13.5px] font-semibold cursor-pointer transition-all duration-200 text-white border-none flex items-center gap-1.5 hover:opacity-90 hover:-translate-y-[1px]";
    inlineStyle = { backgroundColor: 'var(--primary)', ...style };
  } else if (variant === 'modal-success') {
    baseClass = "px-5 py-2 rounded-lg text-[13.5px] font-semibold cursor-pointer transition-all duration-200 text-white border-none flex items-center gap-1.5 hover:opacity-90 hover:-translate-y-[1px]";
    inlineStyle = { backgroundColor: 'var(--success)', ...style };
  } else if (variant === 'modal-pink') {
    baseClass = "px-5 py-2 rounded-lg text-[13.5px] font-semibold cursor-pointer transition-all duration-200 bg-pink-500 text-white border-none flex items-center gap-1.5 hover:bg-pink-600 hover:-translate-y-[1px]";
  } else {
    baseClass = "px-4 py-2 rounded-lg transition-all cursor-pointer";
  }

  if (disabled) {
    baseClass += " opacity-50 cursor-not-allowed pointer-events-none";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClass} ${className}`}
      disabled={disabled}
      style={inlineStyle}
    >
      {children}
    </button>
  );
};
