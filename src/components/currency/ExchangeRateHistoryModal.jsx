import { useCurrencyStore } from '../../store/currencyStore';
import { X, TrendingUp, Inbox } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ExchangeRateHistoryModal({ isOpen, onClose }) {
  const ratesHistory = useCurrencyStore((state) => state.ratesHistory);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-55 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal container */}
          <motion.div
            className="relative max-w-2xl w-full mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5 text-white">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">Exchange Rate History</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition duration-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[80vh] overflow-y-auto p-6">
              {!ratesHistory || ratesHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Inbox className="w-10 h-10 text-slate-700" />
                  <p className="text-sm text-slate-500 text-center">
                    No exchange rate history available yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Base
                        </th>
                        <th className="px-3 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Rates Summary
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {ratesHistory.map((entry, idx) => {
                        const rateKeys = entry.rates
                          ? Object.keys(entry.rates).slice(0, 4)
                          : [];

                        const formattedDate = entry.fetchedAt
                          ? new Date(entry.fetchedAt).toLocaleDateString(
                              undefined,
                              { dateStyle: 'medium' }
                            )
                          : '—';

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-slate-800/30 transition duration-150"
                          >
                            <td className="px-3 py-3 text-slate-300 whitespace-nowrap">
                              {formattedDate}
                            </td>
                            <td className="px-3 py-3 text-slate-400 whitespace-nowrap">
                              {entry.provider || '—'}
                            </td>
                            <td className="px-3 py-3 text-slate-300 font-semibold whitespace-nowrap">
                              {entry.base || '—'}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {rateKeys.map((key) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-0.5 bg-slate-800/60 border border-slate-700/50 text-slate-400 rounded-md text-[10px] font-mono"
                                  >
                                    {key}:{' '}
                                    {Number(entry.rates[key]).toLocaleString(
                                      undefined,
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 4,
                                      }
                                    )}
                                  </span>
                                ))}
                                {Object.keys(entry.rates || {}).length > 4 && (
                                  <span className="text-[10px] text-slate-600 self-center">
                                    +{Object.keys(entry.rates).length - 4} more
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
