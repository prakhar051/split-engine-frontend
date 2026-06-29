import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useExpenseStore } from '../store/expenseStore';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencyBadge from '../components/currency/CurrencyBadge';
import AttachmentUploader from '../components/expenses/AttachmentUploader';
import ErrorAlert from '../components/ui/ErrorAlert';
import { Calendar, DollarSign, Tag, User, Users, Trash2, ArrowLeft, ShieldAlert, Pencil, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_LABELS = {
  GENERAL: 'General',
  FOOD: 'Food & Dining',
  TRAVEL: 'Travel & Transport',
  RENT: 'Rent & Living',
  UTILITIES: 'Utilities & Bills',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment'
};

export default function ExpenseDetailsPage() {
  const { groupId, expenseId } = useParams();
  const navigate = useNavigate();

  const currentUserId = useAuthStore((state) => state.user?.id);
  const { formatCurrency, getCurrencySymbol } = useCurrencyStore();
  const { currentGroup, getGroupDetails } = useGroupStore();
  const {
    currentExpense,
    attachments,
    isLoading,
    uploadProgress,
    error,
    getExpense,
    deleteExpense,
    uploadAttachments,
    deleteAttachment,
    clearCurrentExpense
  } = useExpenseStore();

  const [deleteExpenseModal, setDeleteExpenseModal] = useState(false);

  useEffect(() => {
    getExpense(expenseId);
    if (!currentGroup || currentGroup.id !== groupId) {
      getGroupDetails(groupId);
    }

    return () => {
      clearCurrentExpense();
    };
  }, [expenseId, groupId, getExpense, getGroupDetails, currentGroup, clearCurrentExpense]);

  const handleDeleteExpense = async () => {
    try {
      await deleteExpense(expenseId);
      setDeleteExpenseModal(false);
      navigate(`/groups/${groupId}/expenses`);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  if (isLoading && !currentExpense) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentExpense) {
    return (
      <div className="space-y-6">
        <Link to={`/groups/${groupId}/expenses`} className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expenses</span>
        </Link>
        <ErrorAlert message={error || 'Expense not found.'} />
      </div>
    );
  }

  const isOwner = currentGroup?.createdById === currentUserId;
  const isCreator = currentExpense.createdById === currentUserId;
  const canDeleteExpense = isOwner || isCreator;

  const formattedDate = new Date(currentExpense.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getSplitLabel = (type) => {
    switch (type) {
      case 'EQUAL': return 'Split Equally';
      case 'EXACT': return 'Exact Split';
      case 'PERCENTAGE': return 'Percentage Split';
      case 'SHARE': return 'Share Ratio';
      case 'MULTI_PAYER': return 'Multiple Payers';
      default: return type;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header & Nav */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Link
            to={`/groups/${groupId}/expenses`}
            className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Expenses</span>
          </Link>

          <div className="flex items-center space-x-2">
            {canDeleteExpense && (
              <Link
                to={`/groups/${groupId}/expenses/${expenseId}/edit`}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/10 border border-indigo-550/25 hover:bg-indigo-650/25 text-indigo-400 hover:text-indigo-350 text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Expense</span>
              </Link>
            )}
            {canDeleteExpense && (
              <button
                onClick={() => setDeleteExpenseModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/10 border border-rose-500/25 hover:bg-rose-600/20 text-rose-400 hover:text-rose-350 text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Expense</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">
              {currentExpense.title || currentExpense.description}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>{CATEGORY_LABELS[currentExpense.category] || currentExpense.category}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formattedDate}</span>
              </span>
            </div>
          </div>

          <div className="flex items-baseline space-x-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl shrink-0 self-start md:self-auto">
            <DollarSign className="w-5 h-5 text-indigo-400 self-center" />
            <span className="text-3xl font-black text-white">{(currentExpense.amount / 100).toFixed(currentExpense.originalCurrency === 'JPY' ? 0 : 2)}</span>
            <CurrencyBadge currency={currentExpense.originalCurrency || 'INR'} className="ml-2" />
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details & Splitting shares (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Splitting Details Summary */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Payment & Splitting ({getSplitLabel(currentExpense.splitType)})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Breakdown of who paid and how the expense was divided.</p>
            </div>

            {/* Payers Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid By</h3>
              <div className="divide-y divide-slate-800/50">
                {currentExpense.payers && currentExpense.payers.length > 0 ? (
                  currentExpense.payers.map((payer) => (
                    <div key={payer.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        {payer.user.avatar ? (
                          <img src={payer.user.avatar} alt={payer.user.name} className="w-8 h-8 rounded-full object-cover border border-slate-800" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-350">
                            {getInitials(payer.user.name)}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-slate-200 truncate">{payer.user.name}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">+{getCurrencySymbol(currentExpense.originalCurrency || 'INR')}{(payer.amount / 100).toFixed(currentExpense.originalCurrency === 'JPY' ? 0 : 2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      {currentExpense.paidBy?.avatar ? (
                        <img src={currentExpense.paidBy.avatar} alt={currentExpense.paidBy.name} className="w-8 h-8 rounded-full object-cover border border-slate-800" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-350">
                          {getInitials(currentExpense.paidBy?.name)}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-slate-200 truncate">{currentExpense.paidBy?.name}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">+{getCurrencySymbol(currentExpense.originalCurrency || 'INR')}{(currentExpense.amount / 100).toFixed(currentExpense.originalCurrency === 'JPY' ? 0 : 2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Split Participants Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shares Owed</h3>
              <div className="divide-y divide-slate-800/50">
                {currentExpense.participants?.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      {participant.user.avatar ? (
                        <img src={participant.user.avatar} alt={participant.user.name} className="w-8 h-8 rounded-full object-cover border border-slate-800" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-350">
                          {getInitials(participant.user.name)}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-slate-200 truncate">{participant.user.name}</span>
                    </div>
                    <span className="text-sm font-bold text-rose-400">-{getCurrencySymbol(currentExpense.originalCurrency || 'INR')}{(participant.shareAmount / 100).toFixed(currentExpense.originalCurrency === 'JPY' ? 0 : 2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Currency Conversion Info (shown when foreign currency) */}
            {currentExpense.originalCurrency && currentExpense.originalCurrency !== 'INR' && currentExpense.exchangeRate !== 1.0 && (
              <div className="bg-indigo-600/5 border border-indigo-500/15 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Currency Conversion</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Original: <span className="text-slate-200 font-semibold">{getCurrencySymbol(currentExpense.originalCurrency)}{(currentExpense.originalAmount / 100).toFixed(currentExpense.originalCurrency === 'JPY' ? 0 : 2)} {currentExpense.originalCurrency}</span></p>
                  <p>Rate: <span className="text-slate-200 font-semibold">1 {currentExpense.originalCurrency} = {currentExpense.exchangeRate?.toFixed(4)} INR</span></p>
                  <p>Converted: <span className="text-slate-200 font-semibold">₹{(currentExpense.convertedAmount / 100).toFixed(2)} INR</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Receipt attachments & drag uploader (col-span-1) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6 sticky top-6">
            <AttachmentUploader
              expenseId={expenseId}
              attachments={attachments}
              onUpload={uploadAttachments}
              onDelete={deleteAttachment}
              isLoading={isLoading}
              uploadProgress={uploadProgress}
              currentUserId={currentUserId}
              groupOwnerId={currentGroup?.createdById}
            />
          </div>
        </div>

      </div>

      {/* Deletion Confirmation Modal */}
      <AnimatePresence>
        {deleteExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl"
            >
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto text-rose-500 mb-2">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Delete Expense?</h3>
                <p className="text-sm text-slate-400">
                  This will permanently delete the expense and adjust all member balances accordingly. Receipts attached to this expense will be permanently removed.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteExpenseModal(false)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteExpense}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
