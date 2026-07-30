import React from 'react';

export default function NonCompliantAssignmentModal({
  isOpen,
  onClose,
  vehicle,
  driver,
  expiredDocuments = [],
  onProceedWithOverride
}) {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="block-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="block-modal-header">
          <div className="block-icon-badge">🚫</div>
          <div>
            <h2>Assignment Blocked</h2>
            <p className="block-modal-subtitle">Vehicle Compliance Violation Intercepted</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="block-modal-body">
          {/* Target Vehicle Summary */}
          <div className="block-vehicle-card">
            <div className="block-vehicle-header">
              <span className="block-plate">{vehicle.license_plate}</span>
              <span className="block-status-badge">
                {vehicle.compliance_status || vehicle.status || 'EXPIRED'}
              </span>
            </div>
            <p className="block-vehicle-desc">
              {vehicle.make} {vehicle.model} • VIN: {vehicle.vin}
            </p>
          </div>

          <div className="block-warning-banner">
            Standard driver assignment is <strong>blocked</strong> because this vehicle has unresolved compliance issues or is under maintenance.
          </div>

          {/* List of Expired / Violating Items */}
          <div className="block-details-section">
            <h3>Compliance Issues Detected</h3>
            {expiredDocuments && expiredDocuments.length > 0 ? (
              <ul className="expired-docs-list">
                {expiredDocuments.map((doc, idx) => (
                  <li key={idx} className="expired-doc-item">
                    <span className="doc-icon">📄</span>
                    <div className="doc-info">
                      <strong className="doc-type">{doc.document_type || doc.type || 'Compliance Document'}</strong>
                      <span className="doc-reason">
                        {doc.status ? `Status: ${doc.status}` : ''}
                        {doc.expiration_date ? ` • Expired on ${new Date(doc.expiration_date).toLocaleDateString()}` : ''}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-docs-text">
                Vehicle status is <strong>{vehicle.status || 'IN_MAINTENANCE'}</strong> or has expired compliance registration documents on file.
              </p>
            )}
          </div>

          <div className="block-override-notice">
            To proceed, a Fleet Manager must authorize a <strong>Manager Override</strong> and enter a valid business justification log.
          </div>

          <div className="block-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel Assignment
            </button>
            <button
              type="button"
              className="btn-primary btn-warning"
              onClick={() => {
                onProceedWithOverride();
                onClose();
              }}
            >
              Proceed with Manager Override →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
