import { create } from 'zustand';
import { IncomeSource, Category } from '../profile.constants';
import { api } from '@/shared/services/api';

interface ProfileState {
  incomeSources: IncomeSource[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchIncomeSources: () => Promise<void>;
  addIncomeSource: (source: Omit<IncomeSource, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncomeSource: (id: string, source: Omit<IncomeSource, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteIncomeSource: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createCategory: (name: string, icon?: string, color?: string) => Promise<Category | null>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  incomeSources: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchIncomeSources: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<{ incomeSources: IncomeSource[] }>('/income-sources');
      set({ incomeSources: data.incomeSources, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addIncomeSource: async (source) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<{ incomeSource: IncomeSource }>('/income-sources', source);
      set((state) => ({
        incomeSources: [data.incomeSource, ...state.incomeSources],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateIncomeSource: async (id, source) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.put<{ incomeSource: IncomeSource }>(`/income-sources/${id}`, source);
      set((state) => ({
        incomeSources: state.incomeSources.map(e => e.id === id ? data.incomeSource : e),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteIncomeSource: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/income-sources/${id}`);
      set((state) => ({
        incomeSources: state.incomeSources.filter((item) => item.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const data = await api.get<{ categories: Category[] }>('/income-categories');
      set({ categories: data.categories });
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
    }
  },

  createCategory: async (name, icon, color) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<{ category: Category }>('/income-categories', { name, icon, color });
      set((state) => ({
        categories: [...state.categories, data.category],
        isLoading: false
      }));
      return data.category;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
}));
