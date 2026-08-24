import { Outlet, NavLink } from 'react-router-dom';
import { Home, Receipt, Wallet, Users, User, Plus, Sparkles } from 'lucide-react';
import './Layout.css';

export function Layout() {
  return (
    <div className="app-container">
      {/* Sidebar for desktop */}
      <aside className="sidebar hidden md:flex">
        <div className="sidebar-header">
          <h1 className="text-xl font-bold text-primary">ExpenseTracker</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={20} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Receipt size={20} />
            <span>Expenses</span>
          </NavLink>
          <NavLink to="/wallet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Wallet size={20} />
            <span>Wallet</span>
          </NavLink>
          <NavLink to="/groups" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Groups</span>
          </NavLink>
          <NavLink to="/ai" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Sparkles size={20} />
            <span>AI Assistant</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-primary w-full">
            <Plus size={20} />
            <span>Add Expense</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="mobile-header md:hidden">
          <h1 className="text-lg font-bold text-primary">ExpenseTracker</h1>
        </header>
        <div className="page-container">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav for mobile */}
      <nav className="bottom-nav md:hidden glass-panel">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Receipt size={24} />
        </NavLink>
        <div className="fab-container">
          <button className="btn-primary fab">
            <Plus size={24} />
          </button>
        </div>
        <NavLink to="/wallet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wallet size={24} />
        </NavLink>
        <NavLink to="/ai" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Sparkles size={24} />
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={24} />
        </NavLink>
      </nav>
    </div>
  );
}
