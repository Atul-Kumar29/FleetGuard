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
import AdminDashboard from './pages/AdminDashboard';
import NotificationPage from './pages/NotificationPage';
import ServiceDashboard from './pages/ServiceDashboard';
import ServiceHistoryPage from './pages/ServiceHistoryPage';
import DriverDashboard from './pages/DriverDashboard';
import ReportsPage from './pages/ReportsPage';

interface ServiceVehicle {
  id: string | number;
  name: string;
}

function AppContent() {
  const { user } = useAuth();

  const [currentPage, setCurrentPage] =
    useState<string>('dashboard');

  const [selectedVehicleId, setSelectedVehicleId] =
    useState<string | number | null>(null);

  const [selectedServiceVehicle, setSelectedServiceVehicle] =
    useState<ServiceVehicle>({
      id: '',
      name: '',
    });

  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={() => setCurrentPage('dashboard')}
      />
    );
  }

  const handleNavigate = (page: string): void => {
    setCurrentPage(page);
    setSelectedVehicleId(null);
  };

  const handleViewDetails = (
    vehicleId: string | number
  ): void => {
    setSelectedVehicleId(vehicleId);
    setCurrentPage('details');
  };

  const handleBackToFleet = (): void => {
    setCurrentPage('fleet');
    setSelectedVehicleId(null);
  };

  const handleViewServiceHistory = (
    vehicleId: string | number,
    vehicleName?: string
  ): void => {
    setSelectedServiceVehicle({
      id: vehicleId,
      name: vehicleName || '',
    });

    setCurrentPage('service-history');
  };

  const handleBackToServices = (): void => {
    setCurrentPage('services');
  };

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      {currentPage === 'dashboard' && (
        <DashboardPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'register' && (
        <ProtectedRoute
          allowedRoles={['FLEET_MANAGER', 'ADMIN']}
        >
          <VehicleRegistrationPage />
        </ProtectedRoute>
      )}

      {currentPage === 'fleet' && (
        <ProtectedRoute
          allowedRoles={[
            'FLEET_MANAGER',
            'ADMIN',
            'DRIVER',
          ]}
        >
          <FleetListPage
            onSelectVehicle={handleViewDetails}
          />
        </ProtectedRoute>
      )}

      {currentPage === 'details' && (
        <ProtectedRoute
          allowedRoles={[
            'FLEET_MANAGER',
            'ADMIN',
            'DRIVER',
          ]}
        >
          <VehicleDetailsPage
            vehicleId={selectedVehicleId}
            onBack={handleBackToFleet}
          />
        </ProtectedRoute>
      )}

      {currentPage === 'my-vehicles' && (
        <ProtectedRoute
          allowedRoles={[
            'DRIVER',
            'ADMIN',
            'FLEET_MANAGER',
          ]}
        >
          <DriverDashboard />
        </ProtectedRoute>
      )}

      {currentPage === 'compliance' && (
        <ProtectedRoute
          allowedRoles={[
            'DRIVER',
            'ADMIN',
            'FLEET_MANAGER',
          ]}
        >
          <DriverDashboard />
        </ProtectedRoute>
      )}

      {currentPage === 'services' && (
        <ProtectedRoute
          allowedRoles={[
            'MECHANIC',
            'FLEET_MANAGER',
            'ADMIN',
          ]}
        >
          <ServiceDashboard
            onViewHistory={handleViewServiceHistory}
          />
        </ProtectedRoute>
      )}

      {currentPage === 'service-history' && (
        <ProtectedRoute
          allowedRoles={[
            'MECHANIC',
            'FLEET_MANAGER',
            'ADMIN',
          ]}
        >
          <ServiceHistoryPage
            vehicleId={selectedServiceVehicle.id}
            vehicleName={selectedServiceVehicle.name}
            onBack={handleBackToServices}
          />
        </ProtectedRoute>
      )}

      {currentPage === 'predictive-maintenance' && (
        <ProtectedRoute
          allowedRoles={[
            'FLEET_MANAGER',
            'ADMIN',
          ]}
        >
          <PredictiveMaintenance />
        </ProtectedRoute>
      )}

      {currentPage === 'fleet-analytics' && (
        <ProtectedRoute
          allowedRoles={[
            'FLEET_MANAGER',
            'ADMIN',
          ]}
        >
          <FleetAnalytics />
        </ProtectedRoute>
      )}

      {currentPage === 'admin' && (
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      )}

      {currentPage === 'notifications' && (
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <NotificationPage />
        </ProtectedRoute>
      )}

      {currentPage === 'reports' && (
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ReportsPage />
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