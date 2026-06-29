const CURRENCY_FLAGS = {
  INR: '🇮🇳',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  SGD: '🇸🇬',
  AED: '🇦🇪',
};

const CURRENCY_COLORS = {
  INR: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  USD: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  EUR: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  GBP: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  JPY: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  AUD: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  CAD: 'bg-red-500/15 text-red-400 border-red-500/20',
  SGD: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  AED: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
};

const DEFAULT_COLOR = 'bg-slate-500/15 text-slate-400 border-slate-500/20';

export default function CurrencyBadge({ currency, className = '' }) {
  const colorClass = CURRENCY_COLORS[currency] || DEFAULT_COLOR;
  const flag = CURRENCY_FLAGS[currency] || '💱';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      <span className="mr-1">{flag}</span>
      {currency}
    </span>
  );
}
