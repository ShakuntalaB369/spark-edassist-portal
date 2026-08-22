import React, { useState, useEffect } from 'react';
import { consentService } from '../../services/consentService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ShieldCheck, History, AlertTriangle, ArrowLeftRight, HelpCircle } from 'lucide-react';

// Sticky header is 60px. Add 12px breathing room → 72px total.
const SCROLL_MARGIN_TOP = 72;

export const PrivacySettings = ({ 
  triggerToast, 
  onTriggerConsentModal, 
  consentStatus, 
  setConsentStatus,
}) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // On mount (and page refresh with #hash), scroll to the target section
  useEffect(() => {
    if (window.location.hash === '#skill-enhancement-personalization') {
      const el = document.getElementById('skill-enhancement-personalization');
      if (el) {
        // Small delay to let the page paint first
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      }
    }
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await consentService.getConsentHistory('skill_enhancement_personalization');
      if (res?.success) {
        setHistoryList(res.data);
      }
    } catch (err) {
      console.error('Failed to load consent history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [consentStatus]);

  const handleWithdraw = async () => {
    try {
      setSubmitting(true);
      const res = await consentService.recordConsent('skill_enhancement_personalization', 'withdrawn');
      if (res?.success) {
        setConsentStatus('withdrawn');
        triggerToast('Personalization consent withdrawn successfully.', 'info');
        setShowWithdrawConfirm(false);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to withdraw consent.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateExpiry = async () => {
    try {
      setSubmitting(true);
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 5);
      const res = await consentService.recordConsent('skill_enhancement_personalization', 'granted', '1.0', 'web', pastDate);
      if (res?.success) {
        setConsentStatus('expired');
        triggerToast('Simulated consent expiry recorded in database!', 'info');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to simulate expiry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleState = () => {
    onTriggerConsentModal();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'granted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            Allowed
          </span>
        );
      case 'declined':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/25">
            Declined
          </span>
        );
      case 'withdrawn':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
            Withdrawn
          </span>
        );
      case 'expired':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
            Expired
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/25">
            Not Set
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 text-left max-w-4xl mx-auto py-2 md:py-4 px-1 sm:px-4 w-full box-border">

      {/* ── Page Header ── */}
      <div className="border-b border-slate-200 dark:border-panel-border pb-3 md:pb-5">
        <span className="text-[10px] md:text-[12px] font-bold px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider mb-1.5 md:mb-2 inline-block">
          Privacy &amp; Trust Center
        </span>
        <h2 className="text-lg sm:text-xl md:text-2xl text-slate-900 dark:text-white font-extrabold leading-tight">
          Privacy &amp; Consent Settings
        </h2>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* MOBILE ONLY: Consent Preferences quick-navigation list          */}
      {/* Each item is a native <a> anchor → triggers browser hash nav   */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div className="block md:hidden bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-4 rounded-2xl flex flex-col gap-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 mb-1">
          Consent Preferences
        </div>

        {/*
          Native <a href="#skill-enhancement-personalization"> — no onClick preventDefault,
          no React state intercepting. Browser handles hash navigation natively.
          The 'group' class drives the hover/active styles on child elements.
        */}
        <a
          href="#skill-enhancement-personalization"
          className="group flex flex-row items-center justify-between gap-3 no-underline p-3.5 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:border-blue-200 dark:hover:border-blue-500/20 active:scale-[0.98] transition-all duration-150 select-none cursor-pointer"
          aria-label="Jump to Skill Enhancement Personalization settings"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl border bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 group-hover:border-blue-300 dark:group-hover:border-blue-500/40 flex items-center justify-center shrink-0 transition-all duration-150">
              <ShieldCheck className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
            </div>
            <div className="text-left min-w-0">
              <h4 className="text-[13px] font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-150">
                Skill Enhancement Personalization
              </h4>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Tap to manage settings</span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {getStatusBadge(consentStatus)}
            {/* Chevron hint */}
            <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors duration-150 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </div>
        </a>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* MAIN CONSENT SECTION — rendered on the same page always.        */}
      {/* The stable id + scroll-margin-top enables hash navigation.      */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section
        id="skill-enhancement-personalization"
        style={{ scrollMarginTop: `${SCROLL_MARGIN_TOP}px` }}
        className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-4 sm:p-6 rounded-2xl flex flex-col gap-4 sm:gap-6"
      >
        {/* Setting Header Row */}
        <div className="border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-row items-start gap-3 sm:gap-4 w-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] sm:text-[15.5px] font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                  Skill Enhancement Personalization
                </h4>
                <p className="text-[12px] sm:text-[12.8px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl break-words">
                  Allows your assessment scores, responses, and metrics to be analysed to generate tailored studies, learning paths, and recommendations.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 mt-2 md:mt-0 pl-[52px] sm:pl-[64px] md:pl-0">
              <span className="text-xs sm:text-sm font-semibold text-slate-400">Current status:</span>
              <div className="inline-flex items-center">
                {getStatusBadge(consentStatus)}
              </div>
            </div>
          </div>
        </div>

        {/* Expiry alert */}
        {consentStatus === 'expired' && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
            <AlertTriangle className="text-rose-400 shrink-0" size={20} />
            <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold leading-relaxed">
              ⚠️ Your consent for personalized learning has expired. Please review consent to continue using Skill Enhance.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row md:flex-wrap gap-3 w-full">
            <Button
              variant="modal"
              onClick={handleToggleState}
              className="w-full md:w-auto min-h-[44px] justify-center px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <ArrowLeftRight size={15} />
              Change Consent
            </Button>

            {consentStatus === 'granted' && (
              <>
                <Button
                  variant="modal"
                  onClick={() => setShowWithdrawConfirm(true)}
                  className="w-full md:w-auto min-h-[44px] justify-center px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                >
                  Withdraw Consent
                </Button>
                <Button
                  variant="modal"
                  onClick={handleSimulateExpiry}
                  disabled={submitting}
                  className="w-full md:w-auto sm:col-span-2 md:col-span-1 min-h-[44px] justify-center px-4 py-2.5 rounded-xl font-bold border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                >
                  Simulate Expiry (Test)
                </Button>
              </>
            )}

            {consentStatus === 'expired' && (
              <Button
                variant="modal-primary"
                onClick={handleToggleState}
                className="w-full md:w-auto min-h-[44px] justify-center px-5 py-2.5 rounded-xl font-bold text-white"
              >
                Review Consent
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── Consent Change Audit Log ── */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-4 sm:p-6 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <History size={18} className="text-slate-400" />
          <h3 className="text-[13.5px] sm:text-[14.5px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Consent Change Audit Log
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-6 text-slate-400 text-sm">Loading audit history...</div>
        ) : historyList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
            No consent changes recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Date / Time</th>
                  <th className="pb-3">Purpose</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3 pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-[12px] sm:text-[13px] text-slate-600 dark:text-slate-300">
                {historyList.map((log) => {
                  let actionText = '';
                  switch (log.status) {
                    case 'granted':   actionText = 'Granted';   break;
                    case 'declined':  actionText = 'Declined';  break;
                    case 'withdrawn': actionText = 'Withdrawn'; break;
                    case 'expired':   actionText = 'Expired';   break;
                    default:          actionText = 'Modified';
                  }
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                      <td className="py-3 pl-2 text-slate-450 text-[11px] sm:text-[12px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 font-semibold">
                        {log.purpose === 'skill_enhancement_personalization'
                          ? 'Skill Personalization'
                          : log.purpose}
                      </td>
                      <td className="py-3 font-medium">{actionText}</td>
                      <td className="py-3 pr-2">{getStatusBadge(log.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Withdrawal Confirmation Modal ── */}
      <Modal isOpen={showWithdrawConfirm} onClose={() => setShowWithdrawConfirm(false)} className="max-w-[420px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-1">
            <HelpCircle size={24} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Withdraw Personalization Consent?
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Are you sure you want to withdraw consent for personalized learning analysis?{' '}
            <br />
            <span className="font-semibold text-rose-500 mt-2 block">
              Consequence: You will immediately lose access to personalized Skill Enhance learning analysis and generated recommendations.
            </span>
          </p>
          <div className="flex gap-3 w-full mt-4 justify-center">
            <Button
              variant="modal"
              onClick={() => setShowWithdrawConfirm(false)}
              disabled={submitting}
              className="w-1/2 justify-center py-2 rounded-full font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="modal-pink"
              onClick={handleWithdraw}
              disabled={submitting}
              className="w-1/2 justify-center py-2 rounded-full font-semibold !bg-amber-600 hover:!bg-amber-700 !text-white border-none"
            >
              {submitting ? 'Withdrawing...' : 'Yes, Withdraw'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrivacySettings;
