import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRecurringStore } from '../../store/recurringStore';
import RecurrenceSelector from './RecurrenceSelector';
import CategorySelector from '../expenses/CategorySelector';
import EqualSplitForm from '../expenses/EqualSplitForm';
import ExactSplitForm from '../expenses/ExactSplitForm';
import PercentageSplitForm from '../expenses/PercentageSplitForm';
import ShareSplitForm from '../expenses/ShareSplitForm';
import MultiPayerForm from '../expenses/MultiPayerForm';
import ExpenseErrorAlert from '../ui/ExpenseErrorAlert';
import { Calendar, Eye, HelpCircle } from 'lucide-react';

export default function RecurringExpenseForm({
  members,
  onSubmit,
  isLoading,
  error: apiError,
  defaultValues = {}
}) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const previewDates = useRecurringStore((state) => state.previewDates);
  const previews = useRecurringStore((state) => state.previews);

  // Recurrence Config States
  const [recurrenceType, setRecurrenceType] = useState(defaultValues.recurrenceType || 'MONTHLY');
  const [interval, setIntervalValue] = useState(defaultValues.interval || 1);
  const [startDate, setStartDate] = useState(
    defaultValues.startDate
      ? new Date(defaultValues.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    defaultValues.endDate ? new Date(defaultValues.endDate).toISOString().split('T')[0] : ''
  );
  const [isActive, setIsActive] = useState(defaultValues.isActive !== undefined ? defaultValues.isActive : true);

  // Expense Base Fields (to go into payload + root level)
  const [title, setTitle] = useState(defaultValues.title || '');
  const [description, setDescription] = useState(defaultValues.description || '');
  const [amount, setAmount] = useState(
    defaultValues.amount ? (defaultValues.amount / 100).toString() : ''
  );
  const [category, setCategory] = useState(defaultValues.category || 'GENERAL');
  const [splitType, setSplitType] = useState(defaultValues.splitType || 'EQUAL');
  
  // Extract details from nested payload if present
  const payloadData = defaultValues.payload || {};
  const [paidById, setPaidById] = useState(payloadData.paidById || currentUserId || '');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [splits, setSplits] = useState({});
  const [payers, setPayers] = useState({});
  
  // Local Validation Error
  const [localError, setLocalError] = useState(null);

  // Update schedule preview on config change
  useEffect(() => {
    if (recurrenceType && interval >= 1 && startDate) {
      previewDates(recurrenceType, interval, startDate);
    }
  }, [recurrenceType, interval, startDate, previewDates]);

  // Initialize participants from payload or default members
  useEffect(() => {
    if (members && members.length > 0) {
      const payloadParticipants = payloadData.participants || [];
      if (payloadParticipants.length > 0) {
        setSelectedParticipants(payloadParticipants.map((p) => p.userId));
        
        // Populate splits from payload
        const initialSplits = {};
        payloadParticipants.forEach((p) => {
          if (splitType === 'EXACT' && p.amount !== undefined) {
            initialSplits[p.userId] = (p.amount / 100).toString();
          } else if (splitType === 'PERCENTAGE' && p.percentage !== undefined) {
            initialSplits[p.userId] = p.percentage.toString();
          } else if (splitType === 'SHARE' && p.shares !== undefined) {
            initialSplits[p.userId] = p.shares.toString();
          }
        });
        setSplits(initialSplits);
      } else {
        // Select all members by default
        setSelectedParticipants(members.map((m) => m.user.id));
      }

      // Populate payers for MULTI_PAYER
      const payloadPayers = payloadData.payers || [];
      if (payloadPayers.length > 0) {
        const initialPayers = {};
        payloadPayers.forEach((p) => {
          initialPayers[p.userId] = (p.amount / 100).toString();
        });
        setPayers(initialPayers);
      }

      // Populate paidById
      const memberIds = members.map((m) => m.user.id);
      const hasCurrentUser = memberIds.includes(currentUserId);
      if (!paidById) {
        if (payloadData.paidById) {
          setPaidById(payloadData.paidById);
        } else if (hasCurrentUser) {
          setPaidById(currentUserId);
        } else if (memberIds.length > 0) {
          setPaidById(memberIds[0]);
        }
      }
    }
  }, [members, currentUserId, defaultValues]);

  // Handle participant toggles
  const handleToggleParticipant = (userId) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleUpdateSplit = (userId, value) => {
    setSplits((prev) => ({
      ...prev,
      [userId]: value
    }));
  };

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

    if (!startDate) {
      setLocalError('Start date is required.');
      return false;
    }

    if (endDate && new Date(endDate) <= new Date(startDate)) {
      setLocalError('End date must be after the start date.');
      return false;
    }

    if (selectedParticipants.length === 0) {
      setLocalError('At least one participant is required to split the expense.');
      return false;
    }

    // Split validations
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
        if ((parseFloat(splits[id]) || 0) <= 0) {
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
        setLocalError('At least one payer must be selected for MULTI_PAYER splits.');
        return false;
      }
      const sum = payerIds.reduce((acc, id) => acc + (parseFloat(payers[id]) || 0), 0);
      if (Math.abs(sum - amountNum) > 0.009) {
        setLocalError(`The sum of payer payments ($${sum.toFixed(2)}) must equal the total expense amount ($${amountNum.toFixed(2)}).`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const amountCents = Math.round(parseFloat(amount) * 100);

    // Build core expense payload
    const expensePayload = {
      title: title.trim(),
      amount: amountCents,
      category,
      splitType,
      date: startDate, // Set default date to template start
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
      expensePayload.payers = Object.keys(payers).map((userId) => ({
        userId,
        amount: Math.round(parseFloat(payers[userId]) * 100)
      }));
      expensePayload.paidById = null;
    } else {
      expensePayload.paidById = paidById;
    }

    // Build root template payload
    const templateData = {
      title: title.trim(),
      description: description.trim() || null,
      amount: amountCents,
      category,
      splitType,
      recurrenceType,
      interval: parseInt(interval, 10),
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      isActive,
      payload: expensePayload
    };

    onSubmit(templateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-200">
      <ExpenseErrorAlert error={localError || apiError} />

      {/* Recurrence Schedule block */}
      <RecurrenceSelector
        recurrenceType={recurrenceType}
        setRecurrenceType={setRecurrenceType}
        interval={interval}
        setIntervalValue={setIntervalValue}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Execution Previews Container */}
      {previews && previews.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eye className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Execution Preview</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {previews.map((item, idx) => (
              <div key={idx} className="bg-slate-950/50 border border-slate-850 rounded-xl p-3 flex flex-col justify-between space-y-2">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.month}</p>
                  <p className="text-sm font-black text-white">{new Date(item.date).getUTCDate()}</p>
                  <p className="text-[9px] text-slate-400 font-medium">{item.weekday}</p>
                </div>
                <div className="pt-1.5 border-t border-slate-850 text-[9px] text-indigo-400 font-semibold">
                  {item.daysRemaining === 0 ? 'Today' : `${item.daysRemaining} days remaining`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Base Expense Info */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="border-b border-slate-800/80 pb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expense Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Expense Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Netflix Subscription, Office Rent"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 text-sm">$</span>
              <input
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

          {/* Category Selector */}
          <CategorySelector value={category} onChange={setCategory} />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add schedule details, billing notes, etc."
            rows="2"
            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Paid By (Single Payer) */}
          {splitType !== 'MULTI_PAYER' && (
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Who Pays?</label>
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
      </div>

      {/* Splitting shares details */}
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

      {/* Form Submission */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-indigo-500/10 cursor-pointer text-sm"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Saving Schedule...</span>
          </div>
        ) : (
          <span>{defaultValues.id ? 'Save Changes' : 'Create Recurring Schedule'}</span>
        )}
      </button>
    </form>
  );
}
