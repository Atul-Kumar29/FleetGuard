export default function ServiceHistoryTimeline({
  historyOpen,
  selectedVehicleName,
  historyLoading,
  historyError,
  historyRecords,
}) {
  if (!historyOpen) {
    return null;
  }

  return (
    <div style={{ marginTop: "16px", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "12px", background: "#f9fafb", color: "black" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: "14px" }}>
        Service History Timeline{selectedVehicleName ? ` - ${selectedVehicleName}` : ""}
      </h3>
      {historyLoading && <p style={{ margin: 0 }}>Loading service history...</p>}
      {historyError && <p style={{ margin: 0, color: "red" }}>{historyError}</p>}
      {!historyLoading && !historyError && historyRecords.length === 0 && (
        <p style={{ margin: 0 }}>No previous service records found.</p>
      )}
      {!historyLoading && !historyError && historyRecords.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {historyRecords.map((record) => (
            <div key={record.id} style={{ borderTop: "1px solid #e5e7eb", paddingTop: "8px" }}>
              <div style={{ fontWeight: 600 }}>{record.serviceDate || "-"}</div>
              <div style={{ fontSize: "13px", color: "#4b5563" }}>
                <div>Type: {record.serviceType || "-"}</div>
                <div>Odometer: {record.odometerReading != null ? record.odometerReading : "-"}</div>
                <div>Service Center: {record.serviceCenter || "-"}</div>
                <div>Mechanic: {record.mechanicName || "-"}</div>
                <div>Cost: {record.cost != null ? record.cost : "-"}</div>
                <div>Notes: {record.notes || "-"}</div>
                <div>Next Service Date: {record.nextServiceDate || "-"}</div>
                <div>Next Service KM: {record.nextServiceKm != null ? record.nextServiceKm : "-"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
