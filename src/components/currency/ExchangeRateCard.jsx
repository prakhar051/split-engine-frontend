import { ArrowRightLeft, Clock } from 'lucide-react';

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

export default function ExchangeRateCard({
  fromCurrency,
  toCurrency,
  rate,
  fetchedAt,
  provider,
}) {
  const fromFlag = CURRENCY_FLAGS[fromCurrency] || '💱';
  const toFlag = CURRENCY_FLAGS[toCurrency] || '💱';

  const formattedDate = fetchedAt
    ? new Date(fetchedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Gradient accent line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

      {/* Rate display */}
      <div className="flex items-center space-x-3 mt-1">
        <ArrowRightLeft className="w-5 h-5 text-indigo-400 shrink-0" />
        <div className="text-lg font-bold text-slate-100 tracking-tight">
          <span>{fromFlag} 1 {fromCurrency}</span>
          <span className="text-slate-500 mx-2">=</span>
          <span className="text-indigo-400">{Number(rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
          <span className="ml-1">{toFlag} {toCurrency}</span>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          {provider || 'Unknown provider'}
        </span>
        <span className="flex items-center space-x-1 text-[10px] text-slate-600">
          <Clock className="w-3 h-3" />
          <span>{formattedDate}</span>
        </span>
      </div>
    </div>
  );
}
