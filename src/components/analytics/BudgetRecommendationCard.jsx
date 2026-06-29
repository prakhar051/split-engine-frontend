import React from 'react';
import { Sparkles, ArrowRight, TrendingUp, HelpCircle } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function BudgetRecommendationCard({ recommendations = [], onApply }) {
  const { formatCurrency, preferredCurrency } = useCurrencyStore();

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
              AI Budget Recommendations
            </h3>
            <p className="text-xs text-slate-400">Smart suggested limits based on your spending history</p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      {!recommendations || recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-800 rounded-xl">
          <Sparkles className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
          <p className="text-sm text-slate-400">No active AI budget recommendations</p>
          <p className="text-xs text-slate-500 mt-1">Check back later or generate new insights</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((item, index) => {
            const currency = item.currency || preferredCurrency || 'INR';
            const histAvg = item.averageSpending !== undefined ? item.averageSpending : (item.historicalAverage || 0);
            const sugLimit = item.suggestedLimit !== undefined ? item.suggestedLimit : (item.recommendedLimit || 0);
            const reasoning = item.reasoning || item.rationale || 'Suggested based on your spending history.';
            const period = item.period || 'MONTHLY';

            return (
              <div
                key={index}
                className="relative bg-slate-950/40 hover:bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-xl p-5 transition-all duration-300 flex flex-col justify-between space-y-4 group overflow-hidden"
              >
                {/* Visual Accent glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all duration-500 pointer-events-none" />

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-950/40 border border-violet-800/60 text-violet-400">
                      {item.category || 'General'}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {period}
                    </span>
                  </div>

                  {/* Comparisons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Avg Spent</span>
                      <span className="font-mono text-sm text-slate-300 font-semibold">
                        {formatCurrency(histAvg, currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Suggested Limit</span>
                      <span className="font-mono text-sm text-violet-400 font-bold">
                        {formatCurrency(sugLimit, currency)}
                      </span>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <p className="text-xs text-slate-400 italic bg-slate-900/40 border border-slate-850 rounded-lg p-2.5 leading-relaxed">
                    "{reasoning}"
                  </p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => onApply?.(item)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-slate-100 transition-all shadow-[0_0_12px_rgba(124,58,237,0.2)] hover:shadow-[0_0_16px_rgba(124,58,237,0.4)]"
                >
                  <span>Apply Recommendation</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
