import { useState, useEffect } from 'react';
import { getFleetList, unassignDriver } from '../services/api';
import AssignDriverDrawer from '../components/common/AssignDriverDrawer';

function getStatusColor(status) {
  switch (status) {
    case 'ACTIVE':
    case 'VALID':
      return '#10b981';
    case 'WARNING':
      return '#f59e0b';
    case 'EXPIRED':
    case 'IN_MAINTENANCE':
    case 'DECOMMISSIONED':
      return '#ef4444';
    case 'NO_RECORDS':
      return '#6b7280';
    default:
      return '#6b7280';
  }
}

export default function FleetListPage({ onSelectVehicle }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
  });
  const [pagination, setPagination] = useState({ limit: 50, offset: 0, total: 0 });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [targetVehicleForAssignment, setTargetVehicleForAssignment] = useState(null);

  const loadFleet = async () => {
    try {
      setLoading(true);
      const result = await getFleetList(filters);
      setVehicles(result.vehicles || []);
      setPagination(result.pagination || { limit: 50, offset: 0, total: 0 });
    } catch (err) {
      setError(err.message || 'Unable to load fleet list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
  };

  const handleOpenAssignDrawer = (vehicle = null) => {
    setTargetVehicleForAssignment(vehicle);
    setIsDrawerOpen(true);
  };

  const handleUnassign = async (vehicleId) => {
    try {
      setLoading(true);
      await unassignDriver(vehicleId);
      await loadFleet();
    } catch (err) {
      setError(err.message || 'Failed to unassign driver.');
      setLoading(false);
    }
  };

  return (
    <div className="fleet-page">
      <div className="fleet-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="eyebrow">FleetGuard</p>
          <h1>Fleet Management</h1>
          <p className="subtitle">View and manage your registered vehicles</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => handleOpenAssignDrawer(null)}
          style={{ height: 'fit-content' }}
        >
          + Assign Driver
        </button>
      </div>

      <div className="fleet-filters">
        <form onSubmit={handleSearchSubmit} className="filter-form">
          <input
            type="text"
            name="search"
            placeholder="Search by VIN, plate, make, or model..."
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />

          <select name="type" value={filters.type} onChange={handleFilterChange} className="filter-select">
            <option value="">All Vehicle Types</option>
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="TRAILER">Trailer</option>
            <option value="CAR">Car</option>
          </select>

          <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_MAINTENANCE">In Maintenance</option>
            <option value="DECOMMISSIONED">Decommissioned</option>
          </select>
        </form>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="fleet-content">
          <p>Loading fleet...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="fleet-content">
          <p>No vehicles found. Register a new vehicle to get started.</p>
        </div>
      ) : (
        <div className="fleet-content">
          <div className="fleet-table-container">
            <table className="fleet-table">
              <thead>
                <tr>
                  <th>License Plate</th>
                  <th>Make / Model</th>
                  <th>VIN</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Compliance</th>
                  <th>Assigned Driver</th>
                  <th>Mileage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="plate">{vehicle.license_plate}</td>
                    <td>{vehicle.make} {vehicle.model}</td>
                    <td className="vin">{vehicle.vin}</td>
                    <td>{vehicle.type}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: getStatusColor(vehicle.status) }}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className="compliance-badge"
                        style={{ backgroundColor: getStatusColor(vehicle.compliance_status) }}
                      >
                        {vehicle.compliance_status}
                      </span>
                    </td>
                    <td>
                      {vehicle.assigned_driver ? (
                        <span className="badge" style={{ backgroundColor: '#2563eb', color: '#fff', fontSize: '0.8rem', padding: '4px 8px' }}>
                          👤 {vehicle.assigned_driver.driver_name}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td>{vehicle.current_mileage.toLocaleString()} km</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => onSelectVehicle(vehicle.id)}
                          className="view-btn"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenAssignDrawer(vehicle)}
                          className="view-btn"
                          style={{ backgroundColor: '#2563eb', color: '#fff' }}
                        >
                          Assign
                        </button>
                        {vehicle.assigned_driver && (
                          <button
                            onClick={() => handleUnassign(vehicle.id)}
                            className="view-btn"
                            style={{ backgroundColor: '#ef4444', color: '#fff' }}
                          >
                            Unassign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-info">
            Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} vehicles
          </div>
        </div>
      )}

      <AssignDriverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        vehicle={targetVehicleForAssignment}
        vehicles={vehicles}
        onSuccess={loadFleet}
      />
    </div>
  );
}
