import { useState } from 'react';
import { createCompliance } from '../../services/api';

const initialForm = {
  document_type: 'INSURANCE',
  document_number: '',
  expiration_date: '',
  lead_time_days: 30,
};

export default function ComplianceCreateModal({ vehicleId, onClose, onCreate }) {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === 'lead_time_days' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await createCompliance({ vehicle_id: vehicleId, ...formData });
      onCreate?.(result.compliance_item);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add compliance document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Compliance Document</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>
              <span>Document Type</span>
              <select name="document_type" value={formData.document_type} onChange={handleChange}>
                <option value="INSURANCE">Insurance</option>
                <option value="REGISTRATION">Registration</option>
                <option value="SAFETY_INSPECTION">Safety Inspection</option>
                <option value="EMISSIONS">Emissions</option>
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              <span>Document Number</span>
              <input
                type="text"
                name="document_number"
                value={formData.document_number}
                onChange={handleChange}
                maxLength="100"
                placeholder="Enter document number"
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              <span>Expiration Date</span>
              <input type="date" name="expiration_date" value={formData.expiration_date} onChange={handleChange} required />
            </label>
          </div>

          <div className="form-group">
            <label>
              <span>Lead Time Days (warning before expiry)</span>
              <input
                type="number"
                name="lead_time_days"
                min="0"
                max="365"
                value={formData.lead_time_days}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
