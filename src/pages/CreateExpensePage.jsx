import { useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useExpenseStore } from '../store/expenseStore';
import { useGroupStore } from '../store/groupStore';
import ExpenseForm from '../components/expenses/ExpenseForm';
import { ArrowLeft } from 'lucide-react';
import { deleteDraft } from '../services/offlineQueue';

export default function CreateExpensePage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentGroup, getGroupDetails } = useGroupStore();
  const { createExpense, isLoading, error, clearCurrentExpense } = useExpenseStore();

  useEffect(() => {
    // Prefetch group details to get group name and member rosters
    if (!currentGroup || currentGroup.id !== groupId) {
      getGroupDetails(groupId);
    }
  }, [groupId, getGroupDetails, currentGroup]);

  const handleSubmit = async (payload) => {
    // Inject the groupId
    const payloadWithGroup = {
      ...payload,
      groupId
    };

    try {
      const createdExpense = await createExpense(payloadWithGroup);
      if (createdExpense && createdExpense.id) {
        // Clear old details and redirect to expense details view
        clearCurrentExpense();
        await deleteDraft('expense-form-draft');
        navigate(`/groups/${groupId}/expenses/${createdExpense.id}`);
      }
    } catch (err) {
      if (err.isOfflineQueue) {
        clearCurrentExpense();
        await deleteDraft('expense-form-draft');
        navigate(`/groups/${groupId}/expenses`);
      } else {
        console.error('Failed to create expense:', err);
      }
    }
  };

  if (!currentGroup) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const ocrResult = location.state?.ocrResult;
  const defaultValues = ocrResult ? {
    title: ocrResult.title || '',
    amount: ocrResult.amount || 0,
    date: ocrResult.date || '',
    category: ocrResult.category || 'GENERAL',
    currency: ocrResult.currency || 'USD'
  } : {};

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Navigation Header */}
      <div className="space-y-4">
        <Link
          to={`/groups/${groupId}/expenses`}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expenses</span>
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Create New Expense</h1>
          <p className="text-slate-400 text-sm mt-1">
            Log a payment and divide cost shares within <span className="font-semibold text-slate-350">{currentGroup.name}</span>.
          </p>
        </div>
      </div>

      {/* Main Expense Form wrapper */}
      <ExpenseForm
        members={currentGroup.members || []}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        defaultValues={defaultValues}
      />
    </div>
  );
}
