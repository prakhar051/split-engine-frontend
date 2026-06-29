import React, { useMemo } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sliders } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function BudgetTrendChart({ budgets = [] }) {
  const { formatCurrency, preferredCurrency } = useCurrencyStore();
  const currency = preferredCurrency || 'INR';

  const formattedBudgets = useMemo(() => {
    if (!budgets) return [];
    return budgets.map((b) => {
      const category = b.category || b.name || 'General';
      const limit = b.limit !== undefined ? b.limit : (b.amount !== undefined ? b.amount : 0);
      const spent = b.spent !== undefined ? b.spent : (b.actual !== undefined ? b.actual : 0);
      return {
        category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
        limit,
        spent,
        isOver: spent > limit,
      };
    });
  }, [budgets]);

  const hasData = formattedBudgets && formattedBudgets.length > 0;

  const formatYAxis = (val) => {
    const isZeroDecimal = currency === 'JPY';
    const value = isZeroDecimal ? val : val / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!hasData) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col justify-center items-center min-h-[300px]">
        <Sliders className="w-12 h-12 text-slate-700 mb-3" />
        <h4 className="text-slate-300 font-semibold">Budget Performance</h4>
        <p className="text-slate-500 text-sm mt-1">No active budgets found to compare</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-100">Budget vs. Spend</h3>
        <p className="text-xs text-slate-400">Comparison of budget limits against actual monthly spending</p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedBudgets}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="category"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              dx={-5}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const diff = data.limit - data.spent;
                  const isOver = data.spent > data.limit;

                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-2xl text-xs font-sans min-w-[180px]">
                      <p className="text-slate-400 font-semibold mb-1.5">{data.category}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-350">Budget Limit:</span>
                          <span className="font-mono font-semibold text-slate-300">
                            {formatCurrency(data.limit, currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-350">Actual Spent:</span>
                          <span className={`font-mono font-bold ${isOver ? 'text-red-400' : 'text-emerald-455 text-emerald-400'}`}>
                            {formatCurrency(data.spent, currency)}
                          </span>
                        </div>
                        <div className="border-t border-slate-800 pt-1.5 mt-1.5 flex items-center justify-between gap-4">
                          <span className="text-slate-450 font-medium">
                            {isOver ? 'Over Budget:' : 'Remaining:'}
                          </span>
                          <span className={`font-mono font-bold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
                            {formatCurrency(Math.abs(diff), currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => {
                if (value === 'limit') return <span className="text-xs text-slate-300 font-medium px-1">Budget Limit</span>;
                if (value === 'spent') return <span className="text-xs text-slate-300 font-medium px-1">Actual Spent</span>;
                return <span className="text-xs text-slate-300 font-medium px-1">{value}</span>;
              }}
            />
            {/* Limit Bar: Slate-700 */}
            <Bar
              dataKey="limit"
              name="limit"
              fill="#334155"
              radius={[4, 4, 0, 0]}
            />
            {/* Spent Bar: Emerald-500 if under, Red-500 if over */}
            <Bar
              dataKey="spent"
              name="spent"
              radius={[4, 4, 0, 0]}
            >
              {formattedBudgets.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isOver ? '#ef4444' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
