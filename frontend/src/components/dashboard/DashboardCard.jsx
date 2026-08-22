import React from 'react';

export const DashboardCard = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`bg-white dark:bg-[#101522] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-6 relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-200 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default DashboardCard;
