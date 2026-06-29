import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSettlementStore } from '../store/settlementStore';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import SettlementStatusBadge from '../components/settlements/SettlementStatusBadge';
import SettlementProofUploader from '../components/settlements/SettlementProofUploader';
import SettlementProofViewer from '../components/settlements/SettlementProofViewer';
import ErrorAlert from '../components/ui/ErrorAlert';
import { ArrowLeft, DollarSign, UserCheck, AlertTriangle, HelpCircle } from 'lucide-react';

export default function SettlementDetailsPage() {
  const { groupId, settlementId } = useParams();
  const navigate = useNavigate();

  const currentUserId = useAuthStore((state) => state.user?.id);
  const { currentGroup, getGroupDetails } = useGroupStore();
  const {
    settlements,
    getSettlements,
    uploadProof,
    updateSettlementStatus,
    isLoading,
    uploadProgress,
    error,
    clearSettlementState
  } = useSettlementStore();

  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    getSettlements(groupId);
    if (!currentGroup || currentGroup.id !== groupId) {
      getGroupDetails(groupId);
    }
    return () => {
      clearSettlementState();
    };
  }, [groupId, getSettlements, getGroupDetails, currentGroup, clearSettlementState]);

  // Find target settlement from state list
  const settlement = settlements.find((s) => s.id === settlementId);

  const handleStatusUpdate = async (status) => {
    setLocalError(null);
    try {
      await updateSettlementStatus(settlementId, status);
    } catch (err) {
      setLocalError(err.response?.data?.message || `Failed to mark settlement as ${status}`);
    }
  };

  const handleProofUpload = async (id, file) => {
    setLocalError(null);
    try {
      await uploadProof(id, file);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to upload proof image');
    }
  };

  if (isLoading && !settlement) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="space-y-6">
        <Link to={`/groups/${groupId}/settlements`} className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settlements</span>
        </Link>
        <ErrorAlert message={error || 'Settlement record not found.'} />
      </div>
    );
  }

  const amountDollars = (settlement.amount / 100).toFixed(2);
  const isPayer = currentUserId === settlement.payer?.id;
  const isPayee = currentUserId === settlement.payee?.id;
  const isPending = settlement.status === 'PENDING';

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Header Navigation */}
      <div className="space-y-4">
        <Link
          to={`/groups/${groupId}/settlements`}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settlements</span>
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Settlement Details</h1>
          <p className="text-slate-400 text-sm mt-1">
            Repayment transaction inside <span className="font-semibold text-slate-350">{currentGroup?.name || 'Group'}</span>.
          </p>
        </div>
      </div>

      {/* Error Displays */}
      {(localError || error) && <ErrorAlert message={localError || error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Repayment Details (Col-span-2) */}
        <div className="md:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Repayment Status</span>
              <SettlementStatusBadge status={settlement.status} />
            </div>

            <div className="flex items-baseline space-x-0.5 px-4 py-2 bg-slate-950 border border-slate-850 rounded-xl shrink-0">
              <DollarSign className="w-4 h-4 text-indigo-400 self-center" />
              <span className="text-2xl font-black text-white">{amountDollars}</span>
              <span className="text-[10px] text-slate-500 font-bold ml-1">USD</span>
            </div>
          </div>

          {/* Members flows */}
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-slate-955/50 border border-slate-850 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Debtor (Sending Money)</span>
                <span className="text-sm font-bold text-slate-200">{settlement.payer?.name}</span>
              </div>
              <div className="border-t border-slate-800/40"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Creditor (Receiving Money)</span>
                <span className="text-sm font-bold text-slate-200">{settlement.payee?.name}</span>
              </div>
            </div>
          </div>

          {/* Creditor Action Section */}
          {isPayee && isPending && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-indigo-950/10 border border-indigo-900/30 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Verify Payment Received</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  As the creditor, please review the payment proof uploaded by the debtor. Once confirmed, approve the settlement.
                </p>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => handleStatusUpdate('DISPUTED')}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Dispute Payment</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('PAID')}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Confirm Received</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Non-authorized information notice */}
          {!isPayer && !isPayee && (
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-slate-500 text-xs flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 shrink-0 text-slate-650" />
              <span>You are viewing a repayment transaction. Repayments can only be updated by the participating debtor and creditor.</span>
            </div>
          )}
        </div>

        {/* Right Card: Upload Zone & Viewer (Col-span-1) */}
        <div className="md:col-span-1 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md h-fit space-y-6">
          {/* Uploader (Debtors only, if not PAID) */}
          {isPayer && settlement.status !== 'PAID' && (
            <SettlementProofUploader
              settlementId={settlementId}
              onUpload={handleProofUpload}
              isLoading={isLoading}
              uploadProgress={uploadProgress}
            />
          )}

          {/* Viewer (Always visible if proofUrl exists) */}
          {settlement.proofUrl ? (
            <SettlementProofViewer proofUrl={settlement.proofUrl} />
          ) : (
            !isPayer && (
              <div className="text-center py-6 text-slate-550 space-y-1">
                <p className="text-xs font-semibold">No payment proof uploaded yet.</p>
                <p className="text-[10px] text-slate-600">Waiting for {settlement.payer?.name} to send screenshots.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
