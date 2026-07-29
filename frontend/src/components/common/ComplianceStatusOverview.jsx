import ComplianceStatusCard from './ComplianceStatusCard';

export default function ComplianceStatusOverview({ compliance, onEdit }) {
  if (!compliance || compliance.length === 0) {
    return (
      <div className="compliance-overview">
        <p className="empty-state">No compliance documents</p>
      </div>
    );
  }

  const complianceSummary = {
    VALID: compliance.filter((c) => c.status === 'VALID').length,
    WARNING: compliance.filter((c) => c.status === 'WARNING').length,
    EXPIRED: compliance.filter((c) => c.status === 'EXPIRED').length,
  };

  const overallStatus =
    complianceSummary.EXPIRED > 0
      ? 'EXPIRED'
      : complianceSummary.WARNING > 0
        ? 'WARNING'
        : 'VALID';

  return (
    <div className="compliance-overview">
      <div className="compliance-summary">
        <div className="summary-item valid">
          <span className="count">{complianceSummary.VALID}</span>
          <span className="label">Valid</span>
        </div>
        <div className="summary-item warning">
          <span className="count">{complianceSummary.WARNING}</span>
          <span className="label">Warning</span>
        </div>
        <div className="summary-item expired">
          <span className="count">{complianceSummary.EXPIRED}</span>
          <span className="label">Expired</span>
        </div>
      </div>

      <div className="compliance-list">
        {compliance.map((item) => (
          <ComplianceStatusCard
            key={item.id}
            compliance={item}
            onEdit={onEdit}
            compact={false}
          />
        ))}
      </div>
    </div>
  );
}
