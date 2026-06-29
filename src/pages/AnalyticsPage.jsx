import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useCurrencyStore } from '../store/currencyStore';
import {
  CategoryPieChart,
  MonthlyBarChart,
  CashFlowChart,
  ForecastChart,
  MerchantAnalyticsCard,
  AISpendingInsightCard,
  SavingsRecommendationCard,
  HeatmapChart,
  AIHistoryDrawer,
  BudgetRecommendationCard
} from '../components/analytics';
import {
  TrendingUp,
  RefreshCw,
  History,
  Coins,
  Calendar,
  Sparkles,
  Shield,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsPage() {
  const {
    dashboard,
    heatmap,
    merchants,
    categories,
    forecast,
    insights,
    insightsHistory,
    pagination,
    isLoading,
    error,
    fetchDashboard,
    fetchHeatmap,
    fetchMerchants,
    fetchCategories,
    fetchForecast,
    fetchInsights,
    fetchAIHistory
  } = useAnalyticsStore();

  const { preferredCurrency, formatCurrency } = useCurrencyStore();

  const [stage, setStage] = useState(0); // 0: Idle, 1: Stage 1 Loaded, 2: Stage 2 Loaded, 3: Stage 3 Loaded
  const [heatmapFilter, setHeatmapFilter] = useState('year');
  const [aiHistoryOpen, setAiHistoryOpen] = useState(false);

  // Staged loading logic
  const loadAnalyticsStaged = async (force = false) => {
    setStage(0);
    
    // Stage 1: KPIs and Balances
    await fetchDashboard();
    setStage(1);

    // Stage 2: Charts and Merchant Rankings
    await Promise.all([
      fetchHeatmap({ filter: heatmapFilter }),
      fetchCategories(),
      fetchMerchants({ page: 1, limit: 10 })
    ]);
    setStage(2);

    // Stage 3: AI insights and Forecasts
    await Promise.all([
      fetchForecast(),
      fetchInsights(),
      fetchAIHistory()
    ]);
    setStage(3);
  };

  useEffect(() => {
    loadAnalyticsStaged();
  }, [heatmapFilter]);

  const handleRefresh = () => {
    loadAnalyticsStaged(true);
  };

  // Convert KPI amounts to user's preferred currency if needed
  // Backend stores amounts in base currency (INR cents)
  const formatVal = (cents) => {
    // If the currency store initialization is ready, we convert it dynamically
    // Wait, the currencyStore convertAmount operates on base currency
    const converted = useCurrencyStore.getState().convertAmount(cents, 'INR', preferredCurrency);
    return formatCurrency(converted, preferredCurrency);
  };

  return (
    <div className="space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-indigo-500" />
            <span>Advanced Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Staged, currency-aware spending intelligence, forecasts, and AI insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAiHistoryOpen(true)}
            className="flex items-center gap-2 py-2.5 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition duration-200 cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>AI History</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-2xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Stage 1: KPIs & Balances */}
      {stage >= 1 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent</span>
              <Coins className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatVal(dashboard?.averageDailySpending * 30 || 0)}</div>
            <p className="text-[11px] text-slate-400 mt-2">Est. monthly share spend</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Average</span>
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatVal(dashboard?.averageDailySpending || 0)}</div>
            <p className="text-[11px] text-slate-400 mt-2">Historical spending velocity</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl group-hover:bg-pink-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Largest Expense</span>
              <Layers className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatVal(dashboard?.largestExpense || 0)}</div>
            <p className="text-[11px] text-slate-400 mt-2">Your largest single split share</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Category</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white uppercase truncate">{dashboard?.largestSpendingCategory || 'N/A'}</div>
            <p className="text-[11px] text-slate-400 mt-2">Your highest spend category</p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-slate-900/40 border border-slate-800/60 h-28 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Stage 2: Charts & Rankings */}
      {stage >= 2 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Heatmap Widget */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>Daily Spending Contribution</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">GitHub-style log of daily obligation spends.</p>
              </div>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                {['month', '3months', 'year'].map(f => (
                  <button
                    key={f}
                    onClick={() => setHeatmapFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer capitalize ${heatmapFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {f === '3months' ? '3 Months' : f}
                  </button>
                ))}
              </div>
            </div>
            <HeatmapChart heatmapData={heatmap} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6">Spending Category Share</h3>
              <CategoryPieChart data={categories?.breakdown} />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6">Cash Flow (Paid vs Owed)</h3>
              {/* Simple wrapper for flow charts */}
              <CashFlowChart data={categories?.monthlyTrends} />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-6">Monthly Spending Category Trends</h3>
            <MonthlyBarChart trends={categories?.monthlyTrends} />
          </div>

          {/* Merchant Rankings */}
          <MerchantAnalyticsCard
            merchants={merchants}
            pagination={pagination}
            onPageChange={(page) => fetchMerchants({ page, limit: pagination.limit })}
            onSearchChange={(search) => fetchMerchants({ page: 1, limit: pagination.limit, search })}
            onSortChange={(sort, order) => fetchMerchants({ page: 1, limit: pagination.limit, sort, order })}
          />
        </motion.div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/60 h-64 rounded-2xl animate-pulse" />
      )}

      {/* Stage 3: AI insights & Forecast */}
      {stage >= 3 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* AI Insights & recommendations */}
          <div className="lg:col-span-2 space-y-8">
            <AISpendingInsightCard insights={insights} />
            <SavingsRecommendationCard
              recommendations={insights?.recommendations}
              anomalies={insights?.anomalies}
            />
          </div>

          {/* Forecast & budget recommendations */}
          <div className="space-y-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span>30-Day Spending Forecast</span>
              </h3>
              <ForecastChart forecast={forecast?.forecast} />
              
              <div className="mt-6 p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="font-semibold text-emerald-400">{forecast?.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trend:</span>
                  <span className="font-semibold text-white">{forecast?.trend}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Daily Average:</span>
                  <span className="font-semibold text-white">{formatCurrency(forecast?.expectedDailyAverage || 0, 'INR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Next Month:</span>
                  <span className="font-semibold text-indigo-400">{formatCurrency(forecast?.expectedMonthlySpend || 0, 'INR')}</span>
                </div>
              </div>
            </div>

            {insights?.recommendedBudgets && insights.recommendedBudgets.length > 0 && (
              <BudgetRecommendationCard
                recommendations={insights.recommendedBudgets}
                onApply={() => {}} // Populated via redirect or modal form
              />
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 h-64 rounded-2xl animate-pulse" />
          <div className="bg-slate-900/40 border border-slate-800/60 h-64 rounded-2xl animate-pulse" />
        </div>
      )}

      {/* AI History Drawer */}
      <AIHistoryDrawer
        isOpen={aiHistoryOpen}
        onClose={() => setAiHistoryOpen(false)}
        history={insightsHistory}
      />
    </div>
  );
}
