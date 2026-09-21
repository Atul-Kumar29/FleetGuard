import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

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

// Types

interface Vehicle {
  id?: string | number;
  vehicleId?: string | number;
  vehicle_name?: string;
  vehicleName?: string;
  [key: string]: unknown;
}

interface ServiceType {
  id: string | number;
  service_name?: string;
  serviceName?: string;
  [key: string]: unknown;
}

interface ServiceForm {
  vehicleId: string;
  serviceTypeId: string;
  serviceDate: string;
  odometerReading: string;
  serviceCenter: string;
  mechanicName: string;
  cost: string;
  notes: string;
  nextServiceDate: string;
  nextServiceKm: string;
}

interface Toast {
  type: "success" | "error";
  message: string;
}

interface ServiceDashboardProps {
  onViewHistory?: (
    vehicleId: string | number,
    vehicleLabel?: string
  ) => void;
}

export default function ServiceDashboard({
  onViewHistory,
}: ServiceDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<string>("due_date");

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [modalMode, setModalMode] = useState<"complete" | "history">(
    "complete"
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const submittingRef = useRef<boolean>(false);

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceTypesLoading, setServiceTypesLoading] =
    useState<boolean>(false);
  const [serviceTypesError, setServiceTypesError] = useState<string>("");

  // Toast notification state
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (
    type: "success" | "error",
    message: string
  ): void => {
    setToast({
      type,
      message,
    });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const getEmptyForm = (): ServiceForm => ({
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

  const [form, setForm] = useState<ServiceForm>(getEmptyForm());

  // Load service queue

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const result = await getServiceQueue(search, status, sort);

      setVehicles(
        Array.isArray(result?.data)
          ? (result.data as Vehicle[])
          : []
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load service queue.");
      }
    } finally {
      setLoading(false);
    }
  }, [search, status, sort]);

  // Load service types

  const loadServiceTypes = useCallback(async (): Promise<void> => {
    setServiceTypesLoading(true);
    setServiceTypesError("");

    try {
      const result = await getServiceTypes();

      const normalized: ServiceType[] = Array.isArray(result)
        ? (result as ServiceType[])
        : Array.isArray(result?.data)
        ? (result.data as ServiceType[])
        : [];

      setServiceTypes(normalized);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServiceTypesError(err.message);
      } else {
        setServiceTypesError("Unable to load service types.");
      }

      setServiceTypes([]);
    } finally {
      setServiceTypesLoading(false);
    }
  }, []);

  // Service history

  const loadServiceHistory = (
    vehicleId: string | number,
    vehicleLabel?: string
  ): void => {
    if (onViewHistory) {
      onViewHistory(vehicleId, vehicleLabel);
    }
  };

  // Initial data loading

  useEffect(() => {
    const initializeData = async (): Promise<void> => {
      await loadData();
      await loadServiceTypes();
    };

    initializeData();
  }, [loadData, loadServiceTypes]);

  // Make sure these are always arrays

  const safeVehicles: Vehicle[] = Array.isArray(vehicles)
    ? vehicles
    : [];

  const safeServiceTypes: ServiceType[] = Array.isArray(serviceTypes)
    ? serviceTypes
    : [];

  // Form handling

  const handleFormChange = (
    field: keyof ServiceForm,
    value: string
  ): void => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  // Open complete modal

  const openCompleteModal = (
    vehicleId: string | number
  ): void => {
    setModalError("");
    setSuccessMessage("");
    setModalMode("complete");

    setForm({
      ...getEmptyForm(),
      vehicleId: String(vehicleId),
    });

    setModalOpen(true);
  };

  // Open history modal

  const openHistoryModal = (
    vehicleId: string | number
  ): void => {
    setModalError("");
    setSuccessMessage("");
    setModalMode("history");

    setForm({
      ...getEmptyForm(),
      vehicleId: String(vehicleId),
    });

    setModalOpen(true);
  };

  // Start service

  const handleStartService = async (
    vehicleId: string | number,
    vehicleName?: string
  ): Promise<void> => {
    try {
      await postStartService(String(vehicleId));

      showToast(
        "success",
        `🔧 Service started for ${
          vehicleName || "vehicle"
        }. Status is now visible in Predictive Maintenance.`
      );

      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast("error", err.message);
      } else {
        showToast("error", "Failed to start service.");
      }
    }
  };

  // Complete service

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (submittingRef.current) {
      return;
    }

    setModalError("");
    setSuccessMessage("");

    submittingRef.current = true;
    setIsSubmitting(true);

    // Required fields validation

    if (
      !form.vehicleId ||
      !form.serviceTypeId ||
      !form.serviceDate ||
      form.odometerReading === ""
    ) {
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
        nextServiceKm: form.nextServiceKm
          ? Number(form.nextServiceKm)
          : null,
      };

      console.log("serviceTypeId ->", form.serviceTypeId);
      console.log("complete service payload ->", payload);

      await postCompleteService(payload);

      const selectedType = safeServiceTypes.find(
        (type: ServiceType) =>
          String(type.id) === String(form.serviceTypeId)
      );

      const typeName = (
        selectedType?.service_name ||
        selectedType?.serviceName ||
        ""
      ).toLowerCase();

      const clocks: string[] = [
        "Maintenance clock reset.",
      ];

      if (typeName.includes("insurance")) {
        clocks.push("Insurance compliance updated.");
      }

      if (
        typeName.includes("puc") ||
        typeName.includes("emission")
      ) {
        clocks.push("PUC compliance updated.");
      }

      if (
        typeName.includes("fitness") ||
        typeName.includes("inspection")
      ) {
        clocks.push("Fitness compliance updated.");
      }

      // Reset form

      setForm(getEmptyForm());

      setSuccessMessage(
        `Service completed successfully.\n${clocks.join(" ")}`
      );

      // Refresh queue

      await loadData();

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError("Failed to complete service.");
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
          FleetGuard
        </p>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
          Service Center Work Queue
        </h1>

        <p className="text-sm text-slate-900">
          Press{" "}
          <span className="font-semibold text-emerald-600">
            Start Service
          </span>{" "}
          to begin work — status updates live in Predictive
          Maintenance.
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

      {/* Filters */}

      <ServiceFilters
        search={search}
        status={status}
        sort={sort}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onRefresh={loadData}
      />

      {/* Loading */}

      {loading && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Wrench className="w-8 h-8 text-blue-500 animate-spin" />

          <p className="text-sm font-semibold text-slate-500">
            Loading service queue...
          </p>
        </div>
      )}

      {/* Error */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Service Queue */}

      {!loading && !error && (
        <ServiceQueueTable
          vehicles={safeVehicles}
          onLoadHistory={loadServiceHistory}
          onCompleteService={openCompleteModal}
          onAddHistoricalRecord={openHistoryModal}
          onStartService={handleStartService}
        />
      )}

      {/* Complete Service Modal */}

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