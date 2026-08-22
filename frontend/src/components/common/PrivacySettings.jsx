import React, { useState, useEffect } from 'react';
import { consentService } from '../../services/consentService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ShieldCheck, History, AlertTriangle, ArrowLeftRight, HelpCircle } from 'lucide-react';

export const PrivacySettings = ({ triggerToast, onTriggerConsentModal, consentStatus, setConsentStatus }) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      pastDate.setMinutes(pastDate.getMinutes() - 5); // 5 minutes in the past
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

  const handleToggleState = async () => {
    // If they click change consent, let's use the main consent modal to grant/decline
    onTriggerConsentModal();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'granted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
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
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-panel-border pb-5 flex justify-between items-center">
        <div>
          <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider mb-2 inline-block">
            Privacy & Trust Center
          </span>
          <h2 className="text-2xl text-slate-900 dark:text-white font-extrabold leading-tight">Privacy & Consent Lifecycle</h2>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-6 rounded-2xl flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} className="text-blue-500" />
            </div>
            <div>
              <h4 className="text-[15.5px] font-bold text-slate-900 dark:text-white mb-1">
                Skill Enhancement Personalization
              </h4>
              <p className="text-[12.8px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                Allows your assessment scores, responses, and metrics to be analysed to generate tailored studies, learning paths, and recommendations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-semibold text-slate-400 mr-1">Current status:</span>
            {getStatusBadge(consentStatus)}
          </div>
        </div>

        {/* Dynamic State Feedback */}
        {consentStatus === 'expired' && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
            <AlertTriangle className="text-rose-400 shrink-0" size={20} />
            <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold leading-relaxed">
              ⚠️ Your consent for personalized learning has expired. Please review consent to continue using Skill Enhance.
            </div>
          </div>
        )}

        {/* Action Panel */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <Button
              variant="modal"
              onClick={handleToggleState}
              className="px-4 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <ArrowLeftRight size={15} />
              Change Consent
            </Button>
            
            {consentStatus === 'granted' && (
              <>
                <Button
                  variant="modal"
                  onClick={() => setShowWithdrawConfirm(true)}
                  className="px-4 py-2.5 rounded-full font-bold flex items-center gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                >
                  Withdraw Consent
                </Button>
                <Button
                  variant="modal"
                  onClick={handleSimulateExpiry}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-full font-bold border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                >
                  Simulate Expiry (Test)
                </Button>
              </>
            )}
          </div>
          
          {consentStatus === 'expired' && (
            <Button
              variant="modal-primary"
              onClick={handleToggleState}
              className="px-5 py-2.5 rounded-full font-bold text-white"
            >
              Review Consent
            </Button>
          )}
        </div>
      </div>

      {/* History Audit Log */}
      <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-panel-border p-6 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <History size={18} className="text-slate-400" />
          <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Date / Time</th>
                  <th className="pb-3">Purpose</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3 pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-[13px] text-slate-600 dark:text-slate-300">
                {historyList.map((log) => {
                  let actionText = '';
                  switch (log.status) {
                    case 'granted':
                      actionText = 'Granted';
                      break;
                    case 'declined':
                      actionText = 'Declined';
                      break;
                    case 'withdrawn':
                      actionText = 'Withdrawn';
                      break;
                    case 'expired':
                      actionText = 'Expired';
                      break;
                    default:
                      actionText = 'Modified';
                  }

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                      <td className="py-3 pl-2 text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 font-semibold">
                        {log.purpose === 'skill_enhancement_personalization' 
                          ? 'Skill Personalization' 
                          : log.purpose}
                      </td>
                      <td className="py-3 font-medium">
                        {actionText}
                      </td>
                      <td className="py-3 pr-2">
                        {getStatusBadge(log.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Consent Withdrawal */}
      <Modal isOpen={showWithdrawConfirm} onClose={() => setShowWithdrawConfirm(false)} className="max-w-[420px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-1">
            <HelpCircle size={24} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Withdraw Personalization Consent?
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Are you sure you want to withdraw consent for personalized learning analysis? 
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
