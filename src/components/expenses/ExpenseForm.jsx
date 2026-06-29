import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCurrencyStore } from '../../store/currencyStore';
import CategorySelector from './CategorySelector';
import CurrencySelector from '../currency/CurrencySelector';
import EqualSplitForm from './EqualSplitForm';
import ExactSplitForm from './ExactSplitForm';
import PercentageSplitForm from './PercentageSplitForm';
import ShareSplitForm from './ShareSplitForm';
import MultiPayerForm from './MultiPayerForm';
import ExpenseErrorAlert from '../ui/ExpenseErrorAlert';
import OCRScannerModal from '../ocr/OCRScannerModal';
import { Cpu } from 'lucide-react';
import { getDraft, saveDraft, deleteDraft } from '../../services/offlineQueue';

export default function ExpenseForm({
  members,
  onSubmit,
  isLoading,
  error: apiError,
  defaultValues = {},
  isEdit = false
}) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { supportedCurrencies, getCurrencySymbol, initialize: initCurrency } = useCurrencyStore();

  // Initialize currency store
  useEffect(() => {
    if (supportedCurrencies.length === 0) initCurrency();
  }, [supportedCurrencies.length, initCurrency]);

  // Form Fields
  const [merchant, setMerchant] = useState(defaultValues.merchant || '');
  const [title, setTitle] = useState(defaultValues.title || '');
  const [amount, setAmount] = useState(defaultValues.amount ? (defaultValues.amount / 100).toString() : '');
  const [category, setCategory] = useState(defaultValues.category || 'GENERAL');
  const [splitType, setSplitType] = useState(defaultValues.splitType || 'EQUAL');
  const [paidById, setPaidById] = useState(defaultValues.paidById || currentUserId || '');
  const [date, setDate] = useState(defaultValues.date || new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState(defaultValues.originalCurrency || 'INR');
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);

  // Draft recovery states
  const [draftData, setDraftData] = useState(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // Split States
  const [selectedParticipants, setSelectedParticipants] = useState(defaultValues.selectedParticipants || []);
  const [splits, setSplits] = useState(defaultValues.splits || {});
  const [payers, setPayers] = useState(defaultValues.payers || {});

  // Local Validation Error
  const [localError, setLocalError] = useState(null);

  // Load draft on mount (only if not editing)
  useEffect(() => {
    if (isEdit) return;

    getDraft('expense-form-draft').then((draft) => {
      if (draft && draft.data) {
        const d = draft.data;
        if (d.title || d.merchant || d.amount) {
          setDraftData(d);
          setShowRestorePrompt(true);
        }
      }
    });
  }, [isEdit]);

  const handleRestoreDraft = () => {
    if (!draftData) return;
    if (draftData.merchant !== undefined) setMerchant(draftData.merchant);
    if (draftData.title !== undefined) setTitle(draftData.title);
    if (draftData.amount !== undefined) setAmount(draftData.amount);
    if (draftData.category !== undefined) setCategory(draftData.category);
    if (draftData.splitType !== undefined) setSplitType(draftData.splitType);
    if (draftData.paidById !== undefined) setPaidById(draftData.paidById);
    if (draftData.date !== undefined) setDate(draftData.date);
    if (draftData.selectedParticipants !== undefined) setSelectedParticipants(draftData.selectedParticipants);
    if (draftData.splits !== undefined) setSplits(draftData.splits);
    if (draftData.payers !== undefined) setPayers(draftData.payers);

    setShowRestorePrompt(false);
  };

  const handleDiscardDraft = async () => {
    await deleteDraft('expense-form-draft');
    setShowRestorePrompt(false);
    setDraftData(null);
  };

  // 5-second interval timer for autosave (only if not editing)
  useEffect(() => {
    if (isEdit) return;

    const interval = setInterval(async () => {
      if (title || merchant || amount) {
        await saveDraft('expense-form-draft', {
          merchant,
          title,
          amount,
          category,
          splitType,
          paidById,
          date,
          selectedParticipants,
          splits,
          payers
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [
    isEdit,
    merchant,
    title,
    amount,
    category,
    splitType,
    paidById,
    date,
    selectedParticipants,
    splits,
    payers
  ]);

  const handleApplyOCR = (ocrData) => {
    if (ocrData.title) setTitle(ocrData.title);
    if (ocrData.amount) setAmount((ocrData.amount / 100).toString());
    if (ocrData.date) setDate(ocrData.date);
    if (ocrData.category) setCategory(ocrData.category);
    if (ocrData.merchant) setMerchant(ocrData.merchant);
  };

  // Initialize participants
  useEffect(() => {
    if (members && members.length > 0) {
      if (!defaultValues.selectedParticipants || defaultValues.selectedParticipants.length === 0) {
        // Default select all members as participants
        const memberIds = members.map((m) => m.user.id);
        setSelectedParticipants(memberIds);
      } else {
        setSelectedParticipants(defaultValues.selectedParticipants);
      }

      if (defaultValues.splits) {
        setSplits(defaultValues.splits);
      }
      if (defaultValues.payers) {
        setPayers(defaultValues.payers);
      }

      // Default paidById
      const memberIds = members.map((m) => m.user.id);
      const hasCurrentUser = memberIds.includes(currentUserId);
      if (!paidById) {
        if (defaultValues.paidById) {
          setPaidById(defaultValues.paidById);
        } else if (hasCurrentUser) {
          setPaidById(currentUserId);
        } else if (memberIds.length > 0) {
          setPaidById(memberIds[0]);
        }
      }
    }
  }, [members, currentUserId, paidById, defaultValues]);

  // Handle participant toggle
  const handleToggleParticipant = (userId) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Handle updates to split ratios
  const handleUpdateSplit = (userId, value) => {
    setSplits((prev) => ({
      ...prev,
      [userId]: value
    }));
  };

  // Handle updates to payer contributions
  const handleTogglePayer = (userId) => {
    setPayers((prev) => {
      const updated = { ...prev };
      if (userId in updated) {
        delete updated[userId];
      } else {
        updated[userId] = '';
      }
      return updated;
    });
  };

  const handleUpdatePayer = (userId, value) => {
    setPayers((prev) => ({
      ...prev,
      [userId]: value
    }));
  };

  const validateForm = () => {
    setLocalError(null);

    if (!title || title.trim().length < 3 || title.trim().length > 100) {
      setLocalError('Title is required and must be between 3 and 100 characters.');
      return false;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setLocalError('Amount must be a positive number greater than 0.');
      return false;
    }

    if (selectedParticipants.length === 0) {
      setLocalError('At least one participant is required to split the expense.');
      return false;
    }

    // Split specific validations
    if (splitType === 'EXACT') {
      const sum = selectedParticipants.reduce((acc, id) => acc + (parseFloat(splits[id]) || 0), 0);
      if (Math.abs(sum - amountNum) > 0.009) {
        setLocalError(`The sum of exact shares ($${sum.toFixed(2)}) must equal the total expense amount ($${amountNum.toFixed(2)}).`);
        return false;
      }
    }

    if (splitType === 'PERCENTAGE') {
      const sum = selectedParticipants.reduce((acc, id) => acc + (parseFloat(splits[id]) || 0), 0);
      if (Math.abs(sum - 100) > 0.09) {
        setLocalError(`The sum of percentages (${sum.toFixed(1)}%) must equal exactly 100%.`);
        return false;
      }
      for (const id of selectedParticipants) {
        const val = parseFloat(splits[id]) || 0;
        if (val <= 0) {
          setLocalError('Each percentage share must be greater than 0.');
          return false;
        }
      }
    }

    if (splitType === 'SHARE') {
      for (const id of selectedParticipants) {
        const val = parseInt(splits[id], 10) || 0;
        if (val <= 0 || isNaN(val)) {
          setLocalError('Each participant share count must be an integer greater than zero.');
          return false;
        }
      }
    }

    if (splitType === 'MULTI_PAYER') {
      const payerIds = Object.keys(payers);
      if (payerIds.length === 0) {
        setLocalError('At least one payer must be selected with an amount for MULTI_PAYER splits.');
        return false;
      }
      const sum = payerIds.reduce((acc, id) => acc + (parseFloat(payers[id]) || 0), 0);
      if (Math.abs(sum - amountNum) > 0.009) {
        setLocalError(`The sum of payer payments ($${sum.toFixed(2)}) must equal the total expense amount ($${amountNum.toFixed(2)}).`);
        return false;
      }
      for (const id of payerIds) {
        const val = parseFloat(payers[id]) || 0;
        if (val <= 0) {
          setLocalError('Payer amounts must be positive numbers greater than 0.');
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Convert values to cents prior to API call
    const amountCents = Math.round(parseFloat(amount) * 100);

    const payload = {
      title: title.trim(),
      amount: amountCents,
      originalCurrency: currency,
      category,
      splitType,
      date,
      participants: selectedParticipants.map((userId) => {
        const pObj = { userId };
        if (splitType === 'EXACT') {
          pObj.amount = Math.round(parseFloat(splits[userId]) * 100);
        } else if (splitType === 'PERCENTAGE') {
          pObj.percentage = parseFloat(splits[userId]);
        } else if (splitType === 'SHARE') {
          pObj.shares = parseInt(splits[userId], 10);
        }
        return pObj;
      })
    };

    if (splitType === 'MULTI_PAYER') {
      payload.payers = Object.keys(payers).map((userId) => ({
        userId,
        amount: Math.round(parseFloat(payers[userId]) * 100)
      }));
      payload.paidById = null;
    } else {
      payload.paidById = paidById;
    }

    onSubmit(payload);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Displays */}
      <ExpenseErrorAlert error={localError || apiError} />

      {showRestorePrompt && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-500/5 animate-fade-in">
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-white">Draft Found:</span> We found an unsaved draft from your last session.
          </div>
          <div className="flex gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3.5 py-1.5 border border-slate-700 hover:border-slate-650 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition duration-150 cursor-pointer"
            >
              Discard Draft
            </button>
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-900/30 transition duration-150 cursor-pointer"
            >
              Restore Draft
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
        
        {/* Section Header with Scan Action */}
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expense Details</h3>
          <button
            type="button"
            onClick={() => setIsOCRModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/25 hover:bg-indigo-650/20 text-indigo-400 hover:text-indigo-350 text-[10px] font-bold uppercase tracking-wider rounded-xl transition duration-155 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Scan Receipt</span>
          </button>
        </div>

        {/* Basic Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Merchant */}
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Merchant</label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Starbucks, Uber"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
            />
          </div>
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title-input" className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Expense Title</label>
            <input
              id="title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pizza Night, Uber Ride"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label htmlFor="amount-input" className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Amount ({currency})</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 text-sm">{getCurrencySymbol(currency)}</span>
              <input
                id="amount-input"
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Transaction Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
            />
          </div>
        </div>

        {/* Category, Currency & Split Type selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category */}
          <CategorySelector value={category} onChange={setCategory} />

          {/* Currency */}
          <CurrencySelector
            value={currency}
            onChange={setCurrency}
            currencies={supportedCurrencies.length > 0 ? supportedCurrencies : ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'AED']}
            label="Currency"
          />

          {/* Split Type */}
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Split Strategy</label>
            <select
              value={splitType}
              onChange={(e) => {
                setSplitType(e.target.value);
                setSplits({});
                setPayers({});
              }}
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
            >
              <option value="EQUAL">Split Equally</option>
              <option value="EXACT">Split by Exact Amounts</option>
              <option value="PERCENTAGE">Split by Percentages</option>
              <option value="SHARE">Split by Share Ratios</option>
              <option value="MULTI_PAYER">Multiple Payers</option>
            </select>
          </div>
        </div>

        {/* Payer Selection (Single Payer only) */}
        {splitType !== 'MULTI_PAYER' && (
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Who Paid?</label>
            <select
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
            >
              {members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.name} ({member.user.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Dynamic Sub-forms based on splitting rules */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        {splitType === 'EQUAL' && (
          <EqualSplitForm
            members={members}
            selectedParticipants={selectedParticipants}
            onToggleParticipant={handleToggleParticipant}
            totalAmount={amount}
          />
        )}

        {splitType === 'EXACT' && (
          <ExactSplitForm
            members={members}
            selectedParticipants={selectedParticipants}
            onToggleParticipant={handleToggleParticipant}
            splits={splits}
            onUpdateSplit={handleUpdateSplit}
            totalAmount={amount}
          />
        )}

        {splitType === 'PERCENTAGE' && (
          <PercentageSplitForm
            members={members}
            selectedParticipants={selectedParticipants}
            onToggleParticipant={handleToggleParticipant}
            splits={splits}
            onUpdateSplit={handleUpdateSplit}
            totalAmount={amount}
          />
        )}

        {splitType === 'SHARE' && (
          <ShareSplitForm
            members={members}
            selectedParticipants={selectedParticipants}
            onToggleParticipant={handleToggleParticipant}
            splits={splits}
            onUpdateSplit={handleUpdateSplit}
            totalAmount={amount}
          />
        )}

        {splitType === 'MULTI_PAYER' && (
          <div className="space-y-6">
            <MultiPayerForm
              members={members}
              payers={payers}
              onTogglePayer={handleTogglePayer}
              onUpdatePayer={handleUpdatePayer}
              totalAmount={amount}
            />
            <EqualSplitForm
              members={members}
              selectedParticipants={selectedParticipants}
              onToggleParticipant={handleToggleParticipant}
              totalAmount={amount}
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-indigo-500/10 cursor-pointer text-sm"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Saving Expense...</span>
          </div>
        ) : (
          <span>{defaultValues.title ? 'Save Changes' : 'Create Expense'}</span>
        )}
      </button>

      {/* Reusable OCR Scanner Modal */}
      <OCRScannerModal
        isOpen={isOCRModalOpen}
        onClose={() => setIsOCRModalOpen(false)}
        onApply={handleApplyOCR}
      />
    </form>
  );
}
