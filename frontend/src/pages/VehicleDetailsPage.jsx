import { useState, useEffect } from 'react';
import { getVehicleDetails } from '../services/api';
import ComplianceEditModal from '../components/common/ComplianceEditModal';

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
    case 'VALID':
      return '#10b981';
    case 'WARNING':
      return '#f59e0b';
    case 'EXPIRED':
    case 'IN_MAINTENANCE':
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
  const [selectedCompliance, setSelectedCompliance] = useState(null);

  useEffect(() => {
    async function loadDetails() {
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
    }

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
        <h1>{vehicle.make} {vehicle.model}</h1>
        <p className="subtitle">{vehicle.year} | {vehicle.type}</p>

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
            <h2>Compliance Documents</h2>
            {compliance.length === 0 ? (
              <p className="empty">No compliance documents on record.</p>
            ) : (
              <div className="compliance-list">
                {compliance.map((item) => (
                  <div
                    key={item.id}
                    className="compliance-item"
                    onClick={() => handleEditCompliance(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="compliance-header">
                      <span className="doc-type">{item.document_type}</span>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(item.status),
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    {item.document_number && (
                      <p className="doc-number">Document: {item.document_number}</p>
                    )}
                    <p className="expiry-date">
                      Expires: {formatDate(item.expiration_date)}
                    </p>
                    <p className="last-verified">
                      Last verified: {formatDate(item.last_verified_at)}
                    </p>
                    <button type="button" className="edit-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleEditCompliance(item);
                    }}>
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
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
    </div>
  );
}
