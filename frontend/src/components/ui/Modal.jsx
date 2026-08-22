import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const Modal = ({ isOpen, onClose, children, className = '', variant = 'default' }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus(); // Focus Allow/Primary button first
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }

      if (e.key === 'Tab' && focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overlayClass = "fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-[4px] z-[9999] flex items-center justify-center p-6";
  
  const modalClass = variant === 'light'
    ? `bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-8 rounded-[24px] max-w-[650px] w-full shadow-lg text-center relative max-h-[85vh] overflow-y-auto ${className}`
    : `bg-[#121420]/65 border border-white/8 p-10 rounded-[24px] max-w-[650px] w-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-center relative max-h-[85vh] overflow-y-auto ${className}`;

  const modalContent = (
    <div className={overlayClass} onClick={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div 
        ref={modalRef}
        role="dialog" 
        aria-modal="true"
        className={modalClass}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
