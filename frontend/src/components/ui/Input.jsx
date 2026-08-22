import React from 'react';

export const Input = ({ 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  className = '', 
  ...props 
}) => {
  return (
    <input
      type={type}
      className={`bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-[#1e293b] px-4 py-3 text-[14px] text-slate-900 dark:text-white w-full rounded-xl outline-none transition-all duration-200 focus:border-[#1E3A8A] dark:focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(30,58,138,0.1)] placeholder:text-slate-400 dark:placeholder:text-slate-500 ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};
