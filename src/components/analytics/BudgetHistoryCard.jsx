import React from 'react';
import { Calendar, TrendingDown, ArrowUpRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function BudgetHistoryCard({ historyList = [] }) {
  const { formatCurrency, preferredCurrency } = useCurrencyStore();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Budget History</h3>
          <p className="text-xs text-slate-400">Review performance of previous budget periods</p>
        </div>
      </div>

      {!historyList || historyList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-800 rounded-xl">
          <TrendingDown className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">No budget history available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pr-4">Period</th>
                <th className="pb-3 px-4 text-right">Limit</th>
                <th className="pb-3 px-4 text-right">Spent</th>
                <th className="pb-3 px-4 text-right">Remaining</th>
                <th className="pb-3 pl-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {historyList.map((item, index) => {
                const currency = item.currency || preferredCurrency || 'INR';
                const isOverBudget = item.spent > item.amount;
                const remainingColor = isOverBudget ? 'text-rose-400' : 'text-emerald-400';
                
                return (
                  <tr key={index} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="py-4 pr-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200 group-hover:text-slate-100 transition-colors">
                          {formatDate(item.periodStart)}
                        </span>
                        <span className="text-xs text-slate-500">
                          to {formatDate(item.periodEnd)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-300">
                      {formatCurrency(item.amount, currency)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-300">
                      {formatCurrency(item.spent, currency)}
                    </td>
                    <td className={`py-4 px-4 text-right font-mono font-medium ${remainingColor}`}>
                      {formatCurrency(item.remaining, currency)}
                    </td>
                    <td className="py-4 pl-4 text-center">
                      <div className="inline-flex items-center justify-center">
                        {isOverBudget ? (
                          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/40 border border-red-800 text-red-400">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Overspent</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/40 border border-emerald-800 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span>On Track</span>
                          </div>
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
  );
}
