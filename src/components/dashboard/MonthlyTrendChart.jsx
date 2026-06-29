import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import EmptyState from '../ui/EmptyState';
import { BarChart3 } from 'lucide-react';

export default function MonthlyTrendChart({ data }) {
  const totalSpent = data ? data.reduce((sum, item) => sum + item.spent, 0) : 0;

  if (!data || data.length === 0 || totalSpent === 0) {
    return (
      <EmptyState
        title="Create expenses to see spending trends."
        message="Your monthly spending graph will plot here once you participate in group expenses."
        icon={BarChart3}
      />
    );
  }

  // Convert cents to dollars for chart visualization
  const chartData = data.map((item) => ({
    month: item.month,
    spent: item.spent / 100
  }));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{payload[0].payload.month}</p>
          <p className="text-sm font-bold text-slate-100 mt-1">
            Personal Spent: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.15 }} />
          <Bar dataKey="spent" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
