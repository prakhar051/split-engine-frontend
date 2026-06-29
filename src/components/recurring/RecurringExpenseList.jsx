import { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Plus, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import RecurringExpenseCard from './RecurringExpenseCard';

export default function RecurringExpenseList({
  templates,
  groupId,
  onToggle,
  onRun,
  onDelete,
  isToggling,
  isRunning
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, PAUSED
  const [frequencyFilter, setFrequencyFilter] = useState('ALL'); // ALL, DAILY, WEEKLY, MONTHLY, YEARLY
  const [sortBy, setSortBy] = useState('NEXT_RUN_ASC'); // NEXT_RUN_ASC, NEXT_RUN_DESC, AMOUNT_ASC, AMOUNT_DESC

  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      const targetActive = statusFilter === 'ACTIVE';
      result = result.filter((t) => t.isActive === targetActive);
    }

    // Frequency filter
    if (frequencyFilter !== 'ALL') {
      result = result.filter((t) => t.recurrenceType === frequencyFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'NEXT_RUN_ASC') {
        const da = a.nextRunAt ? new Date(a.nextRunAt).getTime() : Infinity;
        const db = b.nextRunAt ? new Date(b.nextRunAt).getTime() : Infinity;
        return da - db;
      }
      if (sortBy === 'NEXT_RUN_DESC') {
        const da = a.nextRunAt ? new Date(a.nextRunAt).getTime() : -Infinity;
        const db = b.nextRunAt ? new Date(b.nextRunAt).getTime() : -Infinity;
        return db - da;
      }
      if (sortBy === 'AMOUNT_ASC') {
        return a.amount - b.amount;
      }
      if (sortBy === 'AMOUNT_DESC') {
        return b.amount - a.amount;
      }
      return 0;
    });

    return result;
  }, [templates, search, statusFilter, frequencyFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search schedules by title or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Selector group */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Status dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950/40 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="PAUSED">Paused Only</option>
              </select>
            </div>

            {/* Frequency dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950/40 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
                className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Frequencies</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            {/* Sorting dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950/40 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="NEXT_RUN_ASC">Next Run (Soonest)</option>
                <option value="NEXT_RUN_DESC">Next Run (Furthest)</option>
                <option value="AMOUNT_ASC">Amount (Low to High)</option>
                <option value="AMOUNT_DESC">Amount (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of cards */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto border border-slate-700/35">
            <AlertCircle className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No recurring templates found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {templates.length === 0
                ? 'Create a schedule to automatically split expenses over daily, weekly, or monthly periods.'
                : 'Try adjusting your search criteria or filter toggles to find matching templates.'}
            </p>
          </div>
          {templates.length === 0 && (
            <Link
              to={`/groups/${groupId}/recurring/new`}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Schedule</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <RecurringExpenseCard
              key={template.id}
              template={template}
              groupId={groupId}
              onToggle={onToggle}
              onRun={onRun}
              onDelete={onDelete}
              isToggling={isToggling}
              isRunning={isRunning}
            />
          ))}
        </div>
      )}
    </div>
  );
}
