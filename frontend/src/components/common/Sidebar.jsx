import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ currentPage, onNavigate, onLogout }) {
  const { user } = useAuth();

  const getMenuItems = () => {
    if (!user) return [];

    const baseItems = [];

    // All authenticated users can access dashboard
    baseItems.push({
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      roles: ['FLEET_MANAGER', 'DRIVER', 'MECHANIC', 'ADMIN'],
    });

    // Fleet managers and admins can manage vehicles
    if (['FLEET_MANAGER', 'ADMIN'].includes(user.role)) {
      baseItems.push({
        id: 'register',
        label: 'Register Vehicle',
        icon: '➕',
        roles: ['FLEET_MANAGER', 'ADMIN'],
      });

      baseItems.push({
        id: 'fleet',
        label: 'Fleet Management',
        icon: '🚗',
        roles: ['FLEET_MANAGER', 'ADMIN'],
      });
    }

    // Drivers can view assigned vehicles
    if (user.role === 'DRIVER') {
      baseItems.push({
        id: 'my-vehicles',
        label: 'My Vehicles',
        icon: '🚙',
        roles: ['DRIVER'],
      });

      baseItems.push({
        id: 'compliance',
        label: 'Compliance',
        icon: '✓',
        roles: ['DRIVER'],
      });
    }

    // Mechanics can access service logs
    if (['MECHANIC', 'ADMIN'].includes(user.role)) {
      baseItems.push({
        id: 'services',
        label: 'Service Logs',
        icon: '🔧',
        roles: ['MECHANIC', 'ADMIN'],
      });
    }

    // Admins have full access
    if (user.role === 'ADMIN') {
      baseItems.push({
        id: 'admin',
        label: 'Admin Panel',
        icon: '⚙️',
        roles: ['ADMIN'],
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">⚙️</span>
          <span className="logo-text">FleetGuard</span>
        </div>
        <button type="button" className="sidebar-close" aria-label="Close sidebar">
          ✕
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.full_name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="user-details">
            <p className="user-name">{user?.full_name || 'User'}</p>
            <p className="user-role">{user?.role || 'Unknown'}</p>
          </div>
        </div>

        <button type="button" className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
