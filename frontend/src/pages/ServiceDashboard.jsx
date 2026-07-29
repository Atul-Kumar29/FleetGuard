import { useEffect, useState } from "react";
import { getServiceQueue, postCompleteService } from "../services/api";

export default function ServiceDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("due_date");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [form, setForm] = useState({
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
                      <button
                        onClick={() => {
                          setModalError("");
                          setForm({ ...form, vehicleId: vehicle.id });
                          setModalOpen(true);
                        }}
                        style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #2563eb", background: "white", color: "#2563eb", cursor: "pointer" }}
                      >
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
      {modalOpen && (
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
            <h2 style={{ marginTop: 0 }}>Complete Service</h2>
            {modalError && <p style={{ color: "red" }}>{modalError}</p>}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setModalError("");

                // simple validation
                if (!form.vehicleId || !form.serviceTypeId || !form.serviceDate || form.odometerReading === "") {
                  setModalError("Please fill required fields.");
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

                  setModalOpen(false);
                  setForm({
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
                  loadData();
                } catch (err) {
                  setModalError(err.message || "Failed to complete service.");
                }
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label>Service Type (required)</label>
                <select value={form.serviceTypeId} onChange={(e) => setForm({ ...form, serviceTypeId: e.target.value })}>
                  <option value="">Select type</option>
                  <option value="37434345-ba1d-4a96-822c-7ac4fad87a0f">Oil Change</option>
                  <option value="dae5298a-e7fb-4f3f-b6b4-7df5e9322acc">Brake Service</option>
                  <option value="a5b9ca3a-930a-4dc9-b87d-7db3bb7572cd">Engine Service</option>
                  <option value="0048519c-378e-4f44-998e-cad820616ad0">Tyre Rotation</option>
                  <option value="6eac9e63-bd76-4e01-b3b5-afb602959e29">General Service</option>
                </select>

                <label>Service Date (required)</label>
                <input type="date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} />

                <label>Odometer Reading (required)</label>
                <input type="number" value={form.odometerReading} onChange={(e) => setForm({ ...form, odometerReading: e.target.value })} />

                <label>Service Center</label>
                <input type="text" value={form.serviceCenter} onChange={(e) => setForm({ ...form, serviceCenter: e.target.value })} />

                <label>Mechanic Name</label>
                <input type="text" value={form.mechanicName} onChange={(e) => setForm({ ...form, mechanicName: e.target.value })} />

                <label>Cost</label>
                <input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />

                <label>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

                <label>Next Service Date</label>
                <input type="date" value={form.nextServiceDate} onChange={(e) => setForm({ ...form, nextServiceDate: e.target.value })} />

                <label>Next Service KM</label>
                <input type="number" value={form.nextServiceKm} onChange={(e) => setForm({ ...form, nextServiceKm: e.target.value })} />

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "6px 10px" }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: "6px 10px", background: "#2563eb", color: "white", border: "none" }}>
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
