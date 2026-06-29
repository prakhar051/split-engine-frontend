import { create } from 'zustand';
import api from '../api/api';
import { useGroupStore } from './groupStore';
import { scanReceipt as ocrScan } from '../services/ocrService';
import { parseReceiptText } from '../utils/receiptParser';

let activeAiAbortController = null;

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  currentExpense: null,
  attachments: [],
  isLoading: false,
  error: null,
  createExpenseSuccess: false,
  uploadProgress: 0,
  selectedCategoryFilter: '',
  searchQuery: '',

  // OCR Receipt Scanner states
  ocrLoading: false,
  ocrProgress: 0,
  ocrLoadingStage: '',
  ocrConfidence: null,
  ocrRawText: '',
  ocrResult: null,
  ocrImage: null,

  // AI States
  aiLoading: false,
  aiSuggestion: null,
  aiError: null,

  setSelectedCategoryFilter: (category) => set({ selectedCategoryFilter: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  clearCurrentExpense: () => set({
    currentExpense: null,
    attachments: [],
    error: null,
    createExpenseSuccess: false,
    uploadProgress: 0
  }),

  getGroupExpenses: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/groups/${groupId}/expenses`);
      set({ expenses: response.data.expenses || [], isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch group expenses',
        isLoading: false
      });
    }
  },

  getExpense: async (expenseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/expenses/${expenseId}`);
      const expense = response.data.expense;
      set({
        currentExpense: expense,
        attachments: expense.attachments || [],
        isLoading: false
      });
      return expense;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch expense details',
        isLoading: false
      });
      throw err;
    }
  },

  createExpense: async (payload) => {
    set({ isLoading: true, error: null, createExpenseSuccess: false });
    try {
      const response = await api.post('/expenses', payload);
      const newExpense = response.data.expense;
      
      // Optimistic Update: add the newly created expense directly to listing
      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        createExpenseSuccess: true,
        isLoading: false
      }));
      return newExpense;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create expense';
      const validationErrors = err.response?.data?.errors || null;
      set({
        error: validationErrors || errMsg,
        isLoading: false
      });
      throw err;
    }
  },

  deleteExpense: async (expenseId) => {
    set({ isLoading: true, error: null });
    
    // Store previous list for fallback rollback
    const previousExpenses = get().expenses;

    // Optimistic Update: immediately remove from lists
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== expenseId),
      currentExpense: state.currentExpense?.id === expenseId ? null : state.currentExpense
    }));

    try {
      await api.delete(`/expenses/${expenseId}`);
      set({ isLoading: false });
    } catch (err) {
      // Rollback on error
      set({
        expenses: previousExpenses,
        error: err.response?.data?.message || 'Failed to delete expense',
        isLoading: false
      });
      throw err;
    }
  },

  updateExpense: async (expenseId, payload) => {
    set({ isLoading: true, error: null });
    const previousExpenses = get().expenses;
    const previousExpense = get().currentExpense;

    // Optimistic Update
    set((state) => {
      const updatedExpenses = state.expenses.map((e) => {
        if (e.id === expenseId) {
          return {
            ...e,
            title: payload.title || payload.description || e.title,
            description: payload.description || e.description,
            amount: payload.amount,
            splitType: payload.splitType,
            category: payload.category || 'GENERAL',
            paidById: payload.paidById || null
          };
        }
        return e;
      });
      const updatedExpense = state.currentExpense?.id === expenseId
        ? {
            ...state.currentExpense,
            title: payload.title || payload.description || state.currentExpense.title,
            description: payload.description || state.currentExpense.description,
            amount: payload.amount,
            splitType: payload.splitType,
            category: payload.category || 'GENERAL',
            paidById: payload.paidById || null
          }
        : state.currentExpense;
      return {
        expenses: updatedExpenses,
        currentExpense: updatedExpense
      };
    });

    try {
      const response = await api.put(`/expenses/${expenseId}`, payload);
      const updated = response.data.expense;

      set((state) => {
        const finalExpenses = state.expenses.map((e) => (e.id === expenseId ? updated : e));
        return {
          expenses: finalExpenses,
          currentExpense: state.currentExpense?.id === expenseId ? updated : state.currentExpense,
          isLoading: false
        };
      });

      // Invalidate caches
      useGroupStore.getState().clearCache();
      const currentGroup = useGroupStore.getState().currentGroup;
      if (currentGroup) {
        useGroupStore.getState().getGroupDetails(currentGroup.id).catch(console.error);
        useGroupStore.getState().getGroups().catch(console.error);
      }

      return updated;
    } catch (err) {
      // Rollback on error
      set({
        expenses: previousExpenses,
        currentExpense: previousExpense,
        error: err.response?.data?.message || 'Failed to update expense',
        isLoading: false
      });
      throw err;
    }
  },

  uploadAttachments: async (expenseId, files) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await api.post(`/expenses/${expenseId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          set({ uploadProgress: percentCompleted });
        }
      });

      const newAttachments = response.data.attachments || [];

      // Optimistic Update: append attachments without reload
      set((state) => {
        const updatedAttachments = [...state.attachments, ...newAttachments];
        const updatedExpense = state.currentExpense
          ? { ...state.currentExpense, attachments: [...(state.currentExpense.attachments || []), ...newAttachments] }
          : null;
        return {
          attachments: updatedAttachments,
          currentExpense: updatedExpense,
          uploadProgress: 100,
          isLoading: false
        };
      });

      return newAttachments;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to upload attachments',
        isLoading: false,
        uploadProgress: 0
      });
      throw err;
    }
  },

  deleteAttachment: async (expenseId, attachmentId) => {
    set({ isLoading: true, error: null });

    const previousAttachments = get().attachments;
    const previousExpense = get().currentExpense;

    // Optimistic Update: immediately remove from lists
    set((state) => {
      const filteredAttachments = state.attachments.filter((a) => a.id !== attachmentId);
      const updatedExpense = state.currentExpense
        ? {
            ...state.currentExpense,
            attachments: (state.currentExpense.attachments || []).filter((a) => a.id !== attachmentId)
          }
        : null;
      return {
        attachments: filteredAttachments,
        currentExpense: updatedExpense
      };
    });

    try {
      await api.delete(`/expenses/${expenseId}/attachments/${attachmentId}`);
      set({ isLoading: false });
    } catch (err) {
      // Rollback on error
      set((state) => ({
        attachments: previousAttachments,
        currentExpense: previousExpense,
        error: err.response?.data?.message || 'Failed to delete attachment',
        isLoading: false
      }));
      throw err;
    }
  },

  scanReceipt: async (file) => {
    set({
      ocrLoading: true,
      ocrProgress: 0,
      ocrLoadingStage: 'Loading OCR Engine',
      ocrConfidence: null,
      ocrRawText: '',
      ocrResult: null,
      ocrImage: file,
      error: null
    });

    try {
      const { rawText, confidence } = await ocrScan(file, ({ stage, percent }) => {
        set({
          ocrLoadingStage: stage,
          ocrProgress: percent
        });
      });

      const parsed = parseReceiptText(rawText);
      parsed.confidence = confidence;

      set({
        ocrLoading: false,
        ocrProgress: 100,
        ocrLoadingStage: 'Completed',
        ocrConfidence: confidence,
        ocrRawText: rawText,
        ocrResult: parsed
      });

      return parsed;
    } catch (err) {
      set({
        ocrLoading: false,
        ocrProgress: 0,
        ocrLoadingStage: '',
        error: err.message || 'OCR scanning failed'
      });
      throw err;
    }
  },

  clearOCR: () => {
    set({
      ocrLoading: false,
      ocrProgress: 0,
      ocrLoadingStage: '',
      ocrConfidence: null,
      ocrRawText: '',
      ocrResult: null,
      ocrImage: null,

      // AI States
      aiLoading: false,
      aiSuggestion: null,
      aiError: null,
    });
  },

  applyOCRResult: () => {
    return get().ocrResult;
  },

  categorizeReceipt: async (rawText) => {
    if (activeAiAbortController) {
      activeAiAbortController.abort();
    }
    activeAiAbortController = new AbortController();

    set({ aiLoading: true, aiError: null, aiSuggestion: null });

    try {
      const response = await api.post('/ai/categorize-receipt', { rawText }, {
        signal: activeAiAbortController.signal
      });

      set({
        aiSuggestion: response.data,
        aiLoading: false
      });
      return response.data;
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }
      set({
        aiError: err.response?.data?.message || err.message || 'AI categorization failed',
        aiLoading: false
      });
      throw err;
    }
  },

  clearAISuggestion: () => {
    set({
      aiSuggestion: null,
      aiLoading: false,
      aiError: null
    });
  },

  applyAISuggestion: () => {
    const suggestion = get().aiSuggestion?.suggestion;
    const currentOcr = get().ocrResult;
    if (suggestion && currentOcr) {
      set({
        ocrResult: {
          ...currentOcr,
          merchant: suggestion.merchant,
          title: suggestion.title,
          category: suggestion.category
        }
      });
    }
  }
}));
