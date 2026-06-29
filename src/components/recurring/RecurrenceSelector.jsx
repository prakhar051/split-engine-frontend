import { useEffect } from 'react';

export default function RecurrenceSelector({
  recurrenceType,
  setRecurrenceType,
  interval,
  setIntervalValue,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onChange
}) {
  
  useEffect(() => {
    if (onChange) {
      onChange({ recurrenceType, interval, startDate, endDate });
    }
  }, [recurrenceType, interval, startDate, endDate, onChange]);

  const handleIntervalChange = (val) => {
    const parsed = parseInt(val, 10);
    setIntervalValue(isNaN(parsed) ? '' : Math.max(1, parsed));
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
      <div>
        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-1">Recurrence Schedule</h3>
        <p className="text-xs text-slate-500">Configure how often this expense should automatically generate.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recurrence Type */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Frequency</label>
          <select
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>

        {/* Interval */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Repeat Interval</label>
          <input
            type="number"
            min="1"
            value={interval}
            onChange={(e) => handleIntervalChange(e.target.value)}
            placeholder="e.g. 2 for every 2 weeks"
            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-655 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
          />
          <p className="text-[10px] text-slate-500 mt-1.5">
            Repeats every {interval} {recurrenceType.toLowerCase()}(s).
          </p>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Start Date (UTC)</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
          />
        </div>

        {/* End Date (Optional) */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">End Date (Optional, UTC)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
          />
        </div>
      </div>
    </div>
  );
}
