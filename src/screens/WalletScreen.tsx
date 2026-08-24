import { CreditCard, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

export default function WalletScreen() {
  const cards = [
    { id: '1', type: 'Visa', last4: '4242', exp: '12/24', balance: 5430.00 },
    { id: '2', type: 'Mastercard', last4: '8812', exp: '08/25', balance: 1200.50 }
  ];

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">My Wallet</h1>
          <p className="text-muted text-sm">Manage your linked accounts and cards</p>
        </div>
        <button className="btn btn-primary">
          <CreditCard size={18} />
          Add Card
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Cards Section */}
        {cards.map(card => (
          <div key={card.id} className="card glass-panel" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', border: 'none' }}>
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg">{card.type}</span>
              <MoreHorizontal size={24} />
            </div>
            <div className="mb-6">
              <p className="text-sm opacity-80 mb-1">Total Balance</p>
              <h2 className="text-3xl font-bold">${card.balance.toFixed(2)}</h2>
            </div>
            <div className="flex justify-between items-center text-sm">
              <p>**** **** **** {card.last4}</p>
              <p>Exp: {card.exp}</p>
            </div>
          </div>
        ))}
        
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <button className="btn btn-secondary flex-col p-6 hover-scale text-primary">
            <ArrowUpRight size={24} className="mb-2" />
            Send Money
          </button>
          <button className="btn btn-secondary flex-col p-6 hover-scale text-success">
            <ArrowDownRight size={24} className="mb-2" />
            Request Money
          </button>
          <button className="btn btn-secondary flex-col p-6 hover-scale text-primary">
            <CreditCard size={24} className="mb-2" />
            Top Up
          </button>
          <button className="btn btn-secondary flex-col p-6 hover-scale text-muted-foreground">
            <MoreHorizontal size={24} className="mb-2" />
            More
          </button>
        </div>
      </div>
    </div>
  );
}
