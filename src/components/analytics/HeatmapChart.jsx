import React, { useState, useMemo, useRef } from 'react';
import { Calendar, HelpCircle } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function HeatmapChart({ heatmapData = {} }) {
  const { formatCurrency, preferredCurrency } = useCurrencyStore();
  const [hoveredDay, setHoveredDay] = useState(null);
  const containerRef = useRef(null);

  // Generate date grid for the last 12 months (365 days, padded to align weeks)
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const daysToShow = 365;
    const days = [];
    
    // Start date is 365 days ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysToShow + 1);
    
    // Align with Sunday (start of week)
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    // Populate all days from aligned start date up to today (at least 371 days for 53 weeks)
    const endLimit = new Date(today);
    // Keep adding days to fill the last week
    const lastDayOfWeek = endLimit.getDay();
    endLimit.setDate(endLimit.getDate() + (6 - lastDayOfWeek));

    const iterDate = new Date(startDate);
    while (iterDate <= endLimit) {
      days.push(new Date(iterDate));
      iterDate.setDate(iterDate.getDate() + 1);
    }

    // Group into weeks
    const weeksList = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksList.push(days.slice(i, i + 7));
    }

    // Identify where month labels should be placed
    const labels = [];
    let prevMonth = -1;
    
    weeksList.forEach((week, wIndex) => {
      // Look at the middle day of the week to place label
      const midDay = week[3];
      const currentMonth = midDay.getMonth();
      if (currentMonth !== prevMonth) {
        labels.push({
          text: midDay.toLocaleDateString(undefined, { month: 'short' }),
          colIndex: wIndex,
        });
        prevMonth = currentMonth;
      }
    });

    return { weeks: weeksList, monthLabels: labels };
  }, []);

  // Calculate maximum spend to scale intensities
  const maxSpend = useMemo(() => {
    const values = Object.values(heatmapData || {});
    if (values.length === 0) return 0;
    return Math.max(...values.map(v => Number(v) || 0), 0);
  }, [heatmapData]);

  // Determine intensity tier (0 to 4)
  const getDayTier = (amount) => {
    if (!amount || amount <= 0) return 0;
    if (maxSpend === 0) return 1;
    const pct = (amount / maxSpend) * 100;
    if (pct <= 25) return 1;
    if (pct <= 50) return 2;
    if (pct <= 75) return 3;
    return 4;
  };

  const getTierClass = (tier) => {
    switch (tier) {
      case 1:
        return 'bg-indigo-950/60 border border-indigo-900/60 hover:bg-indigo-900/50 hover:border-indigo-500/50';
      case 2:
        return 'bg-indigo-800/40 border border-indigo-700/50 hover:bg-indigo-700/60 hover:border-indigo-400/80';
      case 3:
        return 'bg-indigo-600/70 border border-indigo-500/60 hover:bg-indigo-500/80 hover:border-indigo-300';
      case 4:
        return 'bg-indigo-400 border border-indigo-300 hover:bg-indigo-350 hover:shadow-[0_0_12px_rgba(129,140,248,0.7)]';
      default:
        return 'bg-slate-900/40 border border-slate-800/50 hover:border-slate-700/60';
    }
  };

  const formatDateStr = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const displayDateStr = (date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl w-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Daily Spending Heatmap</h3>
            <p className="text-xs text-slate-400">Visual calendar of your spending habits over the last year</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-slate-900/40 border border-slate-800/50" />
          <div className="w-2.5 h-2.5 rounded bg-indigo-950/60 border border-indigo-900/60" />
          <div className="w-2.5 h-2.5 rounded bg-indigo-800/40 border border-indigo-700/50" />
          <div className="w-2.5 h-2.5 rounded bg-indigo-600/70 border border-indigo-500/60" />
          <div className="w-2.5 h-2.5 rounded bg-indigo-400 border border-indigo-300" />
          <span>More</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative">
        {/* Floating Tooltip */}
        {hoveredDay && (
          <div
            className="absolute z-10 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs shadow-2xl pointer-events-none transition-opacity duration-150 flex flex-col space-y-0.5 animate-fade-in"
            style={{
              left: `${Math.min(hoveredDay.x + 10, containerRef.current?.clientWidth - 150)}px`,
              top: `${Math.max(hoveredDay.y - 50, 0)}px`,
            }}
          >
            <span className="font-semibold text-slate-100">{hoveredDay.dateLabel}</span>
            <span className="text-indigo-400 font-mono font-bold">
              {formatCurrency(hoveredDay.amount, preferredCurrency || 'INR')} spent
            </span>
          </div>
        )}

        <div
          ref={containerRef}
          className="overflow-x-auto pb-4 pt-6 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800"
        >
          <div className="flex min-w-[760px] relative select-none">
            {/* Days of Week Column */}
            <div className="flex flex-col justify-between text-[10px] text-slate-500 pr-2 pt-6 pb-2 h-[105px] w-8 sticky left-0 bg-slate-900/90 z-20 shrink-0 select-none">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="flex flex-col flex-1 relative">
              {/* Month Labels row */}
              <div className="h-6 relative w-full text-[10px] text-slate-500 border-b border-slate-800/40 mb-2">
                {monthLabels.map((lbl, idx) => (
                  <span
                    key={idx}
                    className="absolute"
                    style={{ left: `${lbl.colIndex * 13}px` }}
                  >
                    {lbl.text}
                  </span>
                ))}
              </div>

              {/* Grid of days */}
              <div className="flex gap-[3px] h-[105px]">
                {weeks.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dIndex) => {
                      const dateKey = formatDateStr(day);
                      const amount = heatmapData[dateKey] || 0;
                      const tier = getDayTier(amount);
                      const tierClass = getTierClass(tier);

                      return (
                        <div
                          key={dIndex}
                          className={`w-[10px] h-[10px] rounded-[2px] transition-colors cursor-crosshair shrink-0 ${tierClass}`}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const containerRect = containerRef.current.getBoundingClientRect();
                            setHoveredDay({
                              x: rect.left - containerRect.left + containerRef.current.scrollLeft,
                              y: rect.top - containerRect.top + containerRef.current.scrollTop,
                              dateLabel: displayDateStr(day),
                              amount,
                            });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
