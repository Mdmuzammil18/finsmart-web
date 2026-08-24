export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
  icon?: string;
  color?: string;
  createdAt: string;
}

export interface IncomeSource {
  id: string;
  title: string;
  categoryId: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate?: string | null;
  frequency: 'Onetime' | 'Monthly' | 'Yearly';
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_USER = {
  name: 'md muzammil',
  email: 'muzammil@email.com',
  avatarUrl: 'https://i.pravatar.cc/150?img=11',
};

export const INITIAL_INCOME_SOURCES: IncomeSource[] = [];
