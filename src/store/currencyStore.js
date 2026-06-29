import { create } from 'zustand';
import api from '../api/api';

export const useCurrencyStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────
  preferredCurrency: localStorage.getItem('preferredCurrency') || 'INR',
  supportedCurrencies: [],
  baseCurrency: 'INR',
  rates: {},
  ratesHistory: [],
  ratesFetchedAt: null,
  provider: null,
  isLoading: false,
  error: null,

  // ── Actions ────────────────────────────────────────────

  setPreferredCurrency: (currency) => {
    localStorage.setItem('preferredCurrency', currency);
    set({ preferredCurrency: currency });
  },

  fetchSupportedCurrencies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/currency/supported');
      const currencies = response.data?.currencies || [];
      set({ supportedCurrencies: currencies, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
    }
  },

  fetchLatestRates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/currency/rates');
      set({
        rates: response.data.rates || {},
        baseCurrency: response.data.baseCurrency,
        ratesFetchedAt: response.data.fetchedAt,
        provider: response.data.provider,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
    }
  },

  fetchRatesHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/currency/history');
      const history = response.data?.history || [];
      set({ ratesHistory: history, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
    }
  },

  convertAmount: (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;

    const { rates } = get();
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (!fromRate || !toRate) return amount;

    return Math.round((toRate / fromRate) * amount);
  },

  formatCurrency: (amountInCents, currency) => {
    const isZeroDecimal = currency === 'JPY';
    const value = isZeroDecimal ? amountInCents : amountInCents / 100;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(value);
  },

  getCurrencySymbol: (currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value || currency;
  },

  initialize: async () => {
    const { fetchSupportedCurrencies, fetchLatestRates } = get();
    await Promise.all([fetchSupportedCurrencies(), fetchLatestRates()]);
  },
}));
