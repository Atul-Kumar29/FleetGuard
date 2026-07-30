import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDriverVehicle, getDrivers } from '../services/api';
import RoadLegalStatusShield from '../components/common/RoadLegalStatusShield';
import PreTripChecklistForm from '../components/common/PreTripChecklistForm';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(
    user?.role === 'DRIVER' ? user?.id : ''
  );
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch available drivers list for selection / inspection dropdown
  useEffect(() => {
    async function loadDrivers() {
      try {
        const res = await getDrivers();
        setDrivers(res.drivers || []);
      } catch (err) {
        console.error('Failed to load drivers:', err);
      }
    }
    loadDrivers();
  }, []);

  const fetchAssignmentData = async (targetId) => {
    try {
      setLoading(true);
      setError('');
      const idToFetch = targetId !== undefined ? targetId : selectedDriverId;
      const data = await getDriverVehicle(idToFetch);

      setVehicleData(data);
      if (data.driver && data.driver.id) {
        setSelectedDriverId(data.driver.id);
      }
    } catch (err) {
      if (err.data && (err.data.error === 'No active assignment found' || err.status === 404)) {
        setVehicleData({ no_assignment: true });
      } else {
        setError(err.message || 'Unable to load assigned vehicle status.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData(selectedDriverId);
  }, [selectedDriverId]);

  const handleDriverChange = (e) => {
    const newId = e.target.value;
    setSelectedDriverId(newId);
    fetchAssignmentData(newId);
  };

  return (
    <div className="driver-dashboard-container">
      <div className="driver-dashboard-header">
        <div>
          <p className="eyebrow">Driver Console</p>
          <h1>Driver Duty Dashboard</h1>
          <p className="subtitle">Real-time vehicle assignment compliance & road-legal clearance</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {drivers.length > 0 && (
            <div className="driver-selector-box">
              <label htmlFor="driver-filter-select" className="selector-label">Driver View:</label>
              <select
                id="driver-filter-select"
                value={selectedDriverId}
                onChange={handleDriverChange}
                className="driver-select-dropdown"
              >
                <option value="">Auto Detect (Latest Assignment)</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name || d.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="btn-secondary" onClick={() => fetchAssignmentData(selectedDriverId)} disabled={loading}>
            🔄 Refresh Status
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Road-Legal Status Shield Component */}
      <RoadLegalStatusShield
        isCompliant={vehicleData ? vehicleData.is_compliant : true}
        vehicle={vehicleData ? vehicleData.vehicle : null}
        complianceItems={vehicleData ? vehicleData.compliance_items : []}
        loading={loading}
      />

      {/* Pre-Trip Tap-Through Checklist UI Component */}
      {vehicleData && vehicleData.vehicle && (
        <PreTripChecklistForm
          driverId={selectedDriverId || (vehicleData.driver ? vehicleData.driver.id : user?.id)}
          vehicleId={vehicleData.vehicle.id}
          onSubmitted={() => fetchAssignmentData(selectedDriverId)}
        />
      )}

      {/* Assigned Vehicle Details & Action Panel */}
      {vehicleData && vehicleData.vehicle && (
        <div className="driver-vehicle-details-card">
          <h3>Assigned Duty Details</h3>
          <div className="details-summary-grid">
            <div className="summary-item">
              <span className="summary-label">License Plate</span>
              <strong className="summary-value plate-highlight">{vehicleData.vehicle.license_plate}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Make & Model</span>
              <span className="summary-value">{vehicleData.vehicle.make} {vehicleData.vehicle.model} ({vehicleData.vehicle.year})</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">VIN</span>
              <span className="summary-value vin-code">{vehicleData.vehicle.vin}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Assignment Status</span>
              <span className="status-tag status-active">{vehicleData.assignment?.status || 'ACTIVE'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
