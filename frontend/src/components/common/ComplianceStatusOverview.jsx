import ComplianceStatusCard from './ComplianceStatusCard';

export default function ComplianceStatusOverview({ compliance, onEdit }) {
  if (!compliance || compliance.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">No compliance documents on file.</div>
    );
  }

  const complianceSummary = {
    VALID:   compliance.filter((c) => c.status === 'VALID').length,
    WARNING: compliance.filter((c) => c.status === 'WARNING').length,
    EXPIRED: compliance.filter((c) => c.status === 'EXPIRED').length,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Summary pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
          {complianceSummary.VALID} Valid
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
          {complianceSummary.WARNING} Warning
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 border border-red-200 text-red-800 text-xs font-bold rounded-full">
          {complianceSummary.EXPIRED} Expired
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
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
