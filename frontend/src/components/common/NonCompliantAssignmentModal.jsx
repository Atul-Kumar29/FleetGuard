import React from 'react';
import { Ban, X, FileText, ArrowRight } from 'lucide-react';

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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-[520px] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 bg-red-50 border-b border-red-200 relative">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
            <Ban size={22} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-red-900">Assignment Blocked</h2>
            <p className="text-xs text-red-600">Vehicle Compliance Violation Intercepted</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-red-400 hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Vehicle summary */}
          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-base font-extrabold text-slate-900">{vehicle.license_plate}</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-extrabold uppercase rounded-full border border-red-200">
                {vehicle.compliance_status || vehicle.status || 'EXPIRED'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{vehicle.make} {vehicle.model} · VIN: {vehicle.vin}</p>
          </div>

          {/* Warning */}
          <div className="px-4 py-3 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl text-sm text-red-800">
            Standard driver assignment is <strong>blocked</strong> because this vehicle has unresolved compliance issues or is under maintenance.
          </div>

          {/* Expired documents */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-2">Compliance Issues Detected</h3>
            {expiredDocuments && expiredDocuments.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {expiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <FileText size={16} className="text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-xs font-bold text-red-800">{doc.document_type || doc.type || 'Compliance Document'}</strong>
                      <p className="text-[11px] text-red-600">
                        {doc.status ? `Status: ${doc.status}` : ''}
                        {doc.expiration_date ? ` · Expired on ${new Date(doc.expiration_date).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                Vehicle status is <strong>{vehicle.status || 'IN_MAINTENANCE'}</strong> or has expired compliance registration documents on file.
              </p>
            )}
          </div>

          {/* Override notice */}
          <p className="text-xs text-slate-600 bg-slate-50 border border-dashed border-slate-300 rounded-lg px-4 py-3">
            To proceed, a Fleet Manager must authorize a <strong>Manager Override</strong> and enter a valid business justification log.
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-all">
              Cancel Assignment
            </button>
            <button
              type="button"
              onClick={() => { onProceedWithOverride(); onClose(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
            >
              Proceed with Manager Override
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
