import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Landmark } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function CashFlowChart({ data = [] }) {
  const { formatCurrency, preferredCurrency } = useCurrencyStore();
  const currency = preferredCurrency || 'INR';

  const hasData = data && data.length > 0;

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
        <Landmark className="w-12 h-12 text-slate-700 mb-3" />
        <h4 className="text-slate-300 font-semibold">Cash Flow Analysis</h4>
        <p className="text-slate-500 text-sm mt-1">No cash flow data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-100">Cash Flow</h3>
        <p className="text-xs text-slate-400">Comparison of inflows (income/deposits) and outflows (obligations/spending)</p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barGap={6}
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
              cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const inflow = payload.find((p) => p.dataKey === 'inflow')?.value || 0;
                  const outflow = payload.find((p) => p.dataKey === 'outflow')?.value || 0;
                  const net = payload[0].payload.net !== undefined ? payload[0].payload.net : (inflow - outflow);
                  const isNetPositive = net >= 0;

                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-2xl text-xs font-sans min-w-[180px]">
                      <p className="text-slate-400 font-semibold mb-1.5">{label}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                            <span className="text-slate-350">Total Paid (Inflow)</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-400">
                            {formatCurrency(inflow, currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded bg-rose-500" />
                            <span className="text-slate-350">Your Obligations (Outflow)</span>
                          </div>
                          <span className="font-mono font-bold text-rose-400">
                            {formatCurrency(outflow, currency)}
                          </span>
                        </div>
                        <div className="border-t border-slate-800 pt-1.5 mt-1.5 flex items-center justify-between gap-4">
                          <span className="text-slate-450 font-medium">Net Savings</span>
                          <span className={`font-mono font-bold ${isNetPositive ? 'text-emerald-400' : 'text-rose-455'}`}>
                            {formatCurrency(net, currency)}
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
                if (value === 'inflow') return <span className="text-xs text-slate-300 font-medium px-1">Total Paid (Inflow)</span>;
                if (value === 'outflow') return <span className="text-xs text-slate-300 font-medium px-1">Your Obligations (Outflow)</span>;
                return <span className="text-xs text-slate-300 font-medium px-1">{value}</span>;
              }}
            />
            <Bar
              dataKey="inflow"
              name="inflow"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="outflow"
              name="outflow"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
