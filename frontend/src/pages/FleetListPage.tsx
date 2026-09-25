import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  getFleetList,
  getDrivers,
  unassignDriver,
} from '../services/api';
import AssignDriverDrawer from '../components/common/AssignDriverDrawer';
import { User } from 'lucide-react';

interface Driver {
  id?: string | number;
  full_name?: string;
  name?: string;
  email?: string;
  vehicle_id?: string | number;
  assigned_vehicle_id?: string | number;
  current_vehicle_id?: string | number;
  assignment?: {
    vehicle_id?: string | number;
  };
  vehicle?: {
    id?: string | number;
  };
}

interface AssignedDriver {
  driver_id?: string | number;
  driver_name?: string;
  driver_email?: string;
  full_name?: string;
  email?: string;
  name?: string;
}

interface Vehicle {
  id: string | number;
  license_plate: string;
  make: string;
  model: string;
  vin: string;
  type: string;
  status: string;
  compliance_status: string;
  current_mileage: number;
  assigned_driver?: AssignedDriver | null;
  driver?: AssignedDriver | null;
}

interface FleetFilters {
  type: string;
  status: string;
  search: string;
}

interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

interface FleetResponse {
  vehicles?: Vehicle[];
  pagination?: Pagination;
}

interface DriversResponse {
  drivers?: Driver[];
}

interface FleetListPageProps {
  onSelectVehicle: (vehicleId: string | number) => void;
}

function getStatusClasses(status: string): string {
  switch (status) {
    case 'ACTIVE':
    case 'VALID':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';

    case 'WARNING':
      return 'bg-amber-100 text-amber-800 border border-amber-200';

    case 'EXPIRED':
    case 'IN_MAINTENANCE':
    case 'DECOMMISSIONED':
      return 'bg-red-100 text-red-800 border border-red-200';

    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}

export default function FleetListPage({
  onSelectVehicle,
}: FleetListPageProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string>('');

  const [filters, setFilters] = useState<FleetFilters>({
    type: '',
    status: '',
    search: '',
  });

  const [pagination, setPagination] = useState<Pagination>({
    limit: 50,
    offset: 0,
    total: 0,
  });

  const [isDrawerOpen, setIsDrawerOpen] =
    useState<boolean>(false);

  const [targetVehicleForAssignment, setTargetVehicleForAssignment] =
    useState<Vehicle | null>(null);

  const loadFleet = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const [fleetRes, driversRes] = await Promise.all([
        getFleetList(filters) as Promise<FleetResponse>,

        getDrivers()
          .catch(() => ({ drivers: [] })) as Promise<DriversResponse>,
      ]);

      const rawVehicles = fleetRes.vehicles || [];
      const driverList = driversRes.drivers || [];

      // Map drivers by vehicle_id to enrich any unlinked vehicle records
      const driverByVehicleId: Record<
        string,
        Driver
      > = {};

      driverList.forEach((driver) => {
        const vehicleId =
          driver.vehicle_id ||
          driver.assigned_vehicle_id ||
          driver.current_vehicle_id ||
          driver.assignment?.vehicle_id ||
          driver.vehicle?.id;

        if (vehicleId !== undefined && vehicleId !== null) {
          driverByVehicleId[String(vehicleId)] = driver;
        }
      });

      const enriched: Vehicle[] = rawVehicles.map((vehicle) => {
        let assignedDriver =
          vehicle.assigned_driver || vehicle.driver;

        if (
          !assignedDriver &&
          driverByVehicleId[String(vehicle.id)]
        ) {
          const driver =
            driverByVehicleId[String(vehicle.id)];

          assignedDriver = {
            driver_id: driver.id,
            driver_name:
              driver.full_name ||
              driver.name ||
              driver.email,
            driver_email: driver.email,
          };
        }

        return {
          ...vehicle,
          assigned_driver: assignedDriver,
        };
      });

      setVehicles(enriched);

      setPagination(
        fleetRes.pagination || {
          limit: 50,
          offset: 0,
          total: 0,
        }
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load fleet list.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFleet();
  }, [filters]);

  const handleFilterChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ): void => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleOpenAssignDrawer = (
    vehicle: Vehicle | null = null
  ): void => {
    setTargetVehicleForAssignment(vehicle);
    setIsDrawerOpen(true);
  };

  const handleUnassign = async (
    vehicleId: string | number
  ): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      await unassignDriver(vehicleId);
      await loadFleet();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to unassign driver.'
      );

      setLoading(false);
    }
  };

  const inputClass =
    'px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all';

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
            FleetGuard
          </p>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fleet Management
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            View and manage your registered vehicles
          </p>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
          onClick={() => handleOpenAssignDrawer(null)}
        >
          + Assign Driver
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-5 shadow-sm">
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) =>
            event.preventDefault()
          }
          className="flex flex-wrap gap-3"
        >
          <input
            type="text"
            name="search"
            placeholder="Search by VIN, plate, make, or model..."
            value={filters.search}
            onChange={handleFilterChange}
            className={`${inputClass} flex-1 min-w-52`}
          />

          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className={`${inputClass} min-w-40`}
          >
            <option value="">All Vehicle Types</option>
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="TRAILER">Trailer</option>
            <option value="CAR">Car</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className={`${inputClass} min-w-40`}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_MAINTENANCE">
              In Maintenance
            </option>
            <option value="DECOMMISSIONED">
              Decommissioned
            </option>
          </select>
        </form>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 border-l-4 border-l-red-500 text-red-800 text-sm font-medium rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
          Loading fleet...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
          No vehicles found. Register a new vehicle to get
          started.
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    {[
                      'License Plate',
                      'Make / Model',
                      'VIN',
                      'Type',
                      'Status',
                      'Compliance',
                      'Assigned Driver',
                      'Mileage',
                      'Actions',
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-extrabold text-slate-700 uppercase tracking-wide"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold text-blue-700">
                        {vehicle.license_plate}
                      </td>

                      <td className="px-4 py-3.5 text-slate-900">
                        {vehicle.make} {vehicle.model}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-slate-600">
                        {vehicle.vin}
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        {vehicle.type}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusClasses(
                            vehicle.status
                          )}`}
                        >
                          {vehicle.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase ${getStatusClasses(
                            vehicle.compliance_status
                          )}`}
                        >
                          {vehicle.compliance_status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {vehicle.assigned_driver ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <User size={11} />

                            {vehicle.assigned_driver
                              .driver_name ||
                              vehicle.assigned_driver
                                .full_name ||
                              vehicle.assigned_driver.email ||
                              vehicle.assigned_driver.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        {vehicle.current_mileage.toLocaleString()}{' '}
                        km
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              onSelectVehicle(vehicle.id)
                            }
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-colors"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              handleOpenAssignDrawer(vehicle)
                            }
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-md border border-slate-200 transition-colors"
                          >
                            Assign
                          </button>

                          {vehicle.assigned_driver && (
                            <button
                              onClick={() =>
                                void handleUnassign(
                                  vehicle.id
                                )
                              }
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-md border border-red-200 transition-colors"
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
          </div>

          <p className="text-center text-xs text-slate-500 mt-3">
            Showing {pagination.offset + 1}–
            {Math.min(
              pagination.offset + pagination.limit,
              pagination.total
            )}{' '}
            of {pagination.total} vehicles
          </p>
        </>
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