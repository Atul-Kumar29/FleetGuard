import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Truck,
  BarChart3,
  Activity,
  Car,
  ShieldCheck,
  Wrench,
  Settings,
  Bell,
  Shield,
  X,
  LogOut,
  FileText
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, onLogout, onClose }) {
  const { user } = useAuth();

  const getMenuItems = () => {
    if (!user) return [];

    const baseItems = [];

    // All authenticated users can access dashboard
    baseItems.push({ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['FLEET_MANAGER', 'DRIVER', 'MECHANIC', 'ADMIN'] });

    // Fleet managers and admins have full fleet management capability
    if (['FLEET_MANAGER', 'ADMIN'].includes(user.role)) {
      baseItems.push({ id: 'register', label: 'Register Vehicle', icon: PlusCircle, roles: ['FLEET_MANAGER', 'ADMIN'] });
      baseItems.push({ id: 'fleet', label: 'Fleet Management', icon: Truck, roles: ['FLEET_MANAGER', 'ADMIN'] });
      baseItems.push({ id: 'my-vehicles', label: 'Driver Assignments', icon: Car, roles: ['FLEET_MANAGER', 'ADMIN'] });
      baseItems.push({ id: 'services', label: 'Service Logs', icon: Wrench, roles: ['FLEET_MANAGER', 'ADMIN'] });
      baseItems.push({ id: 'fleet-analytics', label: 'Fleet Analytics', icon: BarChart3, roles: ['FLEET_MANAGER', 'ADMIN'] });
      baseItems.push({ id: 'predictive-maintenance', label: 'Predictive Risk', icon: Activity, roles: ['FLEET_MANAGER', 'ADMIN'] });
    }

    // Drivers specific items
    if (user.role === 'DRIVER') {
      baseItems.push({ id: 'my-vehicles', label: 'My Vehicles', icon: Car, roles: ['DRIVER'] });
      baseItems.push({ id: 'compliance', label: 'Compliance', icon: ShieldCheck, roles: ['DRIVER'] });
    }

    // Mechanics specific items
    if (user.role === 'MECHANIC') {
      baseItems.push({ id: 'services', label: 'Service Logs', icon: Wrench, roles: ['MECHANIC'] });
    }

    // Admin panel and notifications
    if (user.role === 'ADMIN') {
      baseItems.push({ id: 'admin', label: 'Admin Panel', icon: Settings, roles: ['ADMIN'] });
      baseItems.push({ id: 'notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN'] });
      baseItems.push({ id: 'reports', label: 'Export Reports', icon: FileText, roles: ['ADMIN'] });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="flex flex-col h-screen w-64 bg-white border-r border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5 text-xl font-extrabold text-slate-900 tracking-tight">
          <Shield size={22} className="text-blue-600" />
          <span>FleetGuard</span>
        </div>
        <button
          type="button"
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-semibold text-left transition-all duration-150
                ${isActive
                  ? 'bg-blue-50 text-blue-700 border-l-[3px] border-blue-600 pl-[11px] font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name || 'User'}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{user?.role || 'Unknown'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-bold hover:bg-red-100 hover:text-red-800 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
