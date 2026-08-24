import { Users, Plus, ChevronRight } from 'lucide-react';

export default function GroupsScreen() {
  const groups = [
    { id: '1', name: 'Apartment 4B', members: 3, totalOwed: 150.00 },
    { id: '2', name: 'Miami Trip', members: 5, totalOwed: -45.50 },
    { id: '3', name: 'Office Lunch', members: 4, totalOwed: 0 },
  ];

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-muted text-sm">Split expenses with friends and family</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          New Group
        </button>
      </header>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Active Groups</h3>
        
        {groups.length === 0 ? (
          <div className="text-center p-8 text-muted">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>You are not part of any groups yet.</p>
          </div>
        ) : (
          <div className="flex-col gap-4" style={{ display: 'flex' }}>
            {groups.map(group => (
              <div key={group.id} className="flex justify-between items-center p-4 hover-scale" style={{ borderBottom: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }}>
                    <Users size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-md">{group.name}</p>
                    <p className="text-xs text-muted">{group.members} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {group.totalOwed > 0 && <p className="text-sm text-success">You are owed</p>}
                    {group.totalOwed < 0 && <p className="text-sm text-destructive">You owe</p>}
                    {group.totalOwed === 0 && <p className="text-sm text-muted">Settled up</p>}
                    {group.totalOwed !== 0 && (
                      <p className={`font-bold ${group.totalOwed > 0 ? 'text-success' : 'text-destructive'}`}>
                        ${Math.abs(group.totalOwed).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-muted" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
