import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDriverVehicle } from '../services/api';
import PreTripChecklistForm from '../components/common/PreTripChecklistForm';
import { PlusCircle, Truck, Car, ShieldCheck, Wrench, Settings, CheckCircle2, BarChart3, Activity } from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const [vehicleData, setVehicleData] = useState(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');

  useEffect(() => {
    if (user?.role !== 'DRIVER') return;

    let isMounted = true;

    async function loadAssignedVehicle() {
      try {
        setAssignmentLoading(true);
        setAssignmentError('');
        const data = await getDriverVehicle(user.id);
        if (isMounted) {
          setVehicleData(data);
        }
      } catch (err) {
        if (isMounted) {
          setVehicleData(null);
          setAssignmentError(err.message || 'Unable to load assigned vehicle.');
        }
      } finally {
        if (isMounted) {
          setAssignmentLoading(false);
        }
      }
    }

    loadAssignedVehicle();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.role]);

  const getRoleWelcomeMessage = () => {
    switch (user?.role) {
      case 'FLEET_MANAGER': return "Welcome, Fleet Manager! Manage your vehicle fleet and compliance.";
      case 'DRIVER':        return "Welcome, Driver! View your assigned vehicles and compliance status.";
      case 'MECHANIC':      return "Welcome, Mechanic! Manage service records and maintenance.";
      case 'ADMIN':         return "Welcome, Administrator! Full system access.";
      default:              return "Welcome to FleetGuard!";
    }
  };

  const getQuickActions = () => {
    const actions = [];
    if (['FLEET_MANAGER', 'ADMIN'].includes(user?.role)) {
      actions.push({ id: 'register', title: 'Register Vehicle', description: 'Add a new vehicle to your fleet', icon: PlusCircle });
      actions.push({ id: 'fleet', title: 'Fleet Management', description: 'View and manage all vehicles', icon: Truck });
      actions.push({ id: 'my-vehicles', title: 'Driver Assignments', description: 'View and manage driver vehicle assignments', icon: Car });
      actions.push({ id: 'services', title: 'Service Logs', description: 'Manage maintenance records', icon: Wrench });
      actions.push({ id: 'fleet-analytics', title: 'Fleet Analytics', description: 'View overall fleet operational analytics', icon: BarChart3 });
      actions.push({ id: 'predictive-maintenance', title: 'Predictive Risk', description: 'Monitor mileage-based maintenance risk', icon: Activity });
    }
    if (user?.role === 'DRIVER') {
      actions.push({ id: 'my-vehicles', title: 'My Vehicles', description: 'View your assigned vehicles', icon: Car });
      actions.push({ id: 'compliance', title: 'Compliance Status', description: 'Check compliance status', icon: ShieldCheck });
    }
    if (user?.role === 'MECHANIC') {
      actions.push({ id: 'services', title: 'Service Logs', description: 'Manage maintenance records', icon: Wrench });
    }
    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{getRoleWelcomeMessage()}</h1>
        <p className="text-sm text-slate-600 mt-1">
          Logged in as <strong className="text-slate-900">{user?.full_name}</strong> · {user?.role}
        </p>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onNavigate?.(action.id)}
                  className="flex flex-col items-start gap-3 p-5 bg-white border border-slate-200 rounded-xl text-left shadow-sm hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
                >
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <ActionIcon size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{action.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {user?.role === 'DRIVER' && (
        <section className="mb-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Pre-Trip Checklist</h2>
              <p className="text-sm text-slate-600 mt-1">Log today's vehicle safety inspection before departure.</p>
            </div>
          </div>

          {assignmentLoading && <p className="text-sm text-slate-500">Loading assigned vehicle...</p>}
          {assignmentError && <p className="text-sm text-red-600">{assignmentError}</p>}

          {!assignmentLoading && !assignmentError && vehicleData?.vehicle && (
            <PreTripChecklistForm
              driverId={user?.id}
              vehicleId={vehicleData.vehicle.id}
            />
          )}

          {!assignmentLoading && !assignmentError && !vehicleData?.vehicle && !vehicleData?.no_assignment && (
            <p className="text-sm text-slate-500">No active vehicle assignment was found yet.</p>
          )}

          {!assignmentLoading && !assignmentError && vehicleData?.no_assignment && (
            <p className="text-sm text-slate-500">You currently do not have a vehicle assigned for active duty.</p>
          )}
        </section>
      )}

      {/* System Info */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-4">System Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['API Status', 'Database', 'Authentication'].map((label) => (
            <div key={label} className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
              <p className="text-sm font-bold text-slate-900 mb-2">{label}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <CheckCircle2 size={13} /> Connected
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
