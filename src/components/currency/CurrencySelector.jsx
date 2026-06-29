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

export default function CurrencySelector({
  value,
  onChange,
  label = 'Currency',
  currencies = [],
  className = '',
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 cursor-pointer appearance-none"
      >
        {currencies.map((code) => (
          <option key={code} value={code}>
            {CURRENCY_FLAGS[code] || '💱'} {code}
          </option>
        ))}
      </select>
    </div>
  );
}
