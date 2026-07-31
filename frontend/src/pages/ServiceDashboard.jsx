import { useCallback, useEffect, useRef, useState } from "react";
import CompleteServiceModal from "../components/service/CompleteServiceModal";
import ServiceFilters from "../components/service/ServiceFilters";
import ServiceHistoryTimeline from "../components/service/ServiceHistoryTimeline";
import ServiceQueueTable from "../components/service/ServiceQueueTable";
import { getServiceHistory, getServiceQueue, getServiceTypes, postCompleteService } from "../services/api";

export default function ServiceDashboard() {
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
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedVehicleName, setSelectedVehicleName] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(false);
  const [serviceTypesError, setServiceTypesError] = useState("");
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

  const loadServiceHistory = async (vehicleId, vehicleLabel) => {
    if (!vehicleId) {
      setHistoryRecords([]);
      setHistoryError("");
      setSelectedVehicleName("");
      setHistoryOpen(false);
      return;
    }

    setHistoryLoading(true);
    setHistoryError("");
    setHistoryRecords([]);
    setSelectedVehicleName(vehicleLabel || "");
    setHistoryOpen(true);

    try {
      const result = await getServiceHistory(vehicleId);
      const records = Array.isArray(result?.data) ? result.data : [];
      records.sort((a, b) => new Date(b.serviceDate || 0) - new Date(a.serviceDate || 0));
      setHistoryRecords(records);
    } catch (err) {
      setHistoryError(err.message || "Unable to load service history.");
    } finally {
      setHistoryLoading(false);
    }
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
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "20px" }}>Service Center Work Queue</h1>

      <ServiceFilters
        search={search}
        status={status}
        sort={sort}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onRefresh={loadData}
      />

      {loading && <p>Loading service queue...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <ServiceQueueTable
          vehicles={safeVehicles}
          onLoadHistory={loadServiceHistory}
          onCompleteService={openCompleteModal}
          onAddHistoricalRecord={openHistoryModal}
        />
      )}

      <ServiceHistoryTimeline
        historyOpen={historyOpen}
        selectedVehicleName={selectedVehicleName}
        historyLoading={historyLoading}
        historyError={historyError}
        historyRecords={historyRecords}
      />

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
