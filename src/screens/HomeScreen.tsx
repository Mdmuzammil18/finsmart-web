import { useEffect } from 'react';
import { useExpenseStore } from '@/features/expenses/store/expenseStore';
import { format } from 'date-fns';
import { AISummaryBanner } from '@/components/AISummaryBanner';

export default function HomeScreen() {
  const { expenses, fetchExpenses, isLoading } = useExpenseStore();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalBalance = expenses.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const income = expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted text-sm">Welcome back to ExpenseTracker</p>
        </div>
      </header>

      <AISummaryBanner />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <p className="text-muted text-sm mb-2">Total Balance</p>
          <h2 className="text-2xl font-bold">${totalBalance.toFixed(2)}</h2>
        </div>
        <div className="card glass-panel" style={{ borderLeft: '4px solid var(--success)'}}>
          <p className="text-muted text-sm mb-2">Total Income</p>
          <h2 className="text-2xl font-bold text-success">+${income.toFixed(2)}</h2>
        </div>
        <div className="card glass-panel" style={{ borderLeft: '4px solid var(--destructive)'}}>
          <p className="text-muted text-sm mb-2">Total Expense</p>
          <h2 className="text-2xl font-bold text-destructive">-${expense.toFixed(2)}</h2>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
        {isLoading ? (
          <p className="text-muted">Loading transactions...</p>
        ) : expenses.length === 0 ? (
          <p className="text-muted">No transactions found.</p>
        ) : (
          <div className="flex-col gap-4" style={{ display: 'flex' }}>
            {expenses.slice(0, 5).map(exp => (
              <div key={exp.id} className="flex justify-between items-center p-4 hover-scale" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--cat-food-bg)', color: 'var(--cat-food)' }}>
                    {/* Placeholder for category icon */}
                    <span className="font-bold text-xs">{exp.category.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-bold">{exp.title}</p>
                    <p className="text-xs text-muted">{format(new Date(exp.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div>
                  <p className={`font-bold ${exp.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {exp.type === 'income' ? '+' : '-'}${exp.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
