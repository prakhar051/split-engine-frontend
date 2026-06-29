import React, { useState } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Store, Calendar, DollarSign } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function MerchantAnalyticsCard({
  merchants = [],
  pagination = { page: 1, limit: 10, totalCount: 0, totalPages: 1 },
  onPageChange,
  onSearchChange,
  onSortChange,
}) {
  const { formatCurrency, preferredCurrency } = useCurrencyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('amount');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleSortField = (e) => {
    const value = e.target.value;
    setSortField(value);
    onSortChange?.(value, sortOrder);
  };

  const handleSortOrder = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    onSortChange?.(sortField, value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const { page = 1, totalPages = 1, totalCount = 0 } = pagination;

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-400" />
            Merchant Spending Analytics
          </h3>
          <p className="text-xs text-slate-400">Analyze your spending patterns across merchants ({totalCount} total)</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchant..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Sort Field */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-400">
          <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-semibold whitespace-nowrap">Sort By</span>
          <select
            value={sortField}
            onChange={handleSortField}
            className="w-full bg-transparent border-none text-slate-200 focus:outline-none text-sm cursor-pointer"
          >
            <option value="amount">Total Spent</option>
            <option value="frequency">Visits Count</option>
            <option value="averageSpend">Average Spend</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-400">
          <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-semibold whitespace-nowrap">Order</span>
          <select
            value={sortOrder}
            onChange={handleSortOrder}
            className="w-full bg-transparent border-none text-slate-200 focus:outline-none text-sm cursor-pointer"
          >
            <option value="desc">Highest First</option>
            <option value="asc">Lowest First</option>
          </select>
        </div>
      </div>

      {/* Merchant List */}
      {merchants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-800 rounded-xl">
          <Store className="w-10 h-10 text-slate-700 mb-2" />
          <p className="text-sm text-slate-400">No merchants matching the criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {merchants.map((item, index) => {
            const currency = preferredCurrency || 'INR';
            // Align with server keys: totalAmount/amount, visitCount/frequency, averageSpend
            const spent = item.totalAmount !== undefined ? item.totalAmount : (item.amount || 0);
            const visits = item.visitCount !== undefined ? item.visitCount : (item.frequency || 0);
            const avgSpend = item.averageSpend || 0;
            const firstTx = item.firstTransaction;
            const latestTx = item.latestTransaction;

            return (
              <div
                key={index}
                className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-slate-700/50 rounded-xl p-4 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Merchant Name & Basic Stats */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 text-base">{item.merchant || 'Unknown Merchant'}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                        {visits} {visits === 1 ? 'visit' : 'visits'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                        Avg: {formatCurrency(avgSpend, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount and Timeline */}
                <div className="flex flex-col md:items-end justify-between gap-2 shrink-0 border-t border-slate-850 pt-3 md:border-t-0 md:pt-0">
                  <div className="text-lg font-bold text-slate-100">
                    {formatCurrency(spent, currency)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {formatDate(firstTx)} - {formatDate(latestTx)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
          <span className="text-xs text-slate-400">
            Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
            <span className="font-semibold text-slate-200">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-850 hover:border-slate-700 text-slate-300 disabled:text-slate-600 disabled:border-slate-850 disabled:bg-slate-950/20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-850 hover:border-slate-700 text-slate-300 disabled:text-slate-600 disabled:border-slate-850 disabled:bg-slate-950/20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
