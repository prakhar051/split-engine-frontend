import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useExpenseStore } from '../store/expenseStore';
import { useGroupStore } from '../store/groupStore';
import ExpenseList from '../components/expenses/ExpenseList';
import ErrorAlert from '../components/ui/ErrorAlert';
import { Search, Plus, Filter, RotateCcw, ArrowLeft } from 'lucide-react';

const FILTER_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'GENERAL', label: 'General' },
  { value: 'FOOD', label: 'Food & Dining' },
  { value: 'TRAVEL', label: 'Travel & Transport' },
  { value: 'RENT', label: 'Rent & Living' },
  { value: 'UTILITIES', label: 'Utilities & Bills' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' }
];

export default function ExpensesPage() {
  const { groupId } = useParams();
  const { currentGroup, getGroupDetails } = useGroupStore();
  const {
    expenses,
    isLoading,
    error,
    getGroupExpenses,
    selectedCategoryFilter,
    searchQuery,
    setSelectedCategoryFilter,
    setSearchQuery
  } = useExpenseStore();

  useEffect(() => {
    getGroupExpenses(groupId);
    if (!currentGroup || currentGroup.id !== groupId) {
      getGroupDetails(groupId);
    }
  }, [groupId, getGroupExpenses, getGroupDetails, currentGroup]);

  // Combined Search & Category Filters
  const filteredExpenses = expenses.filter((exp) => {
    const titleText = (exp.title || exp.description || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = titleText.includes(query);
    
    const matchesCategory = selectedCategoryFilter 
      ? exp.category === selectedCategoryFilter 
      : true;

    return matchesSearch && matchesCategory;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('');
  };

  const createExpenseBtn = (
    <Link
      to={`/groups/${groupId}/expenses/new`}
      className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition duration-150 shadow-md shadow-indigo-500/10 cursor-pointer"
    >
      <Plus className="w-4 h-4" />
      <span>Create Expense</span>
    </Link>
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link
          to={`/groups/${groupId}`}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {currentGroup?.name || 'Group'} Details</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">Group Expenses</h1>
            <p className="text-slate-400 text-sm">
              Manage, search, and split expenses for <span className="font-semibold text-slate-350">{currentGroup?.name || 'this group'}</span>.
            </p>
          </div>
          {expenses.length > 0 && <div className="self-start sm:self-auto">{createExpenseBtn}</div>}
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Search & Filters Panel */}
      {expenses.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-md">
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <span className="absolute left-3.5 top-3 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses by title..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="relative w-full md:w-56 flex items-center">
            <span className="absolute left-3.5 text-slate-500 z-10">
              <Filter className="w-3.5 h-3.5" />
            </span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
            >
              {FILTER_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedCategoryFilter) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-slate-850 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition duration-150 border border-slate-750/30 cursor-pointer w-full md:w-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}

      {/* Main Expenses List Display */}
      {isLoading && expenses.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <ExpenseList
          expenses={filteredExpenses}
          groupId={groupId}
          actionButton={createExpenseBtn}
        />
      )}
    </div>
  );
}
