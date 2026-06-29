import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, Lightbulb, Landmark, Calendar } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function AIHistoryDrawer({ isOpen, onClose, history = [] }) {
  const { formatCurrency, preferredCurrency } = useCurrencyStore();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xs z-50 cursor-pointer"
          />

          {/* Side Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-slate-950 border-l border-slate-800/80 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-900 bg-slate-900/40 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">AI Analysis History</h3>
                  <p className="text-xs text-slate-400">Review recommendations and spending audits</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800">
              {!history || history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-800 rounded-2xl h-full">
                  <Sparkles className="w-10 h-10 text-slate-800 mb-3 animate-pulse" />
                  <p className="text-sm font-semibold text-slate-400">No previous AI runs found</p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Once you generate spending insights, they will be archived here for your historical review.
                  </p>
                </div>
              ) : (
                history.map((record, index) => {
                  const spent = record.totalSpentAmount || 0;
                  const count = record.expenseCount || 0;
                  const currency = record.currency || preferredCurrency || 'INR';

                  return (
                    <div
                      key={record.id || index}
                      className="bg-slate-900/30 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-5 space-y-4 transition-all duration-300 relative group"
                    >
                      {/* Decorative gradient border effect */}
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500/0 via-indigo-500/20 to-violet-500/0 rounded-t-2xl" />

                      {/* Record Metadata */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-850 pb-3">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-semibold text-slate-300">
                            {formatDate(record.generatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500">
                            {count} {count === 1 ? 'expense' : 'expenses'}
                          </span>
                          <span className="font-mono font-bold text-slate-200">
                            {formatCurrency(spent, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Summary */}
                      {record.summary && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">AI Executive Summary</span>
                          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/20 border border-slate-850/50 rounded-xl p-3">
                            {record.summary}
                          </p>
                        </div>
                      )}

                      {/* Savings Recommendations */}
                      {record.recommendations && record.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Savings Recommendations</span>
                          </div>
                          <ul className="space-y-2 pl-1">
                            {record.recommendations.map((rec, rIdx) => (
                              <li key={rIdx} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Anomalies */}
                      {record.anomalies && record.anomalies.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Anomalies Audited</span>
                          </div>
                          <ul className="space-y-2 pl-1">
                            {record.anomalies.map((anom, aIdx) => (
                              <li key={aIdx} className="text-xs text-rose-400/90 flex items-start gap-2 leading-relaxed bg-rose-950/10 border border-rose-950/30 rounded-lg p-2.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <span>{anom}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
