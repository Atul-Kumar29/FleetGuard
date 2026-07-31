import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDrivers, getFleetList, createAssignment, overrideAssignment, unassignDriver } from '../../services/api';
import NonCompliantAssignmentModal from './NonCompliantAssignmentModal';
import OverrideJustificationForm from './OverrideJustificationForm';
import { X, User, AlertTriangle } from 'lucide-react';

export default function AssignDriverDrawer({
  isOpen,
  onClose,
  vehicle: initialVehicle = null,
  vehicles: initialVehicles = [],
  onSuccess
}) {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicle ? initialVehicle.id : '');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [justification, setJustification] = useState('');
  const [category, setCategory] = useState('');
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockedDocs, setBlockedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleUnassignDriver = async () => {
    if (!selectedVehicleId) return;
    try {
      setLoading(true);
      setError('');
      const res = await unassignDriver(selectedVehicleId);
      setSuccessMessage(res.message || 'Driver unassigned successfully.');
      if (onSuccess) setTimeout(() => { onSuccess(); onClose(); }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to unassign driver.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (initialVehicle) setSelectedVehicleId(initialVehicle.id); }, [initialVehicle]);

  useEffect(() => {
    if (!isOpen) return;
    setError(''); setSuccessMessage(''); setJustification(''); setCategory(''); setIsOverrideMode(false); setShowBlockModal(false); setBlockedDocs([]);

    async function fetchData() {
      try {
        setDriversLoading(true);
        const driverRes = await getDrivers();
        setDrivers(driverRes.drivers || []);
        if (!initialVehicle && initialVehicles.length === 0) {
          const fleetRes = await getFleetList({ limit: 100 });
          setVehicles(fleetRes.vehicles || []);
        } else if (initialVehicles.length > 0) {
          setVehicles(initialVehicles);
        }
      } catch (err) {
        setError(err.message || 'Failed to load drivers list.');
      } finally {
        setDriversLoading(false);
      }
    }
    fetchData();
  }, [isOpen, initialVehicle, initialVehicles]);

  if (!isOpen) return null;

  const currentVehicle = initialVehicle || vehicles.find((v) => v.id === selectedVehicleId);
  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);
  const isVehicleNonCompliant = currentVehicle && (currentVehicle.compliance_status === 'EXPIRED' || currentVehicle.status === 'IN_MAINTENANCE');

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(''); setSuccessMessage('');

    if (!selectedVehicleId) { setError('Please select a target vehicle.'); return; }
    if (!selectedDriverId) { setError('Please select a driver.'); return; }

    if (isVehicleNonCompliant && !isOverrideMode) {
      setBlockedDocs(currentVehicle.expired_documents || []);
      setShowBlockModal(true);
      return;
    }

    const storedUserData = JSON.parse(localStorage.getItem('fleetguard_user') || '{}');
    const managerId = user?.id || user?.user_id || user?.sub || storedUserData.id || storedUserData.user_id || storedUserData.sub || localStorage.getItem('fleetguard_user_id');
    if (!managerId) {
      setError('Unable to identify Fleet Manager session. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      if (isOverrideMode || isVehicleNonCompliant) {
        if (!justification || justification.trim().length < 10) {
          setError('Manager justification text must be at least 10 characters long.');
          setLoading(false);
          return;
        }
        const res = await overrideAssignment({ driver_id: selectedDriverId, vehicle_id: selectedVehicleId, assigned_by: managerId, justification: justification.trim() });
        setSuccessMessage(res.message || 'Assignment override submitted successfully.');
      } else {
        const res = await createAssignment({ driver_id: selectedDriverId, vehicle_id: selectedVehicleId, assigned_by: managerId });
        setSuccessMessage(res.message || 'Driver assigned successfully.');
      }
      if (onSuccess) setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err) {
      if (err.data && (err.data.expired_documents || err.data.error === 'Vehicle is not compliant')) {
        setBlockedDocs(err.data.expired_documents || []);
        setShowBlockModal(true);
        setIsOverrideMode(true);
        setError('Vehicle compliance check failed. Intercepted by compliance block guard.');
      } else {
        setError(err.message || 'Assignment request failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5";

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[480px] bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Assign Driver</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentVehicle
                ? `${currentVehicle.make} ${currentVehicle.model} (${currentVehicle.license_plate})`
                : 'Select vehicle and driver'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close drawer" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 flex flex-col gap-5">
          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-lg">{error}</div>}
          {successMessage && <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-lg">{successMessage}</div>}

          {/* Current assignment banner */}
          {currentVehicle?.assigned_driver && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 mb-0.5">Currently Assigned</p>
                <div className="flex items-center gap-1.5 text-sm font-bold text-blue-900">
                  <User size={14} /> {currentVehicle.assigned_driver.driver_name}
                </div>
                {currentVehicle.assigned_driver.driver_email && (
                  <p className="text-xs text-blue-600 mt-0.5">{currentVehicle.assigned_driver.driver_email}</p>
                )}
              </div>
              <button type="button" onClick={handleUnassignDriver} disabled={loading}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50">
                Unassign
              </button>
            </div>
          )}

          {/* Vehicle selection */}
          <div>
            <label className={labelClass}>Target Vehicle</label>
            {initialVehicle ? (
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-base font-bold text-slate-900">{initialVehicle.license_plate}</p>
                <p className="text-xs text-slate-500 mt-0.5">{initialVehicle.make} {initialVehicle.model} · VIN: {initialVehicle.vin}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                  ${(initialVehicle.compliance_status || 'ACTIVE') === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {initialVehicle.compliance_status || initialVehicle.status || 'ACTIVE'}
                </span>
              </div>
            ) : (
              <select id="vehicle-select" value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} required className={inputClass}>
                <option value="">Select a vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.license_plate} — {v.make} {v.model} ({v.compliance_status || v.status})</option>
                ))}
              </select>
            )}
          </div>

          {/* Driver selection */}
          <div>
            <label className={labelClass}>Select Driver</label>
            {driversLoading ? (
              <p className="text-xs text-slate-500 italic">Loading available drivers...</p>
            ) : (
              <select id="driver-select" value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} required className={inputClass}>
                <option value="">Choose a driver...</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.full_name || d.email} ({d.email})</option>
                ))}
              </select>
            )}
          </div>

          {/* Non-compliant warning */}
          {isVehicleNonCompliant && (
            <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-800 mb-1.5">
                <AlertTriangle size={16} className="text-amber-600" /> Non-Compliant Vehicle Detected
              </div>
              <p className="text-xs text-amber-700 mb-3">This vehicle has expired compliance documents or is currently under maintenance. Standard assignment is locked.</p>
              <label className="flex items-center gap-2 text-xs font-bold text-amber-800 cursor-pointer">
                <input type="checkbox" checked={isOverrideMode} onChange={(e) => setIsOverrideMode(e.target.checked)} />
                Enable Manager Override
              </label>
            </div>
          )}

          {/* Override or action row */}
          {isOverrideMode ? (
            <OverrideJustificationForm
              value={justification}
              onChange={setJustification}
              category={category}
              onCategoryChange={setCategory}
              onSubmit={handleSubmit}
              onCancel={onClose}
              loading={loading}
              minChars={10}
              submitText="Force Assignment"
            />
          ) : (
            <div className="flex gap-3 justify-end mt-auto pt-4 border-t border-slate-100">
              <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm disabled:bg-slate-300">
                {loading ? 'Processing...' : 'Assign Driver'}
              </button>
            </div>
          )}
        </form>
      </div>

      <NonCompliantAssignmentModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        vehicle={currentVehicle}
        driver={selectedDriver}
        expiredDocuments={blockedDocs}
        onProceedWithOverride={() => { setIsOverrideMode(true); setShowBlockModal(false); }}
      />
    </>
  );
}
