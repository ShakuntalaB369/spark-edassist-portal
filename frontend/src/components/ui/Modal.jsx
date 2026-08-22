import React from 'react';

export const Modal = ({ isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-[20px] z-[1000] flex items-center justify-center p-6">
      <div className={`bg-[#121420]/65 border border-white/8 p-10 rounded-[24px] max-w-[650px] w-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-center relative ${className}`}>
        {children}
      </div>
    </div>
  );
};
