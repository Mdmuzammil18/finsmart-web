import { format, subMonths, parseISO, parse } from 'date-fns';
import { IncomeSource } from './profile.constants';

/**
 * Filters income sources for a specific month and year, respecting recurring frequencies and end dates.
 */
export const filterSourcesByMonth = (sources: IncomeSource[], targetDate: Date): IncomeSource[] => {
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  
  return sources.filter(item => {
    let itemDateStr = item.startDate;
    if (!itemDateStr) return false;

    let startD: Date;
    if (itemDateStr.includes('-')) {
      startD = parseISO(itemDateStr);
    } else {
      startD = parse(itemDateStr, 'MMM d, yyyy', new Date());
    }

    if (isNaN(startD.getTime())) return false;

    const startYear = startD.getFullYear();
    const startMonth = startD.getMonth();

    let endD: Date | null = null;
    if (item.endDate) {
      if (item.endDate.includes('-')) {
        endD = parseISO(item.endDate);
      } else {
        endD = parse(item.endDate, 'MMM d, yyyy', new Date());
      }
    }

    // Check if target is BEFORE start
    if (targetYear < startYear || (targetYear === startYear && targetMonth < startMonth)) {
      return false; 
    }

    // Check if target is AFTER end
    if (endD && !isNaN(endD.getTime())) {
      const endYear = endD.getFullYear();
      const endMonth = endD.getMonth();
      if (targetYear > endYear || (targetYear === endYear && targetMonth > endMonth)) {
        return false; 
      }
    }

    // Check frequency recurrence
    if (item.frequency === 'Onetime') {
      return targetYear === startYear && targetMonth === startMonth;
    } else if (item.frequency === 'Monthly') {
      return true; 
    } else if (item.frequency === 'Yearly') {
      return targetMonth === startMonth; 
    }

    return false;
  });
};

/**
 * Calculates the correct contextual display date for recurring income sources
 */
export const getDisplayDate = (item: IncomeSource, currentMonth: Date): string => {
  let startD: Date;
  if (item.startDate.includes('-')) {
    startD = parseISO(item.startDate);
  } else {
    startD = parse(item.startDate, 'MMM d, yyyy', new Date());
  }

  if (isNaN(startD.getTime())) return item.startDate;

  if (item.frequency === 'Onetime') {
    return format(startD, 'MMM d, yyyy');
  }

  if (item.frequency === 'Monthly') {
    // Show same day, but in the currently viewed month
    const targetYear = currentMonth.getFullYear();
    const targetMonth = currentMonth.getMonth();
    
    let displayDate = new Date(startD);
    displayDate.setFullYear(targetYear);
    displayDate.setMonth(targetMonth);
    
    return format(displayDate, 'MMM d, yyyy');
  }

  if (item.frequency === 'Yearly') {
    // Show same month and day, but in the currently viewed year
    const targetYear = currentMonth.getFullYear();
    let displayDate = new Date(startD);
    displayDate.setFullYear(targetYear);
    
    return format(displayDate, 'MMM d, yyyy');
  }

  return format(startD, 'MMM d, yyyy');
};

/**
 * Calculates total income, source count, and month-over-month percentage change.
 */
export const calculateIncomeStats = (
  currentMonthSources: IncomeSource[],
  allSources: IncomeSource[],
  currentMonthDate: Date
) => {
  // Current Month Stats
  const totalIncome = currentMonthSources.reduce((sum, item) => sum + item.amount, 0);
  const sourcesCount = currentMonthSources.length;

  // Previous Month Stats
  const prevMonthDate = subMonths(currentMonthDate, 1);
  const prevMonthSources = filterSourcesByMonth(allSources, prevMonthDate);
  const prevMonthTotalIncome = prevMonthSources.reduce((sum, item) => sum + item.amount, 0);

  // Percentage Change
  let percentageChange = 0;
  if (prevMonthTotalIncome === 0 && totalIncome > 0) {
    percentageChange = 100; // Infinite growth, cap at 100%
  } else if (prevMonthTotalIncome > 0) {
    percentageChange = ((totalIncome - prevMonthTotalIncome) / prevMonthTotalIncome) * 100;
  }

  return {
    totalIncome,
    sourcesCount,
    percentageChange,
  };
};
