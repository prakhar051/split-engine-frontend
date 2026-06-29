export default function AIConfidenceBadge({ confidence }) {
  const score = confidence || 0;
  
  let bgClass = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
  if (score >= 95) {
    bgClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  } else if (score >= 80) {
    bgClass = 'bg-sky-500/10 border-sky-500/20 text-sky-400';
  } else if (score >= 60) {
    bgClass = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${bgClass}`}>
      {score}% Confidence
    </span>
  );
}
