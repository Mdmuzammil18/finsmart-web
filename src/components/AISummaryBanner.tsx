import { Sparkles, Utensils, TrendingUp, Receipt, ChevronRight } from 'lucide-react';

export function AISummaryBanner() {
  return (
    <div className="card" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', marginBottom: '1.5rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles size={18} />
          <h3 className="font-bold">AI Summary</h3>
        </div>
        <button className="flex items-center text-sm font-semibold text-primary hover-scale" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          View Insights
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Main Content */}
      <div>
        <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>You spent $2,350 today</h4>

        <div className="flex-col gap-3" style={{ display: 'flex' }}>
          {/* Bullet 1 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--cat-food-bg)' }}>
              <Utensils size={14} color="var(--cat-food)" />
            </div>
            <p className="text-sm">
              Food spending is <span className="font-bold text-primary">45% higher</span> than usual
            </p>
          </div>

          {/* Bullet 2 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--cat-transport-bg)' }}>
              <TrendingUp size={14} color="var(--cat-transport)" />
            </div>
            <p className="text-sm">
              You can save <span className="font-bold"> $3,200</span> this month
            </p>
          </div>

          {/* Bullet 3 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--cat-health-bg)' }}>
              <Receipt size={14} color="var(--cat-health)" />
            </div>
            <p className="text-sm">
              12 transactions across 3 categories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
