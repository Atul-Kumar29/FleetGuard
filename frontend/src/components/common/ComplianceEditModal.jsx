import { useState } from 'react';
import { updateCompliance } from '../../services/api';

export default function ComplianceEditModal({ compliance, onClose, onSave }) {
  const [formData, setFormData] = useState({
    expiration_date: compliance?.expiration_date ? compliance.expiration_date.split('T')[0] : '',
    document_number: compliance?.document_number || '',
    lead_time_days: compliance?.lead_time_days || 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'lead_time_days' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await updateCompliance(compliance.id, formData);
      if (onSave) {
        onSave(result.compliance_item);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update compliance document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Compliance Document</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>
              <span>Document Type</span>
              <input
                type="text"
                value={compliance?.document_type || 'N/A'}
                disabled
                className="readonly-input"
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              <span>Current Status</span>
              <input
                type="text"
                value={compliance?.status || 'N/A'}
                disabled
                className="readonly-input"
              />
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
                placeholder="Enter document number"
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              <span>Expiration Date</span>
              <input
                type="date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
                required
              />
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
              />
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
