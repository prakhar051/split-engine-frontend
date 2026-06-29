const CATEGORIES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'FOOD', label: 'Food & Dining' },
  { value: 'TRAVEL', label: 'Travel & Transport' },
  { value: 'RENT', label: 'Rent & Living' },
  { value: 'UTILITIES', label: 'Utilities & Bills' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'ENTERTAINMENT', label: 'Entertainment & Social' }
];

export default function CategorySelector({ value, onChange, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor="category-select" className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Category</label>
      <select
        id="category-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
}
