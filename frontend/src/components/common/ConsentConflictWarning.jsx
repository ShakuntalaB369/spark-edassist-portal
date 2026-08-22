import React from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle, ShieldAlert, FileWarning, EyeOff } from 'lucide-react';

export const ConsentConflictWarning = ({ status, message, onReviewConsent, onContinueWithoutPersonalization, onBack }) => {
  const getIconAndHeader = () => {
    switch (status) {
      case 'withdrawn':
        return {
          icon: <ShieldAlert size={36} className="text-amber-500" />,
          title: "⚠️ Consent Withdrawn"
        };
      case 'expired':
        return {
          icon: <AlertTriangle size={36} className="text-rose-500" />,
          title: "⚠️ Consent Expired"
        };
      case 'declined':
      case 'no_consent':
        return {
          icon: <EyeOff size={36} className="text-slate-500 dark:text-slate-400" />,
          title: "Consent Not Granted"
        };
      case 'purpose_mismatch':
        return {
          icon: <FileWarning size={36} className="text-indigo-500" />,
          title: "Permission Conflict"
        };
      default:
        return {
          icon: <AlertTriangle size={36} className="text-slate-500" />,
          title: "Consent Required"
        };
    }
  };

  const { icon, title } = getIconAndHeader();

  return (
    <div className="flex flex-col items-center text-center p-8 max-w-lg mx-auto bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border rounded-3xl gap-5 shadow-sm my-6">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
        {icon}
      </div>

      {/* Header & Message */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-[13.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Consequence info */}
      <div className="text-[12px] bg-slate-100/75 dark:bg-white/[0.04] p-3.5 rounded-xl text-slate-500 dark:text-slate-400 max-w-md border border-slate-200/50 dark:border-white/5 leading-normal">
        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Personalization Impact:</span>
        You can still complete this assessment session, but AI-driven personalized strengths, weaknesses, and learning path recommendations will not be generated in your final report.
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mt-2 justify-center">
        <Button
          variant="modal"
          onClick={onBack}
          className="justify-center rounded-full font-bold px-5 py-2.5"
        >
          Cancel
        </Button>
        <Button
          variant="modal"
          onClick={onContinueWithoutPersonalization}
          className="justify-center rounded-full font-bold px-5 py-2.5 border-slate-300 dark:border-white/15"
        >
          Continue Without Personalization
        </Button>
        <Button
          variant="modal-primary"
          onClick={onReviewConsent}
          className="justify-center rounded-full font-bold px-6 py-2.5 text-white"
        >
          Review Consent
        </Button>
      </div>
    </div>
  );
};

export default ConsentConflictWarning;
