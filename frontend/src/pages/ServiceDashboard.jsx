import { useEffect, useState } from "react";
import { getServiceQueue } from "../services/api";

export default function ServiceDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("due_date");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getServiceQueue(search, status, sort);
      setVehicles(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load service queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "20px" }}>Service Center Work Queue</h1>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "18px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          style={{ padding: "8px", minWidth: "180px", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="all">All</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Due">Due</option>
          <option value="Overdue">Overdue</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="due_date">Due Date</option>
          <option value="mileage">Mileage</option>
        </select>

        <button
          onClick={loadData}
          style={{ padding: "8px 14px", borderRadius: "6px", background: "#2563eb", color: "white", border: "none", cursor: "pointer" }}
        >
          Refresh
        </button>
      </div>

      {loading && <p>Loading service queue...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
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
                      <button style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #2563eb", background: "white", color: "#2563eb", cursor: "pointer" }}>
                        Complete Service
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
