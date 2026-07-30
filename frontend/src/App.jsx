import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/common/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehicleRegistrationPage from './pages/VehicleRegistrationPage';
import FleetListPage from './pages/FleetListPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import PredictiveMaintenance from './pages/PredictiveMaintenance';
import FleetAnalytics from './pages/FleetAnalytics';
import ServiceDashboard from './pages/ServiceDashboard';
import DriverDashboard from './pages/DriverDashboard';
function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  if (!user) {
    return <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />;
  }

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedVehicleId(null);
  };

  const handleViewDetails = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setCurrentPage('details');
  };

  const handleBackToFleet = () => {
    setCurrentPage('fleet');
    setSelectedVehicleId(null);
  };

  return (
    <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'dashboard' && <DashboardPage />}

      {currentPage === 'register' && (
        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN']}>
          <VehicleRegistrationPage />
        </ProtectedRoute>
      )}

      {currentPage === 'fleet' && (
        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN', 'DRIVER']}>
          <FleetListPage onSelectVehicle={handleViewDetails} />
        </ProtectedRoute>
      )}

      {currentPage === 'details' && (
        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN', 'DRIVER']}>
          <div style={{ position: 'relative', paddingTop: '40px' }}>
            <button onClick={handleBackToFleet} className="nav-back-button">← Back to Fleet</button>
            <VehicleDetailsPage vehicleId={selectedVehicleId} onBack={handleBackToFleet} />
          </div>
        </ProtectedRoute>
      )}

      {currentPage === 'my-vehicles' && (
        <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN', 'FLEET_MANAGER']}>
          <DriverDashboard />
        </ProtectedRoute>
      )}

      {currentPage === 'compliance' && (
        <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN', 'FLEET_MANAGER']}>
          <DriverDashboard />
        </ProtectedRoute>
      )}

      {currentPage === 'services' && (
        <ProtectedRoute allowedRoles={['MECHANIC', 'ADMIN']}>
          <div className="page-content">
            <h2>Service Logs</h2>
            <p>Coming soon: Manage service records</p>
          </div>
        </ProtectedRoute>
      )}

      {currentPage === 'predictive-maintenance' && (
        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN']}>
          <PredictiveMaintenance />
        </ProtectedRoute>
      )}

      {currentPage === 'fleet-analytics' && (
        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'ADMIN']}>
          <FleetAnalytics />
        </ProtectedRoute>
      )}

      {currentPage === 'admin' && (
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <div className="page-content">
            <h2>Admin Panel</h2>
            <p>Coming soon: Administrative tools</p>
          </div>
        </ProtectedRoute>
      )}
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
