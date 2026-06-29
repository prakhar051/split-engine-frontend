import AIConfidenceBadge from './AIConfidenceBadge';
import { Check, X, RefreshCw, Cpu, Database } from 'lucide-react';

export default function AISuggestionCard({ suggestionEnvelope, onAccept, onDismiss, onRetry, error }) {
  if (error) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-rose-500/20 rounded-2xl p-5 shadow-xl space-y-4 font-sans">
        <div className="flex items-center space-x-2.5 text-rose-450">
          <Cpu className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold uppercase tracking-wider">AI Categorization Failed</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error}
        </p>
        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Analysis</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 rounded-xl text-xs font-bold transition border border-slate-850 cursor-pointer"
          >
            <span>Dismiss</span>
          </button>
        </div>
      </div>
    );
  }

  if (!suggestionEnvelope || !suggestionEnvelope.suggestion) return null;

  const { suggestion, fromCache, model } = suggestionEnvelope;
  const { merchant, title, category, confidence, reason } = suggestion;

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 font-sans relative overflow-hidden">
      {/* Top Banner / Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Cpu className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Gemini Smart Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          {fromCache && (
            <span className="inline-flex items-center px-2 py-0.5 bg-indigo-950/80 border border-indigo-850 text-indigo-400 rounded-md text-[9px] font-bold uppercase tracking-wide">
              <Database className="w-2.5 h-2.5 mr-1" />
              Loaded from cache
            </span>
          )}
          <AIConfidenceBadge confidence={confidence} />
        </div>
      </div>

      {/* Suggested values list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/45 border border-slate-850/50 rounded-xl p-4">
        <div>
          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Suggested Merchant</span>
          <span className="text-sm font-bold text-slate-200">{merchant || 'N/A'}</span>
        </div>
        <div>
          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Suggested Title</span>
          <span className="text-sm font-bold text-slate-200">{title || 'N/A'}</span>
        </div>
        <div>
          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Suggested Category</span>
          <span className="inline-flex items-center px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-350 rounded text-xs font-bold mt-1">
            {category}
          </span>
        </div>
      </div>

      {/* Explanation reasoning */}
      <div className="space-y-1">
        <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">AI Reasoning</span>
        <p className="text-xs text-slate-400 leading-relaxed">{reason}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-3 pt-2">
        <button
          type="button"
          onClick={onAccept}
          className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-indigo-500/10"
        >
          <Check className="w-4 h-4" />
          <span>Accept Suggestion</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-455 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Dismiss</span>
        </button>
      </div>
      
      {/* Model footer indicator */}
      <div className="text-[9px] text-slate-600 text-right mt-1">
        Powered by {model || 'gemini-2.5-flash'}
      </div>
    </div>
  );
}
