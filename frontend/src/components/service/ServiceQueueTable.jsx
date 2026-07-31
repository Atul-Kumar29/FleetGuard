export default function ServiceQueueTable({
  vehicles,
  onLoadHistory,
  onCompleteService,
  onAddHistoricalRecord,
}) {
  return (
    <div style={{ overflowX: "auto", color: "black" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px", textAlign: "left" }}>License Plate</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Vehicle</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Mileage</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Last Service</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Next Service</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Risk</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Status</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: "10px", textAlign: "left" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ padding: "14px", textAlign: "center" }}>
                No service jobs found.
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{vehicle.licensePlate}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{vehicle.vehicle}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{vehicle.currentMileage} km</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{vehicle.lastServiceDate || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{vehicle.nextServiceDate || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{vehicle.maintenanceRisk}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{vehicle.status}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => onLoadHistory(vehicle.id, vehicle.vehicle)}
                      style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #2563eb", background: "white", color: "#2563eb", cursor: "pointer" }}
                    >
                      Get History
                    </button>
                    <button
                      onClick={() => onCompleteService(vehicle.id)}
                      style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #2563eb", background: "white", color: "#2563eb", cursor: "pointer" }}
                    >
                      Complete Service
                    </button>
                    <button
                      onClick={() => onAddHistoricalRecord(vehicle.id)}
                      style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #2563eb", background: "white", color: "#2563eb", cursor: "pointer" }}
                    >
                      Add Historical Record
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
