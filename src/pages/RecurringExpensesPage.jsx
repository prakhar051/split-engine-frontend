import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecurringStore } from '../store/recurringStore';
import { useGroupStore } from '../store/groupStore';
import RecurringExpenseList from '../components/recurring/RecurringExpenseList';
import DeleteRecurringModal from '../components/recurring/DeleteRecurringModal';
import VersionConflictDialog from '../components/recurring/VersionConflictDialog';
import ErrorAlert from '../components/ui/ErrorAlert';
import { ArrowLeft, Plus, Settings, Heart, BarChart3, Clock } from 'lucide-react';

export default function RecurringExpensesPage() {
  const { groupId } = useParams();
  
  // Stores
  const { currentGroup, getGroupDetails } = useGroupStore();
  const {
    recurringExpenses,
    getRecurringExpenses,
    toggleRecurringExpense,
    deleteRecurringExpense,
    runNow,
    health,
    getHealth,
    metrics,
    getMetrics,
    isLoading: storeLoading,
    error: storeError
  } = useRecurringStore();

  // Local state
  const [deleteTemplate, setDeleteTemplate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [runningId, setRunningId] = useState(null);
  const [showStatsTab, setShowStatsTab] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!currentGroup || currentGroup.id !== groupId) {
      getGroupDetails(groupId);
    }
    getRecurringExpenses(groupId);
    getHealth();
    getMetrics();
  }, [groupId, getGroupDetails, getRecurringExpenses, getHealth, getMetrics]);

  const handleToggle = async (id, isActive) => {
    setTogglingId(id);
    setErrorMessage(null);
    try {
      await toggleRecurringExpense(id, isActive);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to toggle template status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleRun = async (id, advanceSchedule) => {
    setRunningId(id);
    setErrorMessage(null);
    try {
      await runNow(id, advanceSchedule);
      // Reload stats/metrics and group details to update balances
      getHealth();
      getMetrics();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to trigger run now execution');
    } finally {
      setRunningId(null);
    }
  };

  const handleOpenDelete = (template) => {
    setDeleteTemplate(template);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTemplate) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteRecurringExpense(deleteTemplate.id);
      setShowDeleteModal(false);
      setDeleteTemplate(null);
      getHealth();
      getMetrics();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentGroup) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-slate-200">
      
      {/* Header navigations */}
      <div className="space-y-4">
        <Link
          to={`/groups/${groupId}`}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {currentGroup.name}</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">Automated Recurring Expenses</h1>
            <p className="text-slate-400 text-sm">
              Manage automatic recurring schedules inside <span className="font-semibold text-slate-300">{currentGroup.name}</span>.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setShowStatsTab(!showStatsTab)}
              className="flex items-center space-x-1.5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {showStatsTab ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>View Schedules</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Scheduler Diagnostics</span>
                </>
              )}
            </button>

            <Link
              to={`/groups/${groupId}/recurring/new`}
              className="flex items-center space-x-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      {(storeError || errorMessage) && (
        <ErrorAlert message={errorMessage || storeError} />
      )}

      {/* Conditional Rendering: Stats Dashboard vs Schedules list */}
      {showStatsTab ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Health Diagnostics card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Heart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">System Health Status</h3>
            </div>
            
            {health ? (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center bg-slate-950/40 p-3 border border-slate-850 rounded-xl">
                  <span className="text-slate-400">Scheduler Engine Status:</span>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse">
                    ● Running
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Scheduler Uptime:</span>
                  <span className="font-semibold text-slate-300">{health.uptime} seconds</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Active Schedules:</span>
                  <span className="font-semibold text-slate-300">{health.activeTemplates} templates</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Pending Execution Queue:</span>
                  <span className="font-semibold text-slate-300">{health.pendingTemplates} pending</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Last Successful Cycle:</span>
                  <span className="font-semibold text-slate-350">
                    {health.lastSuccessfulRun ? new Date(health.lastSuccessfulRun).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Server Component Version:</span>
                  <span className="font-semibold text-slate-300">{health.serverVersion}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No health metrics collected.</p>
            )}
          </div>

          {/* Performance Metrics card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Execution Metrics Overview</h3>
            </div>
            
            {metrics ? (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Total processed ticks:</span>
                  <span className="font-semibold text-slate-300">{metrics.totalProcessed}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Successful executions count:</span>
                  <span className="font-semibold text-emerald-400">{metrics.successfulRuns}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Failed executions count:</span>
                  <span className="font-semibold text-rose-400">{metrics.failedRuns}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Skipped cycles:</span>
                  <span className="font-semibold text-amber-500">{metrics.skippedRuns}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-slate-500">Average execution duration:</span>
                  <span className="font-semibold text-slate-300">{Math.round(metrics.averageExecutionTime)} ms</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Manual retry count:</span>
                  <span className="font-semibold text-slate-355">{metrics.retriesPerformed} attempts</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No performance metrics collected.</p>
            )}
          </div>

        </div>
      ) : (
        <div className="space-y-6">
          {storeLoading && recurringExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500">Loading recurring schedules list...</p>
            </div>
          ) : (
            <RecurringExpenseList
              templates={recurringExpenses}
              groupId={groupId}
              onToggle={handleToggle}
              onRun={handleRun}
              onDelete={handleOpenDelete}
              isToggling={togglingId !== null}
              isRunning={runningId !== null}
            />
          )}
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      <DeleteRecurringModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTemplate(null);
        }}
        onConfirm={handleConfirmDelete}
        templateTitle={deleteTemplate ? deleteTemplate.title : ''}
        isLoading={isDeleting}
      />
    </div>
  );
}
