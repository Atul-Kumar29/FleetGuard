import { useCallback, useEffect, useRef, useState } from "react";
import CompleteServiceModal from "../components/service/CompleteServiceModal";
import ServiceFilters from "../components/service/ServiceFilters";
import ServiceQueueTable from "../components/service/ServiceQueueTable";
import {
  getServiceQueue,
  getServiceTypes,
  postCompleteService,
  postStartService,
} from "../services/api";
import { Wrench, CheckCircle2, AlertCircle } from "lucide-react";

export default function ServiceDashboard({ onViewHistory }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("due_date");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalMode, setModalMode] = useState("complete");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(false);
  const [serviceTypesError, setServiceTypesError] = useState("");

  // Toast notification state
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const getEmptyForm = () => ({
    vehicleId: "",
    serviceTypeId: "",
    serviceDate: "",
    odometerReading: "",
    serviceCenter: "",
    mechanicName: "",
    cost: "",
    notes: "",
    nextServiceDate: "",
    nextServiceKm: "",
  });

  const [form, setForm] = useState(getEmptyForm());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getServiceQueue(search, status, sort);
      setVehicles(Array.isArray(result?.data) ? result.data : []);
    } catch (err) {
      setError(err.message || "Failed to load service queue.");
    } finally {
      setLoading(false);
    }
  }, [search, status, sort]);

  const loadServiceTypes = useCallback(async () => {
    setServiceTypesLoading(true);
    setServiceTypesError("");

    try {
      const result = await getServiceTypes();
      const normalized = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];
      setServiceTypes(normalized);
    } catch (err) {
      setServiceTypesError(err.message || "Unable to load service types.");
      setServiceTypes([]);
    } finally {
      setServiceTypesLoading(false);
    }
  }, []);

  const loadServiceHistory = (vehicleId, vehicleLabel) => {
    // Navigate to the dedicated history page instead of loading inline
    if (onViewHistory) onViewHistory(vehicleId, vehicleLabel);
  };

  useEffect(() => {
    const initializeData = async () => {
      await loadData();
      await loadServiceTypes();
    };

    initializeData();
  }, [loadData, loadServiceTypes]);

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const safeServiceTypes = Array.isArray(serviceTypes) ? serviceTypes : [];

  const handleFormChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const openCompleteModal = (vehicleId) => {
    setModalError("");
    setSuccessMessage("");
    setModalMode("complete");
    setForm({ ...getEmptyForm(), vehicleId });
    setModalOpen(true);
  };

  const openHistoryModal = (vehicleId) => {
    setModalError("");
    setSuccessMessage("");
    setModalMode("history");
    setForm({ ...getEmptyForm(), vehicleId });
    setModalOpen(true);
  };

  /**
   * Handle "Start Service" button click.
   * Marks the vehicle as IN_MAINTENANCE via the backend.
   * The Predictive Maintenance page will immediately reflect this status.
   */
  const handleStartService = async (vehicleId, vehicleName) => {
    try {
      await postStartService(vehicleId);
      showToast("success", `🔧 Service started for ${vehicleName || "vehicle"}. Status is now visible in Predictive Maintenance.`);
      loadData(); // Refresh queue so the row shows "In Service" status
    } catch (err) {
      showToast("error", err.message || "Failed to start service.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;

    setModalError("");
    setSuccessMessage("");
    submittingRef.current = true;
    setIsSubmitting(true);

    if (!form.vehicleId || !form.serviceTypeId || !form.serviceDate || form.odometerReading === "") {
      setModalError("Please fill required fields.");
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        vehicleId: form.vehicleId,
        serviceTypeId: form.serviceTypeId,
        serviceDate: form.serviceDate,
        odometerReading: Number(form.odometerReading),
        serviceCenter: form.serviceCenter || null,
        mechanicName: form.mechanicName || null,
        cost: form.cost ? Number(form.cost) : null,
        notes: form.notes || null,
        nextServiceDate: form.nextServiceDate || null,
        nextServiceKm: form.nextServiceKm ? Number(form.nextServiceKm) : null,
      };

      console.log('serviceTypeId ->', form.serviceTypeId);
      console.log('complete service payload ->', payload);

      await postCompleteService(payload);

      const selectedType = safeServiceTypes.find((t) => String(t.id) === String(form.serviceTypeId));
      const typeName = (selectedType?.service_name || "").toLowerCase();
      const clocks = ["Maintenance clock reset."];
      if (typeName.includes("insurance")) clocks.push("Insurance compliance updated.");
      if (typeName.includes("puc") || typeName.includes("emission")) clocks.push("PUC compliance updated.");
      if (typeName.includes("fitness") || typeName.includes("inspection")) clocks.push("Fitness compliance updated.");

      setForm(getEmptyForm());
      setSuccessMessage(`Service completed successfully.\n${clocks.join(" ")}`);
      loadData();

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      setModalError(err.message || "Failed to complete service.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">FleetGuard</p>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
          Service Center Work Queue
        </h1>
        <p className="text-sm text-slate-900">
          Press <span className="font-semibold text-emerald-600">Start Service</span> to begin work — status updates live in Predictive Maintenance.
        </p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-sm transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <ServiceFilters
        search={search}
        status={status}
        sort={sort}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onRefresh={loadData}
      />

      {loading && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Wrench className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading service queue...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {!loading && !error && (
        <ServiceQueueTable
          vehicles={safeVehicles}
          onLoadHistory={loadServiceHistory}
          onCompleteService={openCompleteModal}
          onAddHistoricalRecord={openHistoryModal}
          onStartService={handleStartService}
        />
      )}


      <CompleteServiceModal
        modalOpen={modalOpen}
        modalMode={modalMode}
        modalError={modalError}
        successMessage={successMessage}
        form={form}
        vehicles={safeVehicles}
        serviceTypes={safeServiceTypes}
        serviceTypesLoading={serviceTypesLoading}
        serviceTypesError={serviceTypesError}
        isSubmitting={isSubmitting}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
