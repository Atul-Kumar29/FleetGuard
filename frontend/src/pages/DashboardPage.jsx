import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  const getRoleWelcomeMessage = () => {
    switch (user?.role) {
      case 'FLEET_MANAGER':
        return "Welcome, Fleet Manager! Manage your vehicle fleet and compliance.";
      case 'DRIVER':
        return "Welcome, Driver! View your assigned vehicles and compliance status.";
      case 'MECHANIC':
        return "Welcome, Mechanic! Manage service records and maintenance.";
      case 'ADMIN':
        return "Welcome, Administrator! Full system access.";
      default:
        return "Welcome to FleetGuard!";
    }
  };

  const getQuickActions = () => {
    const actions = [];

    if (['FLEET_MANAGER', 'ADMIN'].includes(user?.role)) {
      actions.push({
        id: 'register',
        title: 'Register Vehicle',
        description: 'Add a new vehicle to your fleet',
        icon: '➕',
      });

      actions.push({
        id: 'fleet',
        title: 'Fleet Management',
        description: 'View and manage all vehicles',
        icon: '🚗',
      });
    }

    if (user?.role === 'DRIVER') {
      actions.push({
        id: 'my-vehicles',
        title: 'My Vehicles',
        description: 'View your assigned vehicles',
        icon: '🚙',
      });

      actions.push({
        id: 'compliance',
        title: 'Compliance Status',
        description: 'Check compliance status',
        icon: '✓',
      });
    }

    if (['MECHANIC', 'ADMIN'].includes(user?.role)) {
      actions.push({
        id: 'services',
        title: 'Service Logs',
        description: 'Manage maintenance records',
        icon: '🔧',
      });
    }

    if (user?.role === 'ADMIN') {
      actions.push({
        id: 'admin',
        title: 'Admin Panel',
        description: 'System administration',
        icon: '⚙️',
      });
    }

    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div className="page-content">
      <div className="dashboard-header">
        <h1>{getRoleWelcomeMessage()}</h1>
        <p className="user-info">Logged in as <strong>{user?.full_name}</strong> ({user?.role})</p>
      </div>

      {quickActions.length > 0 && (
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action) => (
              <div key={action.id} className="action-card">
                <div className="action-icon">{action.icon}</div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-info">
        <h2>System Information</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>API Status</h3>
            <p className="status-badge valid">✓ Connected</p>
          </div>
          <div className="info-card">
            <h3>Database</h3>
            <p className="status-badge valid">✓ Connected</p>
          </div>
          <div className="info-card">
            <h3>Authentication</h3>
            <p className="status-badge valid">✓ Authenticated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
