import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSettlementStore } from '../store/settlementStore';
import { useGroupStore } from '../store/groupStore';
import BalanceSummary from '../components/settlements/BalanceSummary';
import GenerateSettlementButton from '../components/settlements/GenerateSettlementButton';
import SettlementHistory from '../components/settlements/SettlementHistory';
import ErrorAlert from '../components/ui/ErrorAlert';
import { ArrowLeft } from 'lucide-react';

export default function SettlementsPage() {
  const { groupId } = useParams();
  const { currentGroup, getGroupDetails } = useGroupStore();
  const {
    balances,
    settlements,
    isLoading,
    error,
    getBalances,
    getSettlements,
    generateSettlements
  } = useSettlementStore();

  useEffect(() => {
    // Prefetch group details, balances, and settlements
    getBalances(groupId);
    getSettlements(groupId);
    if (!currentGroup || currentGroup.id !== groupId) {
      getGroupDetails(groupId);
    }
  }, [groupId, getBalances, getSettlements, getGroupDetails, currentGroup]);

  return (
    <div className="space-y-8 font-sans">
      {/* Navigation Header */}
      <div className="space-y-4">
        <Link
          to={`/groups/${groupId}`}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {currentGroup?.name || 'Group'} Details</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">Settlement Center</h1>
            <p className="text-slate-400 text-sm">
              View your net balances, optimized repayments, and record payment proofs.
            </p>
          </div>
          <div className="self-start sm:self-auto">
            <GenerateSettlementButton
              groupId={groupId}
              onGenerate={generateSettlements}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Balance Summary Display */}
      {isLoading && balances.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <BalanceSummary balances={balances} />
      )}

      {/* Repayments History */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-white">Group Repayments Feed</h2>
        {isLoading && settlements.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <SettlementHistory settlements={settlements} groupId={groupId} />
        )}
      </div>
    </div>
  );
}
