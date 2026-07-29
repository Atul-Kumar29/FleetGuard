import { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function MainLayout({ currentPage, onNavigate, children }) {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          onNavigate(page);
          setSidebarOpen(false);
        }}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <header className="top-bar">
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="page-title">FleetGuard</h1>
        </header>

        <div className="content-area">
          {children}
        </div>
      </main>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
