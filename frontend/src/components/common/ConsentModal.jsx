import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export const ConsentModal = ({ isOpen, onAllow, onDecline, purposeText = '' }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onDecline} variant="light" className="max-w-[460px]">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Shield Icon */}
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center mb-1">
          <ShieldCheck size={24} className="text-blue-600 dark:text-blue-400" />
        </div>

        {/* Title */}
        <h3 id="modal-title" className="text-lg font-extrabold text-slate-900 dark:text-white">
          Privacy & Personalization
        </h3>

        {/* Short explanation */}
        <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Allow us to use your assessment data to personalize your learning experience and recommendations?
        </p>

        {/* View Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all mt-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 rounded px-1"
          aria-expanded={showDetails}
        >
          <span>View Details</span>
          {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Expanded Explanation */}
        {showDetails && (
          <div className="mt-1 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-[12.8px] text-slate-700 dark:text-slate-300 text-left leading-relaxed animate-fade-in w-full shadow-inner">
            {purposeText || "We will process your scores, subjects, and responses from academic assessments to generate detailed performance analyses and adaptive study recommendations using AI services."}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 w-full mt-5 justify-center">
          <button
            onClick={onDecline}
            className="w-1/2 justify-center py-2.5 rounded-full font-bold text-[13.5px] cursor-pointer transition-all duration-150 bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-white/5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Decline
          </button>
          <Button
            variant="modal-primary"
            onClick={onAllow}
            className="w-1/2 justify-center py-2.5 rounded-full font-bold text-[13.5px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Allow
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConsentModal;
