export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'health'
  | 'entertainment'
  | 'utilities'
  | 'rent'
  | 'salary'
  | 'freelance'
  | 'other';

export type TransactionType = 'income' | 'expense';

export type SplitMethod = 'equal' | 'exact' | 'percentage';

export interface ExpenseSplit {
  userId: string;
  amount: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO 8601 date string
  type: TransactionType;
  // Group Expense fields
  groupId?: string;
  paidByUserId?: string; // If undefined, assume current user
  splitMethod?: SplitMethod;
  splits?: ExpenseSplit[];
}
