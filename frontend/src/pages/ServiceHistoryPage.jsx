import { useEffect, useState } from "react";
import { getServiceHistory } from "../services/api";
import {
  Wrench, MapPin, User, DollarSign, FileText, Calendar,
  Gauge, ChevronDown, ChevronUp, Clock, ArrowLeft, RefreshCw, Inbox, ShieldAlert
} from "lucide-react";

// ─── Service type colour tags ───────────────────────────────────────────────
function ServiceTypeTag({ type }) {
  const colors = {
    "Oil Change":             "bg-amber-100 text-amber-700 border-amber-200",
    "Air Filter Replacement": "bg-sky-100 text-sky-700 border-sky-200",
    "General Service":        "bg-blue-100 text-blue-700 border-blue-200",
    "Engine Service":         "bg-red-100 text-red-700 border-red-200",
    "Tyre Rotation":          "bg-purple-100 text-purple-700 border-purple-200",
  };
  const cls = colors[type] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      <Wrench className="w-3 h-3" />
      {type || "Unknown"}
    </span>
  );
}

// ─── Single expandable history card ─────────────────────────────────────────
function HistoryCard({ record, index, isLatest }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="relative pl-8">
      {/* Vertical timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
      {/* Timeline dot */}
      <div className={`absolute left-1.5 top-4 w-3 h-3 rounded-full border-2 ${
        isLatest ? "bg-blue-500 border-blue-500 shadow-md shadow-blue-200" : "bg-white border-slate-300"
      }`} />

      <div className={`mb-4 rounded-xl border bg-white shadow-sm overflow-hidden transition-all ${
        isLatest ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-200"
      }`}>
        {/* Header row — click to expand */}
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
              <span className="text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                Latest
              </span>
            )}
            <ServiceTypeTag type={record.serviceType} />
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Gauge className="w-3.5 h-3.5" />
              {record.odometerReading != null
                ? `${Number(record.odometerReading).toLocaleString()} km`
                : "—"}
            </div>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          }
        </button>

        {/* Expanded detail body */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Service Center</p>
                  <p className="text-sm text-slate-800 font-medium">{record.serviceCenter || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mechanic</p>
                  <p className="text-sm text-slate-800 font-medium">{record.mechanicName || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cost</p>
                  <p className="text-sm text-slate-800 font-medium">
                    {record.cost != null ? `₹ ${Number(record.cost).toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Notes</p>
                  <p className="text-sm text-slate-800 font-medium">{record.notes || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Next Service Date</p>
                  <p className="text-sm text-slate-800 font-medium">{record.nextServiceDate || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Gauge className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Next Service KM</p>
                  <p className="text-sm text-slate-800 font-medium">
                    {record.nextServiceKm != null
                      ? `${Number(record.nextServiceKm).toLocaleString()} km`
                      : "—"}
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

// ─── Full page ────────────────────────────────────────────────────────────────
export default function ServiceHistoryPage({ vehicleId, vehicleName, onBack }) {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getServiceHistory(vehicleId);
      const data   = Array.isArray(result?.data) ? result.data : [];
      data.sort((a, b) => new Date(b.serviceDate || 0) - new Date(a.serviceDate || 0));
      setRecords(data);
    } catch (err) {
      setError(err.message || "Unable to load service history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) fetchHistory();
  }, [vehicleId]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">

      {/* ── Back + Header ── */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="mt-1 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all"
          title="Back to Service Queue"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-0.5">FleetGuard</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Service History
          </h1>
          {vehicleName && (
            <p className="text-sm text-slate-500 mt-0.5">{vehicleName}</p>
          )}
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="mt-1 inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading service history...</p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold text-sm">Failed to load history</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
            <button
              onClick={fetchHistory}
              className="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && records.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
          <div className="p-3 bg-slate-100 rounded-full">
            <Inbox className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-slate-900 font-bold">No Records Found</h3>
          <p className="text-slate-500 text-xs max-w-xs">No previous service records found for this vehicle.</p>
        </div>
      )}

      {/* ── Timeline ── */}
      {!loading && !error && records.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Service History Timeline</h3>
              {vehicleName && <p className="text-xs text-slate-500 mt-0.5">{vehicleName}</p>}
            </div>
            <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
              {records.length} record{records.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Timeline body */}
          <div className="px-6 py-5">
            {records.map((record, index) => (
              <HistoryCard
                key={record.id}
                record={record}
                index={index}
                isLatest={index === 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
