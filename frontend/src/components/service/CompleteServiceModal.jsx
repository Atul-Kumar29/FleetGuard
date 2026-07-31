import { useEffect, useState } from "react";
import { CalendarDays, Gauge, PlusCircle, Wrench, ShieldCheck } from "lucide-react";
import { getServiceHistory } from "../../services/api";
import ServiceTypeDropdown from "./ServiceTypeDropdown";

export default function CompleteServiceModal({
  modalOpen,
  modalMode,
  modalError,
  successMessage,
  form,
  vehicles,
  serviceTypes,
  serviceTypesLoading,
  serviceTypesError,
  isSubmitting,
  onFormChange,
  onSubmit,
  onCancel,
}) {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    if (!modalOpen || !form.vehicleId) {
      setHistoryRecords([]);
      setHistoryError("");
      return;
    }

    let cancelled = false;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");

      try {
        const result = await getServiceHistory(form.vehicleId);
        const records = Array.isArray(result?.data) ? result.data : [];
        records.sort((a, b) => new Date(b.serviceDate || 0) - new Date(a.serviceDate || 0));

        if (!cancelled) {
          setHistoryRecords(records);
        }
      } catch (err) {
        if (!cancelled) {
          setHistoryError(err.message || "Unable to load service history.");
          setHistoryRecords([]);
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [modalOpen, form.vehicleId]);

  if (!modalOpen) {
    return null;
  }

  const selectedVehicle = vehicles.find((vehicleOption) => String(vehicleOption.id) === String(form.vehicleId));
  const recentHistory = historyRecords.slice(0, 4);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-3 sm:p-4">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="max-h-[92vh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                  <Wrench className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === "history" ? "Historical Service Record" : "Complete Service"}
                </h2>
              </div>
              <p className="text-sm text-slate-900">
                Capture the latest service details and review the vehicle’s maintenance history before you submit.
              </p>
            </div>
            <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              {modalMode === "history" ? "Historical" : "New Record"}
            </div>
          </div>

          {modalError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {modalError}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 whitespace-pre-line">
              {successMessage}
            </div>
          )}

          {form.vehicleId && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedVehicle ? `${selectedVehicle.licensePlate} - ${selectedVehicle.vehicle}` : "Selected vehicle"}
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-900">
                  {historyLoading ? "Loading history" : `${recentHistory.length} recent record${recentHistory.length === 1 ? "" : "s"}`}
                </div>
              </div>

              {historyLoading ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-500">
                  Loading recent service history...
                </div>
              ) : historyError ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  {historyError}
                </div>
              ) : recentHistory.length > 0 ? (
                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {recentHistory.map((record) => (
                    <div key={record.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          {record.serviceType || "Service"}
                        </div>
                        <div className="text-xs font-medium text-slate-500">{record.serviceDate || "—"}</div>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 text-slate-900">
                          <Gauge className="h-3.5 w-3.5" />
                          {record.odometerReading != null ? `${Number(record.odometerReading).toLocaleString()} km` : "—"}
                        </span>
                        <span className="text-slate-900">{record.serviceCenter || "Service center not listed"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-500">
                  No prior service records for this vehicle yet.
                </div>
              )}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Vehicle (required)</label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={form.vehicleId}
                  onChange={(e) => onFormChange("vehicleId", e.target.value)}
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicleOption) => (
                    <option key={vehicleOption.id} value={vehicleOption.id}>
                      {vehicleOption.licensePlate} - {vehicleOption.vehicle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Service Type (required)</label>
                <ServiceTypeDropdown
                  value={form.serviceTypeId}
                  onChange={(value) => onFormChange("serviceTypeId", value)}
                  serviceTypes={serviceTypes}
                  serviceTypesLoading={serviceTypesLoading}
                  serviceTypesError={serviceTypesError}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Service Date (required)</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="date"
                  value={form.serviceDate}
                  onChange={(e) => onFormChange("serviceDate", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Odometer Reading (required)</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="number"
                  value={form.odometerReading}
                  onChange={(e) => onFormChange("odometerReading", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Service Center</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="text"
                  value={form.serviceCenter}
                  onChange={(e) => onFormChange("serviceCenter", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Mechanic Name</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="text"
                  value={form.mechanicName}
                  onChange={(e) => onFormChange("mechanicName", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Cost</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="number"
                  step="0.01"
                  value={form.cost}
                  onChange={(e) => onFormChange("cost", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Next Service Date</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="date"
                  value={form.nextServiceDate}
                  onChange={(e) => onFormChange("nextServiceDate", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Next Service KM</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  type="number"
                  value={form.nextServiceKm}
                  onChange={(e) => onFormChange("nextServiceKm", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Notes</label>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={form.notes}
                  onChange={(e) => onFormChange("notes", e.target.value)}
                />
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-col gap-2 border-t border-slate-200 bg-white pt-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <PlusCircle className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
