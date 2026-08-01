import { Wrench, MapPin, User, DollarSign, FileText, Calendar, Gauge, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useState } from "react";

function ServiceTypeTag({ type }) {
  const colors = {
    "Oil Change":            "bg-amber-100 text-amber-700 border-amber-200",
    "Air Filter Replacement":"bg-sky-100 text-sky-700 border-sky-200",
    "General Service":       "bg-blue-100 text-blue-700 border-blue-200",
    "Engine Service":        "bg-red-100 text-red-700 border-red-200",
    "Tyre Rotation":         "bg-purple-100 text-purple-700 border-purple-200",
  };
  const cls = colors[type] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      <Wrench className="w-3 h-3" />
      {type || "Unknown"}
    </span>
  );
}

function HistoryCard({ record, index, isLatest }) {
  const [expanded, setExpanded] = useState(index === 0); // first card open by default

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />

      {/* Timeline dot */}
      <div className={`absolute left-1.5 top-4 w-3 h-3 rounded-full border-2 ${isLatest ? "bg-blue-500 border-blue-500 shadow-md shadow-blue-200" : "bg-white border-slate-300"}`} />

      <div className={`mb-4 rounded-xl border bg-white shadow-sm overflow-hidden transition-all ${isLatest ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-200"}`}>
        {/* Card header — always visible, click to expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {record.serviceDate || "—"}
            </div>
            {isLatest && (
              <span className="text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">Latest</span>
            )}
            <ServiceTypeTag type={record.serviceType} />
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Gauge className="w-3.5 h-3.5" />
              {record.odometerReading != null ? `${record.odometerReading.toLocaleString()} km` : "—"}
            </div>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          }
        </button>

        {/* Expanded body */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-3">
              {/* Service Center */}
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Service Center</p>
                  <p className="text-sm text-slate-800 font-medium">{record.serviceCenter || "—"}</p>
                </div>
              </div>

              {/* Mechanic */}
              <div className="flex items-start gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mechanic</p>
                  <p className="text-sm text-slate-800 font-medium">{record.mechanicName || "—"}</p>
                </div>
              </div>

              {/* Cost */}
              <div className="flex items-start gap-2">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cost</p>
                  <p className="text-sm text-slate-800 font-medium">
                    {record.cost != null ? `₹ ${Number(record.cost).toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Notes</p>
                  <p className="text-sm text-slate-800 font-medium">{record.notes || "—"}</p>
                </div>
              </div>

              {/* Next Service Date */}
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Next Service Date</p>
                  <p className="text-sm text-slate-800 font-medium">{record.nextServiceDate || "—"}</p>
                </div>
              </div>

              {/* Next Service KM */}
              <div className="flex items-start gap-2">
                <Gauge className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Next Service KM</p>
                  <p className="text-sm text-slate-800 font-medium">
                    {record.nextServiceKm != null ? `${Number(record.nextServiceKm).toLocaleString()} km` : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServiceHistoryTimeline({
  historyOpen,
  selectedVehicleName,
  historyLoading,
  historyError,
  historyRecords,
}) {
  if (!historyOpen) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Wrench className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Service History Timeline
          </h3>
          {selectedVehicleName && (
            <p className="text-xs text-slate-500 mt-0.5">{selectedVehicleName}</p>
          )}
        </div>
        {!historyLoading && historyRecords.length > 0 && (
          <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            {historyRecords.length} record{historyRecords.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {historyLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
            <Wrench className="w-4 h-4 animate-spin" />
            Loading service history...
          </div>
        )}

        {historyError && (
          <p className="text-red-500 text-sm py-2">{historyError}</p>
        )}

        {!historyLoading && !historyError && historyRecords.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-sm">
            No previous service records found.
          </div>
        )}

        {!historyLoading && !historyError && historyRecords.length > 0 && (
          <div className="mt-1">
            {historyRecords.map((record, index) => (
              <HistoryCard
                key={record.id}
                record={record}
                index={index}
                isLatest={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
