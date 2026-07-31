import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDrivers, getFleetList, createAssignment, overrideAssignment, unassignDriver } from '../../services/api';
import NonCompliantAssignmentModal from './NonCompliantAssignmentModal';
import OverrideJustificationForm from './OverrideJustificationForm';

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
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Failed to unassign driver.');
    } finally {
      setLoading(false);
    }
  };

  // Sync selected vehicle when initialVehicle prop changes
  useEffect(() => {
    if (initialVehicle) {
      setSelectedVehicleId(initialVehicle.id);
    }
  }, [initialVehicle]);

  // Load drivers and vehicles when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setSuccessMessage('');
    setJustification('');
    setCategory('');
    setIsOverrideMode(false);
    setShowBlockModal(false);
    setBlockedDocs([]);

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
    setError('');
    setSuccessMessage('');

    if (!selectedVehicleId) {
      setError('Please select a target vehicle.');
      return;
    }

    if (!selectedDriverId) {
      setError('Please select a driver.');
      return;
    }

    // Intercept attempt on non-compliant vehicle if not already in override mode
    if (isVehicleNonCompliant && !isOverrideMode) {
      setBlockedDocs(currentVehicle.expired_documents || []);
      setShowBlockModal(true);
      return;
    }

    const managerId = user?.id || localStorage.getItem('fleetguard_user_id');
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

        const payload = {
          driver_id: selectedDriverId,
          vehicle_id: selectedVehicleId,
          assigned_by: managerId,
          justification: justification.trim()
        };

        const res = await overrideAssignment(payload);
        setSuccessMessage(res.message || 'Assignment override submitted successfully.');
      } else {
        const payload = {
          driver_id: selectedDriverId,
          vehicle_id: selectedVehicleId,
          assigned_by: managerId
        };

        const res = await createAssignment(payload);
        setSuccessMessage(res.message || 'Driver assigned successfully.');
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
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

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}>
        <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <div>
              <h2>Assign Driver</h2>
              <p className="drawer-subtitle">
                {currentVehicle
                  ? `Assign driver to ${currentVehicle.make} ${currentVehicle.model} (${currentVehicle.license_plate})`
                  : 'Select vehicle and driver for assignment'}
              </p>
            </div>
            <button className="drawer-close-btn" onClick={onClose} aria-label="Close drawer">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="drawer-body">
            {error && <div className="drawer-alert drawer-alert-error">{error}</div>}
            {successMessage && <div className="drawer-alert drawer-alert-success">{successMessage}</div>}

            {/* Assigned Driver Status Banner */}
            {currentVehicle?.assigned_driver && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase' }}>Currently Assigned Driver</div>
                  <div style={{ fontWeight: '600', color: '#1e3a8a', marginTop: '2px' }}>👤 {currentVehicle.assigned_driver.driver_name}</div>
                  {currentVehicle.assigned_driver.driver_email && <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{currentVehicle.assigned_driver.driver_email}</div>}
                </div>
                <button
                  type="button"
                  onClick={handleUnassignDriver}
                  disabled={loading}
                  style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  Unassign Driver
                </button>
              </div>
            )}

            {/* Vehicle Selection */}
            <div className="form-group">
              <label htmlFor="vehicle-select">Target Vehicle</label>
              {initialVehicle ? (
                <div className="vehicle-info-card">
                  <div className="vehicle-plate">{initialVehicle.license_plate}</div>
                  <div className="vehicle-desc">{initialVehicle.make} {initialVehicle.model} • VIN: {initialVehicle.vin}</div>
                  <span className={`status-tag status-${(initialVehicle.compliance_status || initialVehicle.status || 'ACTIVE').toLowerCase()}`}>
                    Compliance: {initialVehicle.compliance_status || initialVehicle.status || 'ACTIVE'}
                  </span>
                </div>
              ) : (
                <select
                  id="vehicle-select"
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  required
                  className="drawer-input"
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.license_plate} — {v.make} {v.model} ({v.compliance_status || v.status})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Driver Selection */}
            <div className="form-group">
              <label htmlFor="driver-select">Select Driver</label>
              {driversLoading ? (
                <p className="loading-text">Loading available drivers...</p>
              ) : (
                <select
                  id="driver-select"
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  required
                  className="drawer-input"
                >
                  <option value="">Choose a driver...</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name || d.email} ({d.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Compliance Warning / Override Toggle */}
            {isVehicleNonCompliant && (
              <div className="drawer-warning-box">
                <div className="warning-title">⚠️ Non-Compliant Vehicle Detected</div>
                <p className="warning-desc">
                  This vehicle has expired compliance documents or is currently under maintenance. Standard assignment is locked.
                </p>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isOverrideMode}
                    onChange={(e) => setIsOverrideMode(e.target.checked)}
                  />
                  <span>Enable Manager Override</span>
                </label>
              </div>
            )}

            {/* Override Justification Form Component */}
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
              <div className="drawer-actions">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Assign Driver'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <NonCompliantAssignmentModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        vehicle={currentVehicle}
        driver={selectedDriver}
        expiredDocuments={blockedDocs}
        onProceedWithOverride={() => {
          setIsOverrideMode(true);
          setShowBlockModal(false);
        }}
      />
    </>
  );
}
