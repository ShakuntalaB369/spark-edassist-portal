import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { DashboardCard } from '../dashboard/DashboardCard';
import skillEnhanceService from '../../services/skillEnhanceService';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const SkillEnhanceHistory = ({ triggerToast, onSelectReport, refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await skillEnhanceService.getMySkillEnhance();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      const res = await skillEnhanceService.deleteSkillEnhance(deleteTargetId);
      if (res.success) {
        setHistory(prev => prev.filter(item => item._id !== deleteTargetId));
        triggerToast("Assessment deleted successfully.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Unable to delete assessment.", "error");
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-panel-border pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">✨ Skill Enhance History</h3>
          <p className="text-[12px] text-slate-500">Track and review your previous multi-subject global challenges.</p>
        </div>
      {history.filter(item => !item.deletedFromHistory).length > 0 && (
        <span className="text-[11px] text-slate-400 font-medium shrink-0">
          {showAll ? history.filter(item => !item.deletedFromHistory).length : Math.min(3, history.filter(item => !item.deletedFromHistory).length)} of {history.filter(item => !item.deletedFromHistory).length}
        </span>
      )}
      </div>

      {loading && history.filter(item => !item.deletedFromHistory).length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
        </div>
      ) : history.filter(item => !item.deletedFromHistory).length === 0 ? (
        <p className="text-[13px] text-slate-500 py-4 text-center">No Skill Enhance sessions completed yet.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {history
              .filter(item => !item.deletedFromHistory)
              .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
              .slice(0, showAll ? undefined : 3)
              .map((item) => (
                <div key={item._id} className="flex justify-between items-center bg-slate-200/40 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-300 dark:border-panel-border transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="font-bold text-[14px] text-slate-900 dark:text-white">
                      Skill Enhance ({item.ageGroup})
                    </div>
                    <div className="text-[11.5px] text-slate-500 dark:text-text-secondary">
                      Completed {new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-extrabold text-[15px] text-slate-900 dark:text-white">{item.percentage}%</div>
                      <div className="text-[11.5px] text-slate-500 dark:text-text-muted">{item.score} / {item.totalQuestions}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="modal"
                        size="sm"
                        onClick={() => onSelectReport(item)}
                      >
                        View Report
                      </Button>
                      <button
                        onClick={() => handleDeleteClick(item._id)}
                        title="Delete assessment"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all duration-150 shrink-0"
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 13 6"/>
                          <path d="M5 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          <path d="M4 6l.8 7.2A1 1 0 005.8 14h4.4a1 1 0 00.996-.9L12 6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {history.length > 3 && (
            <button
              onClick={() => setShowAll(prev => !prev)}
              className="self-center flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-400 hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors duration-150 py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
            >
              {showAll ? (
                <><ChevronUp size={13} strokeWidth={2.2} /> Show Less</>
              ) : (
                <><ChevronDown size={13} strokeWidth={2.2} /> Show {history.length - 3} More</>
              )}
            </button>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
          <div className="bg-slate-100 dark:bg-[#121420] border border-slate-300 dark:border-panel-border rounded-2xl max-w-[400px] w-full p-6 shadow-2xl animate-fade-in relative text-center">
            <h3 className="text-[18px] font-bold text-slate-900 dark:text-white mb-2">Delete Assessment?</h3>
            <p className="text-[13.5px] text-slate-500 dark:text-text-muted mb-6 leading-relaxed">
              Are you sure you want to permanently delete this assessment? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="modal" 
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="modal-primary" 
                onClick={confirmDelete}
                disabled={deleting}
                className="!bg-rose-600 hover:!bg-rose-700 !text-white border-none font-semibold"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillEnhanceHistory;
