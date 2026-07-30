import React, { useState } from 'react';

export default function RoadLegalStatusShield({
  isCompliant = true,
  vehicle = null,
  complianceItems = [],
  loading = false
}) {
  const [showDetails, setShowDetails] = useState(true);

  if (loading) {
    return (
      <div className="status-shield-card shield-loading">
        <p>Checking vehicle road-legal compliance status...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="status-shield-card shield-no-vehicle">
        <div className="shield-header-row">
          <span className="shield-icon">🅿️</span>
          <div>
            <h3>No Active Vehicle Assignment</h3>
            <p>You currently do not have a vehicle assigned for active duty.</p>
          </div>
        </div>
      </div>
    );
  }

  const isLegal = isCompliant && vehicle.status === 'ACTIVE' && vehicle.compliance_status !== 'EXPIRED';

  return (
    <div className={`status-shield-card ${isLegal ? 'shield-road-legal' : 'shield-legal-risk'}`}>
      <div className="shield-banner-content">
        <div className="shield-main-info">
          <div className="shield-badge-container">
            <span className="shield-main-icon">{isLegal ? '🛡️' : '🚨'}</span>
            <div className="shield-titles">
              <span className={`shield-status-tag ${isLegal ? 'tag-legal' : 'tag-risk'}`}>
                {isLegal ? 'ROAD-LEGAL' : 'LEGAL RISK'}
              </span>
              <h2>{isLegal ? 'Cleared for Public Road Duty' : 'Operation Blocked / Legal Risk'}</h2>
            </div>
          </div>

          <p className="shield-description">
            {isLegal
              ? `Vehicle ${vehicle.license_plate} (${vehicle.make} ${vehicle.model}) satisfies all active safety, registration, and compliance mandates.`
              : `CRITICAL ALERT: Assigned vehicle ${vehicle.license_plate} has compliance violations or is under maintenance. Do not operate on public roads.`}
          </p>
        </div>

        <div className="shield-vehicle-pill">
          <span className="pill-label">Assigned Vehicle</span>
          <span className="pill-plate">{vehicle.license_plate}</span>
          <span className="pill-model">{vehicle.make} {vehicle.model}</span>
        </div>
      </div>

      {/* Expandable Document Compliance Breakdown */}
      {complianceItems && complianceItems.length > 0 && (
        <div className="shield-details-section">
          <button
            type="button"
            className="toggle-details-btn"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span>{showDetails ? '▼ Hide Compliance Breakdown' : '► View Compliance Breakdown'}</span>
            <span className="docs-count">({complianceItems.length} documents checked)</span>
          </button>

          {showDetails && (
            <div className="compliance-items-grid">
              {complianceItems.map((item, idx) => {
                const isDocExpired = item.is_expired || item.status === 'EXPIRED';
                return (
                  <div
                    key={item.id || idx}
                    className={`compliance-doc-card ${isDocExpired ? 'doc-expired' : 'doc-valid'}`}
                  >
                    <div className="doc-card-header">
                      <span className="doc-card-icon">{isDocExpired ? '⚠️' : '✅'}</span>
                      <strong className="doc-card-type">{item.document_type || 'Compliance Document'}</strong>
                    </div>
                    <div className="doc-card-meta">
                      <span className="doc-status-badge">
                        {isDocExpired ? 'EXPIRED' : 'VALID'}
                      </span>
                      {item.expiration_date && (
                        <span className="doc-exp-date">
                          Exp: {new Date(item.expiration_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
