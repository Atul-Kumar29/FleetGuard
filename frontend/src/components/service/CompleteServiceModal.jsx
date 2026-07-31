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
  if (!modalOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div style={{ background: "white", padding: "18px", width: "420px", borderRadius: "6px", color: "black" }}>
        <h2 style={{ marginTop: 0 }}>{modalMode === "history" ? "Historical Service Record" : "Complete Service"}</h2>
        {modalError && <p style={{ color: "red" }}>{modalError}</p>}
        {successMessage && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 12px", borderRadius: "6px", marginBottom: "12px", fontSize: "14px", whiteSpace: "pre-line" }}>
            {successMessage}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label>Vehicle (required)</label>
            <select value={form.vehicleId} onChange={(e) => onFormChange("vehicleId", e.target.value)}>
              <option value="">Select vehicle</option>
              {vehicles.map((vehicleOption) => (
                <option key={vehicleOption.id} value={vehicleOption.id}>
                  {vehicleOption.licensePlate} - {vehicleOption.vehicle}
                </option>
              ))}
            </select>

            <label>Service Type (required)</label>
            <ServiceTypeDropdown
              value={form.serviceTypeId}
              onChange={(value) => onFormChange("serviceTypeId", value)}
              serviceTypes={serviceTypes}
              serviceTypesLoading={serviceTypesLoading}
              serviceTypesError={serviceTypesError}
            />

            <label>Service Date (required)</label>
            <input type="date" value={form.serviceDate} onChange={(e) => onFormChange("serviceDate", e.target.value)} />

            <label>Odometer Reading (required)</label>
            <input type="number" value={form.odometerReading} onChange={(e) => onFormChange("odometerReading", e.target.value)} />

            <label>Service Center</label>
            <input type="text" value={form.serviceCenter} onChange={(e) => onFormChange("serviceCenter", e.target.value)} />

            <label>Mechanic Name</label>
            <input type="text" value={form.mechanicName} onChange={(e) => onFormChange("mechanicName", e.target.value)} />

            <label>Cost</label>
            <input type="number" step="0.01" value={form.cost} onChange={(e) => onFormChange("cost", e.target.value)} />

            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => onFormChange("notes", e.target.value)} />

            <label>Next Service Date</label>
            <input type="date" value={form.nextServiceDate} onChange={(e) => onFormChange("nextServiceDate", e.target.value)} />

            <label>Next Service KM</label>
            <input type="number" value={form.nextServiceKm} onChange={(e) => onFormChange("nextServiceKm", e.target.value)} />

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" onClick={onCancel} style={{ padding: "6px 10px" }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ padding: "6px 10px", background: isSubmitting ? "#93c5fd" : "#2563eb", color: "white", border: "none", cursor: isSubmitting ? "not-allowed" : "pointer" }}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
