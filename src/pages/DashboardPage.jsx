import { useEffect } from 'react';
import { useGroupStore } from '../store/groupStore';
import SummaryCards from '../components/dashboard/SummaryCards';
import CategoryBreakdownChart from '../components/dashboard/CategoryBreakdownChart';
import MonthlyTrendChart from '../components/dashboard/MonthlyTrendChart';
import { RefreshCw } from 'lucide-react';
import ErrorAlert from '../components/ui/ErrorAlert';
import ExportDropdown from '../components/ui/ExportDropdown';
import RecurringWidget from '../components/dashboard/RecurringWidget';

export default function DashboardPage() {
  const {
    dashboardSummary,
    dashboardAnalytics,
    getDashboardSummary,
    getDashboardAnalytics,
    isLoading,
    error
  } = useGroupStore();

  useEffect(() => {
    getDashboardSummary();
    getDashboardAnalytics();
  }, [getDashboardSummary, getDashboardAnalytics]);

  const handleRefresh = () => {
    getDashboardSummary(true);
    getDashboardAnalytics(true);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Dashboard</h1>
          <p className="text-slate-400 text-sm">Real-time split-expense global summary and metrics.</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <ExportDropdown />
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-50 text-sm font-semibold rounded-xl transition duration-200 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Summary Cards */}
      <SummaryCards summary={dashboardSummary} isLoading={isLoading} />

      {/* Recurring Expenses Summary Widget */}
      <RecurringWidget summary={dashboardSummary} isLoading={isLoading} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category breakdown */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Spending by Category</h3>
          <CategoryBreakdownChart data={dashboardAnalytics?.categoryBreakdown} />
        </div>

        {/* Monthly spending trends */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Monthly Spending Trends</h3>
          <MonthlyTrendChart data={dashboardAnalytics?.monthlyTrends} />
        </div>
      </div>
    </div>
  );
}
