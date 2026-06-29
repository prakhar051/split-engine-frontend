import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useGroupStore } from '../store/groupStore';
import {
  BudgetProgressBar,
  BudgetHistoryCard,
  BudgetRecommendationCard,
  BudgetTrendChart
} from '../components/analytics';
import {
  Coins,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  Calendar,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BudgetPage() {
  const {
    budgets,
    insights,
    isLoading,
    error,
    fetchBudgets,
    fetchInsights,
    createBudget,
    updateBudget,
    deleteBudget
  } = useAnalyticsStore();

  const { groups, getGroups } = useGroupStore();
  const { supportedCurrencies, preferredCurrency, formatCurrency } = useCurrencyStore();

  const budgetsList = Array.isArray(budgets) ? budgets : [];
  const groupsList = Array.isArray(groups) ? groups : [];
  const supportedCurrenciesList = Array.isArray(supportedCurrencies) ? supportedCurrencies : [];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [conflictError, setConflictError] = useState(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [period, setPeriod] = useState('MONTHLY');
  const [groupId, setGroupId] = useState('');
  const [category, setCategory] = useState('');
  const [warningThreshold, setWarningThreshold] = useState('0.80');

  useEffect(() => {
    fetchBudgets();
    fetchInsights();
    getGroups();
  }, [fetchBudgets, fetchInsights, getGroups]);

  const resetForm = () => {
    setAmount('');
    setCurrency('INR');
    setPeriod('MONTHLY');
    setGroupId('');
    setCategory('');
    setWarningThreshold('0.80');
    setConflictError(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;

    try {
      await createBudget({
        amount: Math.round(parseFloat(amount) * 100), // convert to cents
        currency,
        period,
        groupId: groupId || null,
        category: category || null,
        warningThreshold: parseFloat(warningThreshold)
      });
      setIsCreateOpen(false);
      resetForm();
    } catch (err) {
      // Error managed in store/alert
    }
  };

  const handleEditClick = (b) => {
    setEditingBudget(b);
    setAmount(String(b.amount / 100));
    setCurrency(b.currency);
    setPeriod(b.period);
    setGroupId(b.groupId || '');
    setCategory(b.category || '');
    setWarningThreshold(String(b.warningThreshold));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;

    try {
      await updateBudget(editingBudget.id, {
        amount: Math.round(parseFloat(amount) * 100),
        currency,
        period,
        groupId: groupId || null,
        category: category || null,
        warningThreshold: parseFloat(warningThreshold)
      }, editingBudget.version);
      
      setEditingBudget(null);
      resetForm();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictError('This budget has been updated by another client. Please reload data.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(id);
    }
  };

  const handleApplyRecommendation = (rec) => {
    setCurrency('INR'); // suggestions in INR
    setAmount(String(rec.suggestedAmount / 100));
    setCategory(rec.category);
    setPeriod('MONTHLY');
    setIsCreateOpen(true);
  };

  const formatVal = (cents) => {
    const converted = useCurrencyStore.getState().convertAmount(cents, 'INR', preferredCurrency);
    return formatCurrency(converted, preferredCurrency);
  };

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 flex items-center gap-2">
            <Coins className="w-8 h-8 text-indigo-500" />
            <span>Budgets & Spending Targets</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Set custom spending limits, track warnings, and apply smart recommendations.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsCreateOpen(true); }}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-2xl text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Active Budgets list & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Budgets List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-6">Active Budgets</h3>

            {budgetsList.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/40 rounded-xl border border-slate-800 border-dashed">
                <PlusCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No active budgets found. Create one to start tracking!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {budgetsList.map((b) => (
                  <div key={b.id} className="p-5 bg-slate-950/80 border border-slate-850 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <span>{b.period}</span>
                          <span className="text-indigo-400 font-bold">{b.category || 'OVERALL'}</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Scoped Group: {groupsList.find(g => g.id === b.groupId)?.name || 'All Groups'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEditClick(b)}
                          className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <BudgetProgressBar spent={b.spentAmount} limit={b.amount} currency={b.currency} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget Trend Chart */}
          {budgetsList.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6">Limits vs Spent Comparison</h3>
              <BudgetTrendChart budgets={budgetsList} />
            </div>
          )}
        </div>

        {/* Sidebar: Recommendations & History */}
        <div className="space-y-8">
          {/* Smart suggestions */}
          {insights?.recommendedBudgets && insights.recommendedBudgets.length > 0 && (
            <BudgetRecommendationCard
              recommendations={insights.recommendedBudgets}
              onApply={handleApplyRecommendation}
            />
          )}

          {/* Budget History summary */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Historical Records</h3>
            {/* Simple placeholder as budget history will be rendered dynamically */}
            <p className="text-xs text-slate-400 mb-4">Select custom periods to view previous budget status logs.</p>
            {/* We map budgets that have history relations if available */}
            <BudgetHistoryCard historyList={[]} />
          </div>
        </div>
      </div>

      {/* Create / Edit Budget Modal */}
      <AnimatePresence>
        {(isCreateOpen || editingBudget) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  {editingBudget ? 'Edit Spending Budget' : 'Create Spending Budget'}
                </h3>
                <button
                  onClick={() => { setIsCreateOpen(false); setEditingBudget(null); }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingBudget ? handleUpdate : handleCreate} className="p-6 space-y-4">
                {conflictError && (
                  <div className="p-3 bg-red-950 border border-red-800 rounded-xl text-red-300 text-xs flex flex-col gap-2">
                    <span>{conflictError}</span>
                    <button
                      type="button"
                      onClick={() => { setEditingBudget(null); fetchBudgets(); }}
                      className="self-start py-1 px-3 bg-red-900 hover:bg-red-800 text-white rounded-lg text-[10px]"
                    >
                      Reload Budget
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Limit Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      {supportedCurrenciesList.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Period</label>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Scope to Group (Optional)</label>
                  <select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">All Groups (Overall Personal)</option>
                    {groupsList.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Scope to Category (Optional)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">Overall Spending</option>
                    {['FOOD', 'TRAVEL', 'RENT', 'UTILITIES', 'SHOPPING', 'ENTERTAINMENT', 'GENERAL'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                    <span>Warning Threshold</span>
                    <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                  </label>
                  <select
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="0.80">80% Utilization</option>
                    <option value="0.90">90% Utilization</option>
                    <option value="1.00">100% Exceeded</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setIsCreateOpen(false); setEditingBudget(null); }}
                    className="py-2 px-4 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    {editingBudget ? 'Save Changes' : 'Create Budget'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
