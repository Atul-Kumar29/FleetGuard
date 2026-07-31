import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, Shield, ClipboardList, Wrench, Globe, FileText } from 'lucide-react';

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusStyles(status) {
  switch (status) {
    case 'VALID':
    case 'ACTIVE':      return { badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200', border: 'border-l-emerald-500' };
    case 'WARNING':     return { badge: 'bg-amber-100 text-amber-800 border border-amber-200',   border: 'border-l-amber-500' };
    case 'EXPIRED':     return { badge: 'bg-red-100 text-red-800 border border-red-200',          border: 'border-l-red-500' };
    default:            return { badge: 'bg-slate-100 text-slate-600 border border-slate-200',    border: 'border-l-slate-400' };
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'VALID':
    case 'ACTIVE':  return <CheckCircle2 size={14} />;
    case 'WARNING': return <AlertTriangle size={14} />;
    case 'EXPIRED': return <XCircle size={14} />;
    default:        return <MinusCircle size={14} />;
  }
}

function getDocumentIcon(docType) {
  switch (docType) {
    case 'INSURANCE':         return <Shield size={16} className="text-blue-600" />;
    case 'REGISTRATION':      return <ClipboardList size={16} className="text-indigo-600" />;
    case 'SAFETY_INSPECTION': return <Wrench size={16} className="text-amber-600" />;
    case 'EMISSIONS':         return <Globe size={16} className="text-emerald-600" />;
    default:                  return <FileText size={16} className="text-slate-500" />;
  }
}

export default function ComplianceStatusCard({ compliance, onEdit, compact = false }) {
  const { badge, border } = getStatusStyles(compliance.status);
  const docIcon = getDocumentIcon(compliance.document_type);
  const statusIcon = getStatusIcon(compliance.status);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 border border-l-4 ${border} border-slate-200 rounded-md text-xs font-semibold`}>
        {docIcon}
        <span className="text-slate-800">{compliance.document_type}</span>
        <span className={`inline-flex items-center ${badge}`}>{statusIcon}</span>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-l-4 ${border} border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`}>
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2">
          {docIcon}
          <span className="text-sm font-bold text-slate-900">{compliance.document_type}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${badge}`}>
          {statusIcon}
          {compliance.status}
        </span>
      </div>

      {/* Detail Rows */}
      <div className="flex flex-col gap-1.5">
        {compliance.document_number && (
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-500">Document #</span>
            <span className="font-semibold text-slate-900">{compliance.document_number}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-500">Expires</span>
          <span className="font-semibold text-slate-900">{formatDate(compliance.expiration_date)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-500">Last Verified</span>
          <span className="font-semibold text-slate-900">{formatDate(compliance.last_verified_at)}</span>
        </div>
        {compliance.lead_time_days && (
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-500">Lead Time</span>
            <span className="font-semibold text-slate-900">{compliance.lead_time_days} days</span>
          </div>
        )}
      </div>

      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(compliance)}
          className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Edit Details
        </button>
      )}
    </div>
  );
}
