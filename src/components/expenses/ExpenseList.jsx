import ExpenseCard from './ExpenseCard';
import ExpenseEmptyState from '../ui/ExpenseEmptyState';

export default function ExpenseList({ expenses = [], groupId, actionButton }) {
  if (expenses.length === 0) {
    return <ExpenseEmptyState actionButton={actionButton} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} groupId={groupId} />
      ))}
    </div>
  );
}
