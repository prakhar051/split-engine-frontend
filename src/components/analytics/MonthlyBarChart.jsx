import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
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

export default function MonthlyBarChart({ trends = [] }) {
  const { formatCurrency, preferredCurrency } = useCurrencyStore();
  const currency = preferredCurrency || 'INR';

  const categories = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    const keys = new Set();
    trends.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'month') {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  }, [trends]);

  const hasData = trends && trends.length > 0 && categories.length > 0;

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
        <BarChart3 className="w-12 h-12 text-slate-700 mb-3" />
        <h4 className="text-slate-300 font-semibold">Monthly Trends</h4>
        <p className="text-slate-500 text-sm mt-1">No monthly trend data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-100">Monthly Spending Trends</h3>
        <p className="text-xs text-slate-400">Monthly breakdowns of category spending</p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trends}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="month"
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
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-2xl text-xs font-sans min-w-[160px]">
                      <p className="text-slate-400 font-semibold mb-1.5">{label}</p>
                      <div className="space-y-1">
                        {payload.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                              <span className="text-slate-300">{p.name}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-100">
                              {formatCurrency(p.value, currency)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-slate-800 pt-1.5 mt-1.5 flex items-center justify-between gap-4">
                          <span className="text-slate-450 font-medium">Total Spent</span>
                          <span className="font-mono font-bold text-indigo-400">
                            {formatCurrency(total, currency)}
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
              formatter={(value) => <span className="text-xs text-slate-300 font-medium px-1">{value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}</span>}
            />
            {categories.map((category) => (
              <Bar
                key={category}
                dataKey={category}
                name={category}
                fill={getCategoryColor(category)}
                stackId="a"
                radius={[0, 0, 0, 0]} // stacked bars don't need top rounded except last, but simple flat radius is safest
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
