import React, { useState } from 'react';
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';

export default function RoadLegalStatusShield({
  isCompliant = true,
  vehicle = null,
  complianceItems = [],
  loading = false
}) {
  const [showDetails, setShowDetails] = useState(true);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-3">
        <Shield size={28} className="text-slate-400 shrink-0" />
        <p className="text-sm text-slate-500">Checking vehicle road-legal compliance status...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <Shield size={32} className="text-slate-400 shrink-0" />
        <div>
          <h3 className="text-base font-extrabold text-slate-900">No Active Vehicle Assignment</h3>
          <p className="text-sm text-slate-500 mt-0.5">You currently do not have a vehicle assigned for active duty.</p>
        </div>
      </div>
    );
  }

  const isLegal = isCompliant && vehicle.status === 'ACTIVE' && vehicle.compliance_status !== 'EXPIRED';

  return (
    <div className={`rounded-2xl p-6 text-white shadow-lg flex flex-col gap-4 ${isLegal ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : 'bg-gradient-to-br from-red-600 to-red-900'}`}>
      {/* Banner content */}
      <div className="flex items-start justify-between gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {isLegal ? <ShieldCheck size={36} className="text-white/90" /> : <ShieldAlert size={36} className="text-white/90" />}
            <div>
              <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-1
                ${isLegal ? 'bg-white/20 text-white' : 'bg-white text-red-800'}`}>
                {isLegal ? 'ROAD-LEGAL' : 'LEGAL RISK'}
              </span>
              <h2 className="text-lg font-extrabold text-white leading-tight">
                {isLegal ? 'Cleared for Public Road Duty' : 'Operation Blocked / Legal Risk'}
              </h2>
            </div>
          </div>
          <p className="text-sm text-white/85 leading-relaxed max-w-xl">
            {isLegal
              ? `Vehicle ${vehicle.license_plate} (${vehicle.make} ${vehicle.model}) satisfies all active safety, registration, and compliance mandates.`
              : `CRITICAL ALERT: Assigned vehicle ${vehicle.license_plate} has compliance violations or is under maintenance. Do not operate on public roads.`}
          </p>
        </div>

        {/* Vehicle pill */}
        <div className="shrink-0 bg-black/20 border border-white/20 rounded-xl px-4 py-3 min-w-[160px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Assigned Vehicle</p>
          <p className="text-xl font-extrabold text-white">{vehicle.license_plate}</p>
          <p className="text-xs text-white/80 mt-0.5">{vehicle.make} {vehicle.model}</p>
        </div>
      </div>

      {/* Compliance breakdown */}
      {complianceItems && complianceItems.length > 0 && (
        <div className="border-t border-white/20 pt-4">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-white/90 font-semibold hover:text-white transition-colors"
          >
            {showDetails ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {showDetails ? 'Hide Compliance Breakdown' : 'View Compliance Breakdown'}
            <span className="text-white/60 text-xs">({complianceItems.length} documents checked)</span>
          </button>

          {showDetails && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
              {complianceItems.map((item, idx) => {
                const isDocExpired = item.is_expired || item.status === 'EXPIRED';
                return (
                  <div key={item.id || idx} className="bg-white/10 border border-white/15 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {isDocExpired
                        ? <AlertTriangle size={15} className="text-amber-300" />
                        : <CheckCircle2 size={15} className="text-emerald-300" />}
                      <strong className="text-xs font-bold text-white truncate">{item.document_type || 'Compliance Document'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-extrabold ${isDocExpired ? 'text-red-300' : 'text-emerald-300'}`}>
                        {isDocExpired ? 'EXPIRED' : 'VALID'}
                      </span>
                      {item.expiration_date && (
                        <span className="text-white/60">Exp: {new Date(item.expiration_date).toLocaleDateString()}</span>
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
