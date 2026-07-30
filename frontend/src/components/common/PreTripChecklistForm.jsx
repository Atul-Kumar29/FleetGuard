import React, { useState } from 'react';
import { postPreTripChecklist } from '../../services/api';

const DEFAULT_ITEMS = [
  {
    id: 'tires_lights',
    label: 'Tires & Lights',
    icon: '🛞',
    description: 'Tread depth, tire pressure, headlights, brake lights & turn signals'
  },
  {
    id: 'brakes',
    label: 'Brake System',
    icon: '🛑',
    description: 'Foot brake responsiveness, air brake pressure & emergency parking brake'
  },
  {
    id: 'fluids',
    label: 'Fluid Levels',
    icon: '🧪',
    description: 'Engine oil level, radiator coolant, windshield washer fluid'
  },
  {
    id: 'safety_gear',
    label: 'Safety Equipment',
    icon: '🦺',
    description: 'Seatbelts operational, fire extinguisher charged, reflective triangles'
  }
];

export default function PreTripChecklistForm({ driverId, vehicleId, onSubmitted }) {
  const [itemsState, setItemsState] = useState({
    tires_lights: 'PASS',
    brakes: 'PASS',
    fluids: 'PASS',
    safety_gear: 'PASS'
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCompletedToday, setIsCompletedToday] = useState(false);

  const handleToggleItem = (id, status) => {
    setItemsState((prev) => ({
      ...prev,
      [id]: status
    }));
  };

  const handleAllPass = () => {
    setItemsState({
      tires_lights: 'PASS',
      brakes: 'PASS',
      fluids: 'PASS',
      safety_gear: 'PASS'
    });
  };

  const hasFailedItem = Object.values(itemsState).some((val) => val === 'FAIL');
  const overallStatus = hasFailedItem ? 'FAIL' : 'PASS';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driverId || !vehicleId) {
      setError('Driver and Vehicle details are required to submit pre-trip check.');
      return;
    }

    if (hasFailedItem && (!notes || notes.trim().length < 5)) {
      setError('Please provide issue notes for failed inspection items (minimum 5 characters).');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const payload = {
        driver_id: driverId,
        vehicle_id: vehicleId,
        status: overallStatus,
        passed: !hasFailedItem,
        checklist_items: itemsState,
        notes: notes.trim() || null
      };

      const res = await postPreTripChecklist(payload);
      setSuccessMessage(res.message || 'Pre-trip checklist recorded successfully!');
      setIsCompletedToday(true);

      if (onSubmitted) {
        onSubmitted(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to record pre-trip checklist.');
    } finally {
      setLoading(false);
    }
  };

  if (isCompletedToday) {
    return (
      <div className="pretrip-card pretrip-completed-card">
        <div className="completed-badge-icon">✅</div>
        <h3>Pre-Trip Inspection Complete</h3>
        <p className="completed-subtitle">
          Today's pre-trip safety checklist has been logged and certified. Status: <strong>{overallStatus}</strong>
        </p>
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={() => setIsCompletedToday(false)}
        >
          Submit New Check
        </button>
      </div>
    );
  }

  return (
    <div className="pretrip-card">
      <div className="pretrip-header">
        <div>
          <span className="pretrip-badge">📋 Pre-Trip Safety Check</span>
          <h2>Vehicle Duty Checklist</h2>
          <p className="pretrip-subtitle">Fast 4-item tap-through inspection before departure</p>
        </div>

        <button type="button" className="btn-all-pass" onClick={handleAllPass}>
          ⚡ All Pass ✅
        </button>
      </div>

      {error && <div className="pretrip-alert alert-error">{error}</div>}
      {successMessage && <div className="pretrip-alert alert-success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="pretrip-form">
        <div className="pretrip-items-list">
          {DEFAULT_ITEMS.map((item) => {
            const currentStatus = itemsState[item.id] || 'PASS';
            const isPass = currentStatus === 'PASS';

            return (
              <div
                key={item.id}
                className={`pretrip-item-row ${isPass ? 'row-pass' : 'row-fail'}`}
              >
                <div className="item-info">
                  <span className="item-icon">{item.icon}</span>
                  <div>
                    <strong className="item-title">{item.label}</strong>
                    <p className="item-desc">{item.description}</p>
                  </div>
                </div>

                <div className="item-tap-buttons">
                  <button
                    type="button"
                    className={`tap-btn tap-pass ${isPass ? 'active' : ''}`}
                    onClick={() => handleToggleItem(item.id, 'PASS')}
                  >
                    PASS ✅
                  </button>
                  <button
                    type="button"
                    className={`tap-btn tap-fail ${!isPass ? 'active' : ''}`}
                    onClick={() => handleToggleItem(item.id, 'FAIL')}
                  >
                    FAIL 🚨
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Issue Description Notes if any item fails */}
        {hasFailedItem && (
          <div className="pretrip-notes-section">
            <label htmlFor="pretrip-notes-input" className="notes-label">
              ⚠️ Report Failed Inspection Details <span className="required-star">*</span>
            </label>
            <textarea
              id="pretrip-notes-input"
              className="pretrip-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the failed item defect (e.g. low tire tread depth on rear left tire, brake light bulb blown)..."
              rows={2}
              required
            />
          </div>
        )}

        <div className="pretrip-footer">
          <div className={`status-summary-pill ${hasFailedItem ? 'status-fail' : 'status-pass'}`}>
            Overall Check: <strong>{overallStatus}</strong>
          </div>

          <button
            type="submit"
            className={`btn-primary ${hasFailedItem ? 'btn-danger' : 'btn-success'}`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : `Log Checklist (${overallStatus})`}
          </button>
        </div>
      </form>
    </div>
  );
}
