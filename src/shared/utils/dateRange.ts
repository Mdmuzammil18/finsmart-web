import { format } from 'date-fns';

/**
 * Formats a custom date range into a clean, readable string representation.
 * If the start and end dates are in the same year, the year is only shown once at the end.
 * If they are on the exact same day, it returns a single formatted date.
 * 
 * E.g.,
 * Same day: "Jun 23, 2026"
 * Same year: "Jun 23 - Jun 25, 2026"
 * Different years: "Jun 23, 2025 - Jun 25, 2026"
 */
export const formatCustomRange = (start: Date, end: Date): string => {
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth() && start.getDate() === end.getDate()) {
      return format(start, 'MMM d, yyyy');
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }
  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
};

export const getDateRangeForFilter = (filterLabel: string, customStart?: Date, customEnd?: Date): { startDate?: string; endDate?: string } => {
  const today = new Date();
  switch (filterLabel) {
    case 'Today':
      return { startDate: format(today, 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') + 'T23:59:59.999Z' };
    case 'Last 7 days':
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 6);
      return { startDate: format(last7, 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') + 'T23:59:59.999Z' };
    case 'This week':
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      return { startDate: format(thisWeekStart, 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') + 'T23:59:59.999Z' };
    case 'This month':
      return { startDate: format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') + 'T23:59:59.999Z' };
    case 'This year':
      return { startDate: format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') + 'T23:59:59.999Z' };
    case 'Last 30 days':
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 29);
      return { startDate: format(last30, 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') + 'T23:59:59.999Z' };
    case 'Last 3 months':
      const last3m = new Date(today);
      last3m.setMonth(today.getMonth() - 3);
      return { startDate: format(last3m, 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') + 'T23:59:59.999Z' };
    case 'Last 6 months':
      const last6m = new Date(today);
      last6m.setMonth(today.getMonth() - 6);
      return { startDate: format(last6m, 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') + 'T23:59:59.999Z' };
    case 'Last year':
      return { 
        startDate: format(new Date(today.getFullYear() - 1, 0, 1), 'yyyy-MM-dd'), 
        endDate: format(new Date(today.getFullYear() - 1, 11, 31), 'yyyy-MM-dd') + 'T23:59:59.999Z' 
      };
    default:
      if (customStart && customEnd) {
        return { startDate: format(customStart, 'yyyy-MM-dd'), endDate: format(customEnd, 'yyyy-MM-dd') + 'T23:59:59.999Z' };
      }
      return {};
  }
};
