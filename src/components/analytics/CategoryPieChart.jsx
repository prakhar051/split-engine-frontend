import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';

const CATEGORY_COLORS = {
  FOOD: '#f43f5e',
  TRAVEL: '#10b981',
  RENT: '#3b82f6',
  UTILITIES: '#f59e0b',
  SHOPPING: '#8b5cf6',
  ENTERTAINMENT: '#ec4899',
  GENERAL: '#64748b',
};

const getCategoryColor = (category) => {
  const key = (category || 'GENERAL').toUpperCase();
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.GENERAL;
};

export default function CategoryPieChart({ data = [] }) {
  const { formatCurrency, preferredCurrency } = useCurrencyStore();
  const currency = preferredCurrency || 'INR';

  const totalSum = useMemo(() => {
    return data.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [data]);

  const chartData = useMemo(() => {
    return data
      .filter((item) => (item.total || 0) > 0)
      .map((item) => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase(),
        value: item.total,
        color: getCategoryColor(item.category),
        rawCategory: item.category,
      }));
  }, [data]);

  if (!data || data.length === 0 || totalSum === 0) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col justify-center items-center min-h-[300px]">
        <PieChartIcon className="w-12 h-12 text-slate-700 mb-3" />
        <h4 className="text-slate-300 font-semibold">Category Breakdown</h4>
        <p className="text-slate-500 text-sm mt-1">No spending data available for this period</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-100">Category Breakdown</h3>
        <p className="text-xs text-slate-400">Distribution of your expenses across categories</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Pie Chart */}
        <div className="w-full md:w-1/2 h-[220px] relative flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percent = ((data.value / totalSum) * 100).toFixed(1);
                    return (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-2xl text-xs font-sans">
                        <p className="text-slate-400 font-semibold mb-1">{data.name}</p>
                        <p className="text-slate-100 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                          <span className="font-bold text-indigo-400 font-mono">
                            {formatCurrency(data.value, currency)}
                          </span>
                          <span className="text-slate-500">({percent}%)</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Total Spent</span>
            <span className="text-lg font-bold text-slate-100 font-mono mt-0.5">
              {formatCurrency(totalSum, currency)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full md:w-1/2 flex flex-col space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800">
          {chartData.map((item, index) => {
            const percent = ((item.value / totalSum) * 100).toFixed(1);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-800/50"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-slate-200">{item.name}</span>
                </div>
                <div className="flex items-center space-x-3 text-right">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {formatCurrency(item.value, currency)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/80 min-w-[45px] text-center">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
