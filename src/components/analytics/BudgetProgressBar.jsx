import React from 'react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function BudgetProgressBar({ spent = 0, limit = 0, currency }) {
  const { formatCurrency, preferredCurrency } = useCurrencyStore();
  const selectedCurrency = currency || preferredCurrency || 'INR';

  const utilization = limit > 0 ? (spent / limit) * 100 : 0;
  const percentageText = limit > 0 ? `${Math.round(utilization)}%` : '0%';

  let barColor = 'bg-emerald-500';
  if (utilization >= 100) {
    barColor = 'bg-red-500';
  } else if (utilization >= 90) {
    barColor = 'bg-orange-500';
  } else if (utilization >= 80) {
    barColor = 'bg-amber-500';
  }

  const formattedSpent = formatCurrency(spent, selectedCurrency);
  const formattedLimit = formatCurrency(limit, selectedCurrency);

  // Limit bar percentage display caps at 100% for width visual
  const visualWidth = Math.min(utilization, 100);

  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-baseline text-sm">
        <span className="font-semibold text-slate-100">
          {formattedSpent} <span className="text-slate-400 font-normal">/ {formattedLimit}</span>
        </span>
        <span className={`text-xs font-bold ${utilization >= 100 ? 'text-red-400' : utilization >= 90 ? 'text-orange-400' : utilization >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {percentageText}
        </span>
      </div>

      <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/30">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${visualWidth}%` }}
        />
      </div>
    </div>
  );
}
