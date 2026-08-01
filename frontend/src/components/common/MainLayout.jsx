import { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu, Shield } from 'lucide-react';

export default function MainLayout({ currentPage, onNavigate, children }) {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sidebar (always fixed, off-screen on mobile) ── */}
      <div className={`sidebar-fixed ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            onNavigate(page);
            setSidebarOpen(false);
          }}
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* ── Main content (always offset by sidebar width on desktop) ── */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-blue-600" />
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">FleetGuard</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
