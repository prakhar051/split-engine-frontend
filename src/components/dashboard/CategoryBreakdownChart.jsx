import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import EmptyState from '../ui/EmptyState';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = {
  FOOD: '#3b82f6',
  TRAVEL: '#f59e0b',
  RENT: '#10b981',
  UTILITIES: '#ec4899',
  SHOPPING: '#8b5cf6',
  ENTERTAINMENT: '#f43f5e',
  GENERAL: '#64748b'
};

export default function CategoryBreakdownChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No spending data available yet."
        message="Create expenses and select categories to view your breakdown."
        icon={PieIcon}
      />
    );
  }

  // Convert cents to dollars for chart visualization
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.spent / 100,
    rawCents: item.spent
  }));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{payload[0].name}</p>
          <p className="text-sm font-bold text-slate-100 mt-1">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.GENERAL} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => {
              const item = chartData.find(d => d.name === value);
              return <span className="text-xs text-slate-300 font-medium">{value} ({formatCurrency(item?.value || 0)})</span>;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
