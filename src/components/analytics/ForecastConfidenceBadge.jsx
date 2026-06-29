import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function ForecastConfidenceBadge({ confidence = 0 }) {
  let styleClass = 'text-red-400 bg-red-950/40 border-red-800';
  let label = 'Low Confidence';
  let Icon = ShieldAlert;

  if (confidence >= 90) {
    styleClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-800';
    label = 'High Confidence';
    Icon = ShieldCheck;
  } else if (confidence >= 60) {
    styleClass = 'text-amber-400 bg-amber-950/40 border-amber-800';
    label = 'Medium Confidence';
    Icon = ShieldAlert;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styleClass} backdrop-blur-sm transition-all duration-300`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}: {confidence}%</span>
    </span>
  );
}
