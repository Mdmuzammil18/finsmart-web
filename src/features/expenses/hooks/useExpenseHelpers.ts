import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { Expense } from '../types';

export interface GroupedExpenses {
  title: string;
  data: Expense[];
}

export const groupTransactionsByDate = (transactions: Expense[]): GroupedExpenses[] => {
  const groups: Record<string, Expense[]> = {};

  transactions.forEach((transaction) => {
    let dateObj: Date;
    
    try {
      dateObj = parseISO(transaction.date);
    } catch (e) {
      dateObj = new Date(transaction.date);
    }

    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }

    let title = '';
    if (isToday(dateObj)) {
      title = 'Today';
    } else if (isYesterday(dateObj)) {
      title = 'Yesterday';
    } else {
      title = format(dateObj, 'MMM d, yyyy');
    }

    if (!groups[title]) {
      groups[title] = [];
    }
    groups[title].push(transaction);
  });

  // Convert to array format for SectionList
  return Object.keys(groups).map((title) => ({
    title,
    data: groups[title],
  }));
};
