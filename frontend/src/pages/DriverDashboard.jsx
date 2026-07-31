import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDriverVehicle, getDrivers, getFleetList } from '../services/api';
import RoadLegalStatusShield from '../components/common/RoadLegalStatusShield';
import PreTripChecklistForm from '../components/common/PreTripChecklistForm';
import AssignDriverDrawer from '../components/common/AssignDriverDrawer';
import { RotateCw, User, Car, Plus } from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(user?.role === 'DRIVER' ? user?.id : '');
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fleetVehicles, setFleetVehicles] = useState([]);

  const isManager = ['FLEET_MANAGER', 'ADMIN'].includes(user?.role);

  // Fetch available drivers list
  useEffect(() => {
    async function loadDrivers() {
      try {
        setDriversLoading(true);
        const res = await getDrivers();
        const driverList = res.drivers || [];
        setDrivers(driverList);

        // For manager/admin, if no driver is selected yet, default to the first driver
        if (isManager && driverList.length > 0) {
          setSelectedDriverId((prev) => prev || driverList[0].id);
        }
      } catch (err) {
        console.error('Failed to load drivers:', err);
      } finally {
        setDriversLoading(false);
      }
    }

    loadDrivers();
  }, [user?.role, isManager]);

  // Load fleet list for assignment drawer if manager
  useEffect(() => {
    if (isManager) {
      getFleetList({ limit: 100 })
        .then((res) => setFleetVehicles(res.vehicles || []))
        .catch(() => {});
    }
  }, [isManager]);

  const fetchAssignmentData = async (targetId) => {
    const idToFetch = targetId !== undefined ? targetId : selectedDriverId;
    if (!idToFetch && !isManager) return;

    try {
      setLoading(true);
      setError('');
      const data = await getDriverVehicle(idToFetch);
      setVehicleData(data);
    } catch (err) {
      if (err.data && (err.data.error === 'No active assignment found' || err.status === 404)) {
        setVehicleData({ no_assignment: true });
      } else {
        setError(err.message || 'Unable to load assigned vehicle status.');
        setVehicleData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDriverId || !isManager) {
      fetchAssignmentData(selectedDriverId);
    }
  }, [selectedDriverId]);

  const handleDriverChange = (e) => {
    const newId = e.target.value;
    setSelectedDriverId(newId);
  };

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || (user?.role === 'DRIVER' ? user : null);

  const inputClass = "px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold";

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
            {isManager ? 'Fleet Management' : 'Driver Console'}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isManager ? 'Driver Assignments' : 'Driver Duty Dashboard'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isManager
              ? 'View assigned vehicles, road-legal clearance, and compliance for drivers'
              : 'Real-time vehicle assignment compliance & road-legal clearance'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isManager && (
            <div className="flex items-center gap-2">
              <label htmlFor="driver-filter-select" className="text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap">
                Select Driver:
              </label>
              {driversLoading ? (
                <span className="text-xs text-slate-400 font-semibold">Loading drivers...</span>
              ) : (
                <select
                  id="driver-filter-select"
                  value={selectedDriverId}
                  onChange={handleDriverChange}
                  className={inputClass}
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name || d.email} ({d.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <button
            onClick={() => fetchAssignmentData(selectedDriverId)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 border-l-4 border-l-red-500 text-red-800 text-sm font-medium rounded-lg">{error}</div>
      )}

      {/* Selected Driver Banner for Managers */}
      {isManager && selectedDriver && (
        <div className="flex items-center justify-between px-5 py-3.5 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Currently Inspecting Driver</p>
              <h2 className="text-base font-extrabold text-slate-900">{selectedDriver.full_name || selectedDriver.email}</h2>
            </div>
          </div>
          {isManager && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
            >
              <Plus size={14} /> Assign Vehicle
            </button>
          )}
        </div>
      )}

      {/* No Assignment Card */}
      {!loading && vehicleData?.no_assignment && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center gap-3 shadow-sm">
          <div className="p-3 bg-slate-100 rounded-full text-slate-400">
            <Car size={32} />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">No Active Vehicle Assignment</h3>
          <p className="text-sm text-slate-500 max-w-md">
            {isManager
              ? `No vehicle is currently assigned to ${selectedDriver?.full_name || selectedDriver?.email || 'this driver'}. You can assign a vehicle using the button below.`
              : 'You currently do not have a vehicle assigned for active duty.'}
          </p>
          {isManager && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
            >
              <Plus size={16} /> Assign Vehicle to Driver
            </button>
          )}
        </div>
      )}

      {/* Road-Legal Status Shield */}
      {(!vehicleData?.no_assignment || loading) && (
        <RoadLegalStatusShield
          isCompliant={vehicleData ? vehicleData.is_compliant : true}
          vehicle={vehicleData ? vehicleData.vehicle : null}
          complianceItems={vehicleData ? vehicleData.compliance_items : []}
          loading={loading}
        />
      )}

      {/* Pre-Trip Checklist */}
      {!loading && vehicleData?.vehicle && (
        <PreTripChecklistForm
          driverId={selectedDriverId || (vehicleData.driver ? vehicleData.driver.id : user?.id)}
          vehicleId={vehicleData.vehicle.id}
          onSubmitted={() => fetchAssignmentData(selectedDriverId)}
        />
      )}

      {/* Assigned Vehicle Details */}
      {!loading && vehicleData?.vehicle && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-4">Assigned Duty Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">License Plate</p>
              <strong className="text-base font-extrabold text-blue-700">{vehicleData.vehicle.license_plate}</strong>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Make &amp; Model</p>
              <span className="text-sm font-bold text-slate-900">{vehicleData.vehicle.make} {vehicleData.vehicle.model} ({vehicleData.vehicle.year})</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">VIN</p>
              <span className="text-xs font-mono font-semibold text-slate-700">{vehicleData.vehicle.vin}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Assignment</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
                {vehicleData.assignment?.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Drawer Modal */}
      {isManager && (
        <AssignDriverDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          vehicles={fleetVehicles}
          onSuccess={() => fetchAssignmentData(selectedDriverId)}
        />
      )}
    </div>
  );
}
