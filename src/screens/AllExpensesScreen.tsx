import { useEffect } from 'react';
import { useExpenseStore } from '@/features/expenses/store/expenseStore';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AllExpensesScreen() {
  const { expenses, fetchExpenses, isLoading } = useExpenseStore();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Group expenses by category
  const expensesByCategory = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Map category to color
  const COLORS = ['#F59E0B', '#3B82F6', '#EC4899', '#EF4444', '#8B5CF6', '#06B6D4', '#10B981'];

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">All Expenses</h1>
          <p className="text-muted text-sm">View and manage your transactions</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Chart Section */}
        {chartData.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="text-lg font-bold mb-4">Expense Breakdown</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="text-lg font-bold mb-4">Transactions</h3>
          {isLoading ? (
            <p className="text-muted">Loading transactions...</p>
          ) : expenses.length === 0 ? (
            <p className="text-muted">No transactions found.</p>
          ) : (
            <div className="flex-col gap-4" style={{ display: 'flex' }}>
              {expenses.map(exp => (
                <div key={exp.id} className="flex justify-between items-center p-4 hover-scale" style={{ borderBottom: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--cat-transport-bg)', color: 'var(--cat-transport)' }}>
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
    </div>
  );
}
