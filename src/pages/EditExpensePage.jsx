import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useExpenseStore } from '../store/expenseStore';
import { useGroupStore } from '../store/groupStore';
import ExpenseForm from '../components/expenses/ExpenseForm';
import { ArrowLeft } from 'lucide-react';

export default function EditExpensePage() {
  const { groupId, expenseId } = useParams();
  const navigate = useNavigate();
  const { currentGroup, getGroupDetails } = useGroupStore();
  const { currentExpense, getExpense, updateExpense, isLoading, error, clearCurrentExpense } = useExpenseStore();

  useEffect(() => {
    // Prefetch group and expense details
    if (!currentGroup || currentGroup.id !== groupId) {
      getGroupDetails(groupId);
    }
    getExpense(expenseId);

    return () => {
      clearCurrentExpense();
    };
  }, [groupId, expenseId, getGroupDetails, getExpense, currentGroup, clearCurrentExpense]);

  const handleSubmit = async (payload) => {
    try {
      const updated = await updateExpense(expenseId, payload);
      if (updated) {
        navigate(`/groups/${groupId}/expenses/${expenseId}`);
      }
    } catch (err) {
      if (err.isOfflineQueue) {
        navigate(`/groups/${groupId}/expenses/${expenseId}`);
      } else {
        console.error('Failed to update expense:', err);
      }
    }
  };

  const getInitialDefaultValues = () => {
    if (!currentExpense) return {};

    const selectedParticipants = currentExpense.participants?.map((p) => p.userId) || [];
    const splits = {};
    const payers = {};

    if (currentExpense.splitType === 'EXACT') {
      currentExpense.participants?.forEach((p) => {
        splits[p.userId] = (p.shareAmount / 100).toString();
      });
    } else if (currentExpense.splitType === 'PERCENTAGE') {
      currentExpense.participants?.forEach((p) => {
        const pct = (p.shareAmount / currentExpense.amount) * 100;
        splits[p.userId] = Number(pct.toFixed(2)).toString();
      });
    } else if (currentExpense.splitType === 'SHARE') {
      currentExpense.participants?.forEach((p) => {
        splits[p.userId] = p.shareAmount.toString();
      });
    }

    if (currentExpense.splitType === 'MULTI_PAYER') {
      currentExpense.payers?.forEach((p) => {
        payers[p.userId] = (p.amount / 100).toString();
      });
    }

    return {
      title: currentExpense.title,
      amount: currentExpense.amount,
      category: currentExpense.category,
      splitType: currentExpense.splitType,
      paidById: currentExpense.paidById,
      selectedParticipants,
      splits,
      payers
    };
  };

  if (isLoading && !currentExpense) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentExpense || !currentGroup) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const defaultValues = getInitialDefaultValues();

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Navigation Header */}
      <div className="space-y-4">
        <Link
          to={`/groups/${groupId}/expenses/${expenseId}`}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expense Details</span>
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Edit Expense</h1>
          <p className="text-slate-400 text-sm mt-1">
            Update description, amount, or split rules within <span className="font-semibold text-slate-350">{currentGroup.name}</span>.
          </p>
        </div>
      </div>

      {/* Main Expense Form wrapper */}
      {Object.keys(defaultValues).length > 0 && (
        <ExpenseForm
          key={currentExpense.id}
          members={currentGroup.members || []}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          defaultValues={defaultValues}
          isEdit={true}
        />
      )}
    </div>
  );
}
