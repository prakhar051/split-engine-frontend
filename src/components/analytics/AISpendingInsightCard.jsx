import React from 'react';
import { Brain, Sparkles, AlertCircle, Quote } from 'lucide-react';

export default function AISpendingInsightCard({ insights = {} }) {
  const habitsList = Array.isArray(insights?.habits)
    ? insights.habits
    : typeof insights?.habits === 'string'
    ? insights.habits.split('\n').filter(Boolean)
    : [];

  const summary = insights?.summary || '';
  const advice = insights?.advice || '';

  const hasInsights = summary || habitsList.length > 0 || advice;

  if (!hasInsights) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col justify-center items-center min-h-[220px]">
        <Brain className="w-12 h-12 text-slate-700 mb-3" />
        <h4 className="text-slate-300 font-semibold">AI Spending Insights</h4>
        <p className="text-slate-500 text-sm mt-1 text-center">No AI insights generated yet. Add more transactions to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col space-y-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-slate-100 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
              AI Spending Insights
            </h3>
            <p className="text-xs text-slate-400">Personalized analytics and smart habit tracking</p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
      </div>

      {/* Summary */}
      {summary && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-450 uppercase tracking-wider text-slate-400">Overview</h4>
          <p className="text-sm text-slate-350 leading-relaxed font-normal bg-slate-950/20 p-4 rounded-xl border border-slate-800/40">
            {summary}
          </p>
        </div>
      )}

      {/* Key Habits */}
      {habitsList.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-450 uppercase tracking-wider text-slate-400">Identified Habits</h4>
          <ul className="space-y-2.5">
            {habitsList.map((habit, index) => (
              <li key={index} className="flex items-start space-x-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-lg bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shrink-0 text-xs font-bold mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-normal">{habit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Motivational Advice */}
      {advice && (
        <div className="relative bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-900/40 rounded-xl p-4 flex items-start space-x-3">
          <Quote className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">AI Coach Advice</h5>
            <p className="text-sm text-indigo-100 italic leading-relaxed">
              "{advice}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
