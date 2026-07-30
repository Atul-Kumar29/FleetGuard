import { useState, useEffect } from 'react';
import { getVehicleDetails } from '../services/api';
import ComplianceCreateModal from '../components/common/ComplianceCreateModal';
import ComplianceEditModal from '../components/common/ComplianceEditModal';
import ComplianceStatusOverview from '../components/common/ComplianceStatusOverview';
import AssignDriverDrawer from '../components/common/AssignDriverDrawer';

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusColor(status) {
  switch (status) {
    case 'ACTIVE':
      return '#10b981';
    case 'IN_MAINTENANCE':
      return '#f59e0b';
    case 'DECOMMISSIONED':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}


export default function VehicleDetailsPage({ vehicleId, onBack }) {
  const [vehicle, setVehicle] = useState(null);
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignDrawer, setShowAssignDrawer] = useState(false);
  const [selectedCompliance, setSelectedCompliance] = useState(null);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const result = await getVehicleDetails(vehicleId);
      setVehicle(result.vehicle);
      setCompliance(result.compliance_items || []);
    } catch (err) {
      setError(err.message || 'Unable to load vehicle details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      loadDetails();
    }
  }, [vehicleId]);

  const handleEditCompliance = (complianceItem) => {
    setSelectedCompliance(complianceItem);
    setShowEditModal(true);
  };

  const handleComplianceSave = (updatedCompliance) => {
    setCompliance((prev) =>
      prev.map((item) => (item.id === updatedCompliance.id ? updatedCompliance : item))
    );
  };

  const handleComplianceCreate = (createdCompliance) => {
    setCompliance((current) => [...current, createdCompliance]);
  };

  if (loading) {
    return <div className="details-page"><p>Loading vehicle details...</p></div>;
  }

  if (error) {
    return (
      <div className="details-page">
        <div className="error-banner">{error}</div>
        <button onClick={onBack}>Back to Fleet</button>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="details-page">
        <p>Vehicle not found.</p>
        <button onClick={onBack}>Back to Fleet</button>
      </div>
    );
  }

  return (
    <div className="details-page">
      <button onClick={onBack} className="back-button">← Back</button>

      <div className="details-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>{vehicle.make} {vehicle.model}</h1>
            <p className="subtitle">{vehicle.year} | {vehicle.type}</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowAssignDrawer(true)}
          >
            Assign Driver
          </button>
        </div>

        <div className="details-grid">
          <section>
            <h2>Registration Details</h2>
            <div className="detail-row">
              <span className="label">VIN:</span>
              <span className="value">{vehicle.vin}</span>
            </div>
            <div className="detail-row">
              <span className="label">License Plate:</span>
              <span className="value">{vehicle.license_plate}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value badge" style={{ backgroundColor: getStatusColor(vehicle.status) }}>
                {vehicle.status}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Current Mileage:</span>
              <span className="value">{vehicle.current_mileage.toLocaleString()} km</span>
            </div>
            <div className="detail-row">
              <span className="label">Registered:</span>
              <span className="value">{formatDate(vehicle.created_at)}</span>
            </div>
          </section>

          <section>
            <div className="section-header">
              <h2>Compliance Documents</h2>
              <button type="button" className="compliance-add-btn" onClick={() => setShowCreateModal(true)}>
                Add Document
              </button>
            </div>
            <ComplianceStatusOverview
              compliance={compliance}
              onEdit={handleEditCompliance}
            />
          </section>
        </div>
      </div>

      {showEditModal && selectedCompliance && (
        <ComplianceEditModal
          compliance={selectedCompliance}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCompliance(null);
          }}
          onSave={handleComplianceSave}
        />
      )}

      {showCreateModal && (
        <ComplianceCreateModal
          vehicleId={vehicle.id}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleComplianceCreate}
        />
      )}

      <AssignDriverDrawer
        isOpen={showAssignDrawer}
        onClose={() => setShowAssignDrawer(false)}
        vehicle={vehicle}
        onSuccess={loadDetails}
      />
    </div>
  );
}
