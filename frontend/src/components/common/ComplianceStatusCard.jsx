import { useState } from 'react';

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

function getStatusIcon(status) {
  switch (status) {
    case 'VALID':
    case 'ACTIVE':
      return '✓';
    case 'WARNING':
      return '⚠';
    case 'EXPIRED':
      return '✕';
    default:
      return '○';
  }
}

function getDocumentIcon(docType) {
  switch (docType) {
    case 'INSURANCE':
      return '🛡️';
    case 'REGISTRATION':
      return '📋';
    case 'SAFETY_INSPECTION':
      return '🔧';
    case 'EMISSIONS':
      return '🌍';
    default:
      return '📄';
  }
}

export default function ComplianceStatusCard({ compliance, onEdit, compact = false }) {
  const statusColor = getStatusColor(compliance.status);
  const statusIcon = getStatusIcon(compliance.status);
  const docIcon = getDocumentIcon(compliance.document_type);

  if (compact) {
    return (
      <div className="compliance-badge-compact" style={{ borderLeftColor: statusColor }}>
        <span className="doc-icon">{docIcon}</span>
        <span className="doc-type-compact">{compliance.document_type}</span>
        <span className="status-icon" style={{ color: statusColor }}>
          {statusIcon}
        </span>
      </div>
    );
  }

  return (
    <div className="compliance-card" style={{ borderLeftColor: statusColor }}>
      <div className="compliance-card-header">
        <div className="compliance-title">
          <span className="doc-icon">{docIcon}</span>
          <span className="doc-type">{compliance.document_type}</span>
        </div>
        <div className="compliance-status-badge" style={{ backgroundColor: statusColor }}>
          <span className="status-icon">{statusIcon}</span>
          <span>{compliance.status}</span>
        </div>
      </div>

      <div className="compliance-card-body">
        {compliance.document_number && (
          <div className="compliance-row">
            <span className="label">Document #:</span>
            <span className="value">{compliance.document_number}</span>
          </div>
        )}

        <div className="compliance-row">
          <span className="label">Expires:</span>
          <span className="value">{formatDate(compliance.expiration_date)}</span>
        </div>

        <div className="compliance-row">
          <span className="label">Last Verified:</span>
          <span className="value">{formatDate(compliance.last_verified_at)}</span>
        </div>

        {compliance.lead_time_days && (
          <div className="compliance-row">
            <span className="label">Lead Time:</span>
            <span className="value">{compliance.lead_time_days} days</span>
          </div>
        )}
      </div>

      {onEdit && (
        <button
          type="button"
          className="compliance-edit-btn"
          onClick={() => onEdit(compliance)}
        >
          Edit Details
        </button>
      )}
    </div>
  );
}
