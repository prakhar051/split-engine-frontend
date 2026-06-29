import React from 'react';
import { Lightbulb, AlertTriangle, CheckSquare, Sparkles } from 'lucide-react';

export default function SavingsRecommendationCard({ recommendations = [], anomalies = [] }) {
  const hasRecommendations = recommendations && recommendations.length > 0;
  const hasAnomalies = anomalies && anomalies.length > 0;

  if (!hasRecommendations && !hasAnomalies) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col justify-center items-center min-h-[220px]">
        <Lightbulb className="w-12 h-12 text-slate-700 mb-3" />
        <h4 className="text-slate-300 font-semibold">Recommendations & Alerts</h4>
        <p className="text-slate-500 text-sm mt-1 text-center">No new savings opportunities or anomalies detected.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Savings & Anomalies</h3>
          <p className="text-xs text-slate-400">Opportunities to save and potential issues noticed in your transactions</p>
        </div>
      </div>

      {/* Anomalies Warning Callout */}
      {hasAnomalies && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-rose-450 uppercase tracking-wider text-rose-450 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Anomalies Detected
          </h4>
          <div className="space-y-2">
            {anomalies.map((anomaly, index) => (
              <div
                key={index}
                className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 flex items-start space-x-3"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-sm text-rose-250 text-slate-200 leading-normal">{anomaly}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations List */}
      {hasRecommendations && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-emerald-450 uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Recommended Actions
          </h4>
          <div className="grid gap-3">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="bg-slate-950/30 hover:bg-slate-950/50 transition-colors border border-slate-800/40 rounded-xl p-3.5 flex items-start space-x-3"
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-950/60 border border-emerald-900/60 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-slate-300 leading-normal">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
