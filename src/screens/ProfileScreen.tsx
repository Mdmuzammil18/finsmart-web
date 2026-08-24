import { User, Settings, Bell, Shield, LogOut } from 'lucide-react';

export default function ProfileScreen() {
  return (
    <div className="flex-col gap-6" style={{ display: 'flex', maxWidth: '800px', margin: '0 auto' }}>
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted text-sm">Manage your account and preferences</p>
        </div>
      </header>

      <div className="card text-center mb-6" style={{ background: 'var(--primary-light)', border: 'none' }}>
        <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md" style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white' }}>
          <User size={48} />
        </div>
        <h2 className="text-xl font-bold text-primary-dark">John Doe</h2>
        <p className="text-sm text-primary">john.doe@example.com</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Settings</h3>
        
        <div className="flex-col gap-2" style={{ display: 'flex' }}>
          <button className="flex justify-between items-center p-4 hover-scale w-full text-left" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--secondary)' }}>
                <User size={20} className="text-primary" />
              </div>
              <span className="font-medium text-md text-foreground">Personal Information</span>
            </div>
            <span className="text-muted">&gt;</span>
          </button>

          <button className="flex justify-between items-center p-4 hover-scale w-full text-left" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--secondary)' }}>
                <Bell size={20} className="text-primary" />
              </div>
              <span className="font-medium text-md text-foreground">Notifications</span>
            </div>
            <span className="text-muted">&gt;</span>
          </button>

          <button className="flex justify-between items-center p-4 hover-scale w-full text-left" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--secondary)' }}>
                <Shield size={20} className="text-primary" />
              </div>
              <span className="font-medium text-md text-foreground">Security</span>
            </div>
            <span className="text-muted">&gt;</span>
          </button>

          <button className="flex justify-between items-center p-4 hover-scale w-full text-left" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--secondary)' }}>
                <Settings size={20} className="text-primary" />
              </div>
              <span className="font-medium text-md text-foreground">App Preferences</span>
            </div>
            <span className="text-muted">&gt;</span>
          </button>
        </div>
      </div>

      <button className="btn btn-secondary mt-4 w-full flex justify-center items-center gap-2" style={{ color: 'var(--destructive)' }}>
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );
}
