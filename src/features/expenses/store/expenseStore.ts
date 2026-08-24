import { create } from 'zustand';
import type { Expense } from '../types';
import { api } from '@/shared/services/api';

// TODO: Add actions (addExpense, removeExpense, updateExpense, etc.)
// TODO: Add selectors (getExpensesByCategory, getExpensesByDateRange, etc.)
// TODO: Persist store with zustand/middleware/persist + AsyncStorage

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  category?: string;
}

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: (filters?: ExpenseFilters) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  isLoading: false,
  error: null,

  fetchExpenses: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.category) queryParams.append('category', filters.category);
      
      const queryString = queryParams.toString();
      const endpoint = `/transactions${queryString ? `?${queryString}` : ''}`;
      
      const data = await api.get<{ transactions: Expense[] }>(endpoint);
      set({ expenses: data.transactions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addExpense: async (expense) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<{ transaction: Expense }>('/transactions', expense);
      set((state) => ({
        expenses: [data.transaction, ...state.expenses],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateExpense: async (id, expense) => {
    try {
      const data = await api.put<{ transaction: Expense }>(`/transactions/${id}`, expense);
      set((state) => ({
        expenses: state.expenses.map(e => e.id === id ? data.transaction : e)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteExpense: async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  }
}));
