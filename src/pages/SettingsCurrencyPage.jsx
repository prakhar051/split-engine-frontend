import { useEffect, useState } from 'react';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/currency/CurrencySelector';
import CurrencyBadge from '../components/currency/CurrencyBadge';
import ExchangeRateCard from '../components/currency/ExchangeRateCard';
import ExchangeRateHistoryModal from '../components/currency/ExchangeRateHistoryModal';
import { Globe, TrendingUp, RefreshCw, History, Shield, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

const card = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
});

export default function SettingsCurrencyPage() {
  const {
    preferredCurrency,
    baseCurrency,
    supportedCurrencies,
    rates,
    ratesFetchedAt,
    provider,
    ratesHistory,
    isLoading,
    setPreferredCurrency,
    fetchLatestRates,
    fetchRatesHistory,
    initialize,
  } = useCurrencyStore();

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedPill, setSavedPill] = useState(false);

  // ---- bootstrap on mount ----
  useEffect(() => {
    initialize();
    fetchRatesHistory();
  }, [initialize, fetchRatesHistory]);

  // ---- handlers ----
  const handleCurrencyChange = (code) => {
    setPreferredCurrency(code);
    setSavedPill(true);
    setTimeout(() => setSavedPill(false), 2200);
  };

  const handleRefreshRates = () => {
    fetchLatestRates(true);
  };

  // Derive rate entries to display — every supported currency except the base
  const rateEntries = Array.isArray(supportedCurrencies)
    ? supportedCurrencies
        .filter((c) => c !== baseCurrency)
        .map((c) => ({
          currency: c,
          rate: rates?.[c],
        }))
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      {/* ───────── Header ───────── */}
      <motion.div {...card(0)}>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-7 h-7 text-indigo-400" />
          <h1 className="text-3xl font-black tracking-tight text-white">Currency Settings</h1>
        </div>
        <p className="text-slate-400 text-sm">
          Configure your preferred display currency and view exchange rates.
        </p>
      </motion.div>

      {/* ───────── Preferred Currency Card ───────── */}
      <motion.div
        {...card(0.08)}
        className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden"
      >
        {/* decorative glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2.5 mb-4">
          <Coins className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-bold text-white">Display Currency</h2>
        </div>

        <p className="text-slate-400 text-sm mb-5 max-w-xl leading-relaxed">
          All amounts will be displayed in your preferred currency using the latest exchange rates.
          Base accounting currency is always <CurrencyBadge code={baseCurrency || 'INR'} />.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-full sm:w-72">
            <CurrencySelector
              currencies={supportedCurrencies}
              value={preferredCurrency}
              onChange={handleCurrencyChange}
            />
          </div>

          {/* success pill */}
          {savedPill && (
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold"
            >
              <Shield className="w-3.5 h-3.5" />
              Preference saved
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* ───────── Live Exchange Rates ───────── */}
      <motion.div {...card(0.16)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Live Exchange Rates</h2>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {ratesFetchedAt && (
              <span className="text-[11px] text-slate-500 font-medium">
                Last updated{' '}
                {new Date(ratesFetchedAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            )}
            <button
              onClick={handleRefreshRates}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-50 text-sm font-semibold rounded-xl transition duration-200 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rateEntries.map(({ currency, rate }) => (
            <ExchangeRateCard
              key={currency}
              fromCurrency={baseCurrency}
              toCurrency={currency}
              rate={rate}
              fetchedAt={ratesFetchedAt}
              provider={provider}
            />
          ))}
        </div>

        {rateEntries.length === 0 && !isLoading && (
          <p className="text-slate-500 text-sm text-center py-10">
            No exchange rate data available yet. Hit <strong>Refresh</strong> to fetch the latest rates.
          </p>
        )}
      </motion.div>

      {/* ───────── Rate History ───────── */}
      <motion.div
        {...card(0.24)}
        className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-violet-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Rate History</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {ratesHistory?.length
                ? `${ratesHistory.length} snapshot${ratesHistory.length === 1 ? '' : 's'} recorded`
                : 'No history snapshots yet'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHistoryModal(true)}
          className="flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <History className="w-4 h-4" />
          View Rate History
        </button>
      </motion.div>

      {/* ───────── Info Card ───────── */}
      <motion.div
        {...card(0.32)}
        className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">How Exchange Rates Work</h2>
        </div>

        <ul className="space-y-2.5 text-sm text-slate-400 leading-relaxed list-disc list-inside marker:text-indigo-500/60">
          <li>Rates are refreshed every 12 hours automatically</li>
          <li>Historical expenses use the rate locked at creation time</li>
          <li>Display conversion is cosmetic — accounting uses base currency</li>
          <li>Multiple fallback providers ensure rate availability</li>
        </ul>
      </motion.div>

      {/* ───────── History Modal ───────── */}
      {showHistoryModal && (
        <ExchangeRateHistoryModal
          history={ratesHistory}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}
