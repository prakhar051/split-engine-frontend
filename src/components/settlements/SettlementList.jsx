import SettlementCard from './SettlementCard';
import EmptyState from '../ui/EmptyState';
import { ArrowRightLeft } from 'lucide-react';

export default function SettlementList({ settlements = [], groupId }) {
  if (settlements.length === 0) {
    return (
      <EmptyState
        title="No optimized settlements found"
        message="Recalculate debts by clicking the Optimize button, or add some expenses to get started."
        icon={ArrowRightLeft}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {settlements.map((settlement) => (
        <SettlementCard key={settlement.id} settlement={settlement} groupId={groupId} />
      ))}
    </div>
  );
}
