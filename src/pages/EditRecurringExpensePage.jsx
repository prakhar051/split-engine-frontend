import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRecurringStore } from '../store/recurringStore';
import { useGroupStore } from '../store/groupStore';
import RecurringExpenseForm from '../components/recurring/RecurringExpenseForm';
import VersionConflictDialog from '../components/recurring/VersionConflictDialog';
import { ArrowLeft } from 'lucide-react';

export default function EditRecurringExpensePage() {
  const { groupId, templateId } = useParams();
  const navigate = useNavigate();

  const { currentGroup, getGroupDetails } = useGroupStore();
  const {
    recurringExpenses,
    getRecurringExpenses,
    updateRecurringExpense,
    isLoading,
    error,
    clearRecurringState
  } = useRecurringStore();

  const [showConflictDialog, setShowConflictDialog] = useState(false);

  useEffect(() => {
    if (!currentGroup || currentGroup.id !== groupId) {
      getGroupDetails(groupId);
    }
    getRecurringExpenses(groupId);
    clearRecurringState();
  }, [groupId, templateId, getGroupDetails, getRecurringExpenses, clearRecurringState]);

  const template = recurringExpenses.find((t) => t.id === templateId);

  const handleSubmit = async (templateData) => {
    if (!template) return;
    
    // Inject current template version for optimistic lock check
    const payload = {
      ...templateData,
      version: template.version
    };

    try {
      await updateRecurringExpense(template.id, payload);
      navigate(`/groups/${groupId}/recurring`);
    } catch (err) {
      if (err.response?.status === 409) {
        setShowConflictDialog(true);
      } else {
        console.error('Failed to update recurring expense schedule:', err);
      }
    }
  };

  const handleRefreshConflict = async () => {
    setShowConflictDialog(false);
    await getRecurringExpenses(groupId);
  };

  if (!currentGroup || !template) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div className="space-y-4">
        <Link
          to={`/groups/${groupId}/recurring`}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recurring Schedules</span>
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Edit Recurring Schedule</h1>
          <p className="text-slate-400 text-sm mt-1">
            Update schedule parameters or split rules for <span className="font-semibold text-indigo-400">"{template.title}"</span>.
          </p>
        </div>
      </div>

      <RecurringExpenseForm
        members={currentGroup.members || []}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        defaultValues={template}
      />

      {/* Optimistic Concurrency Conflict Dialog */}
      <VersionConflictDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        onRefresh={handleRefreshConflict}
      />
    </div>
  );
}
