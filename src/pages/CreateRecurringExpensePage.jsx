import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRecurringStore } from '../store/recurringStore';
import { useGroupStore } from '../store/groupStore';
import RecurringExpenseForm from '../components/recurring/RecurringExpenseForm';
import { ArrowLeft } from 'lucide-react';

export default function CreateRecurringExpensePage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const { currentGroup, getGroupDetails } = useGroupStore();
  const { createRecurringExpense, isLoading, error, clearRecurringState } = useRecurringStore();

  useEffect(() => {
    if (!currentGroup || currentGroup.id !== groupId) {
      getGroupDetails(groupId);
    }
    clearRecurringState();
  }, [groupId, getGroupDetails, currentGroup, clearRecurringState]);

  const handleSubmit = async (templateData) => {
    try {
      await createRecurringExpense(groupId, templateData);
      navigate(`/groups/${groupId}/recurring`);
    } catch (err) {
      console.error('Failed to create recurring expense schedule:', err);
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
          <h1 className="text-3xl font-black tracking-tight text-white">Create Recurring Expense</h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure a recurring payment schedule that splits costs automatically among <span className="font-semibold text-slate-350">{currentGroup.name}</span> members.
          </p>
        </div>
      </div>

      <RecurringExpenseForm
        members={currentGroup.members || []}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
