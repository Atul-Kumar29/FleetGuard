import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getDriverVehicle,
  getDrivers,
  getFleetList,
  updateVehicleMileage,
} from '../services/api';

import RoadLegalStatusShield from '../components/common/RoadLegalStatusShield';
import PreTripChecklistForm from '../components/common/PreTripChecklistForm';
import AssignDriverDrawer from '../components/common/AssignDriverDrawer';

import {
  RotateCw,
  User,
  Car,
  Plus,
  Edit3,
} from 'lucide-react';

interface User {
  id: string;
  role: string;
  full_name?: string;
  email?: string;
}

interface Driver {
  id: string;
  full_name?: string;
  email?: string;
}

interface Vehicle {
  id: string;
  license_plate?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  current_mileage?: number;
}

interface Assignment {
  status?: string;
}

interface ComplianceItem {
  [key: string]: unknown;
}

interface VehicleData {
  vehicle?: Vehicle | null;
  assignment?: Assignment | null;
  is_compliant?: boolean;
  compliance_items?: ComplianceItem[];
  no_assignment?: boolean;
}

interface DriversResponse {
  drivers?: Driver[];
}

interface FleetResponse {
  vehicles?: Vehicle[];
}

interface MileageResponse {
  vehicle: Vehicle;
}

interface ApiError {
  message?: string;
  status?: number;
  data?: {
    error?: string;
  };
}

export default function DriverDashboard() {
  const { user } = useAuth() as {
    user: User | null;
  };

  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    user?.role === 'DRIVER' ? user.id : ''
  );

  const [vehicleData, setVehicleData] =
    useState<VehicleData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const [driversLoading, setDriversLoading] =
    useState<boolean>(false);

  const [error, setError] = useState<string>('');

  const [isDrawerOpen, setIsDrawerOpen] =
    useState<boolean>(false);

  const [fleetVehicles, setFleetVehicles] =
    useState<Vehicle[]>([]);

  const [mileageInput, setMileageInput] =
    useState<string>('');

  const [mileageUpdating, setMileageUpdating] =
    useState<boolean>(false);

  const [mileageMessage, setMileageMessage] =
    useState<string>('');

  const isManager = ['FLEET_MANAGER', 'ADMIN'].includes(
    user?.role || ''
  );

  // Fetch available drivers list
  useEffect(() => {
    async function loadDrivers(): Promise<void> {
      try {
        setDriversLoading(true);

        const res =
          (await getDrivers()) as DriversResponse;

        const driverList = res.drivers || [];

        setDrivers(driverList);

        // For manager/admin, default to first driver
        if (isManager && driverList.length > 0) {
          setSelectedDriverId(
            (prev) => prev || driverList[0].id
          );
        }
      } catch (err: unknown) {
        console.error('Failed to load drivers:', err);
      } finally {
        setDriversLoading(false);
      }
    }

    loadDrivers();
  }, [user?.role, isManager]);

  // Load fleet list for assignment drawer
  useEffect(() => {
    if (isManager) {
      getFleetList({ limit: 100 })
        .then((res) => {
          const response = res as FleetResponse;
          setFleetVehicles(response.vehicles || []);
        })
        .catch(() => {});
    }
  }, [isManager]);

  const fetchAssignmentData = async (
    targetId?: string
  ): Promise<void> => {
    const idToFetch =
      targetId !== undefined
        ? targetId
        : selectedDriverId;

    if (!idToFetch && !isManager) return;

    try {
      setLoading(true);
      setError('');

      const data =
        (await getDriverVehicle(idToFetch)) as VehicleData;

      setVehicleData(data);
    } catch (err: unknown) {
      const apiError = err as ApiError;

      if (
        apiError.data?.error ===
          'No active assignment found' ||
        apiError.status === 404
      ) {
        setVehicleData({
          no_assignment: true,
        });
      } else {
        setError(
          apiError.message ||
            'Unable to load assigned vehicle status.'
        );

        setVehicleData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDriverId || !isManager) {
      fetchAssignmentData(selectedDriverId);
    }
  }, [selectedDriverId]);

  useEffect(() => {
    const mileage =
      vehicleData?.vehicle?.current_mileage;

    if (mileage !== undefined && mileage !== null) {
      setMileageInput(String(mileage));
      setMileageMessage('');
    }
  }, [vehicleData?.vehicle?.current_mileage]);

  const handleDriverChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newId = e.target.value;
    setSelectedDriverId(newId);
  };

  const selectedDriver =
    drivers.find(
      (d) => d.id === selectedDriverId
    ) ||
    (user?.role === 'DRIVER' ? user : null);

  const inputClass =
    'px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
            {isManager
              ? 'Fleet Management'
              : 'Driver Console'}
          </p>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isManager
              ? 'Driver Assignments'
              : 'Driver Duty Dashboard'}
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            {isManager
              ? 'View assigned vehicles, road-legal clearance, and compliance for drivers'
              : 'Real-time vehicle assignment compliance & road-legal clearance'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isManager && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="driver-filter-select"
                className="text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap"
              >
                Select Driver:
              </label>

              {driversLoading ? (
                <span className="text-xs text-slate-400 font-semibold">
                  Loading drivers...
                </span>
              ) : (
                <select
                  id="driver-filter-select"
                  value={selectedDriverId}
                  onChange={handleDriverChange}
                  className={inputClass}
                >
                  {drivers.map((d) => (
                    <option
                      key={d.id}
                      value={d.id}
                    >
                      {d.full_name || d.email} ({d.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <button
            onClick={() =>
              fetchAssignmentData(selectedDriverId)
            }
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <RotateCw
              size={14}
              className={
                loading ? 'animate-spin' : ''
              }
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 border-l-4 border-l-red-500 text-red-800 text-sm font-medium rounded-lg">
          {error}
        </div>
      )}

      {/* Selected Driver Banner */}
      {isManager && selectedDriver && (
        <div className="flex items-center justify-between px-5 py-3.5 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <User size={18} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Currently Inspecting Driver
              </p>

              <h2 className="text-base font-extrabold text-slate-900">
                {selectedDriver.full_name ||
                  selectedDriver.email}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
          >
            <Plus size={14} />
            Assign Vehicle
          </button>
        </div>
      )}

      {/* No Assignment */}
      {!loading && vehicleData?.no_assignment && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center gap-3 shadow-sm">
          <div className="p-3 bg-slate-100 rounded-full text-slate-400">
            <Car size={32} />
          </div>

          <h3 className="text-base font-extrabold text-slate-900">
            No Active Vehicle Assignment
          </h3>

          <p className="text-sm text-slate-500 max-w-md">
            {isManager
              ? `No vehicle is currently assigned to ${
                  selectedDriver?.full_name ||
                  selectedDriver?.email ||
                  'this driver'
                }. You can assign a vehicle using the button below.`
              : 'You currently do not have a vehicle assigned for active duty.'}
          </p>

          {isManager && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
            >
              <Plus size={16} />
              Assign Vehicle to Driver
            </button>
          )}
        </div>
      )}

      {/* Road-Legal Status */}
      {(!vehicleData?.no_assignment || loading) && (
        <RoadLegalStatusShield
          isCompliant={
            vehicleData
              ? vehicleData.is_compliant ?? true
              : true
          }
          vehicle={
            vehicleData
              ? vehicleData.vehicle
              : null
          }
          complianceItems={
            vehicleData
              ? vehicleData.compliance_items || []
              : []
          }
          loading={loading}
        />
      )}

      {/* Assigned Vehicle Details */}
      {!loading && vehicleData?.vehicle && (
        <>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-4">
              Assigned Duty Details
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  License Plate
                </p>

                <strong className="text-base font-extrabold text-blue-700">
                  {vehicleData.vehicle.license_plate}
                </strong>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Make &amp; Model
                </p>

                <span className="text-sm font-bold text-slate-900">
                  {vehicleData.vehicle.make}{' '}
                  {vehicleData.vehicle.model}{' '}
                  ({vehicleData.vehicle.year})
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  VIN
                </p>

                <span className="text-xs font-mono font-semibold text-slate-700">
                  {vehicleData.vehicle.vin}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Assignment
                </p>

                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
                  {vehicleData.assignment?.status ||
                    'ACTIVE'}
                </span>
              </div>
            </div>

            {/* Mileage */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Current Mileage
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    value={mileageInput}
                    onChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) =>
                      setMileageInput(e.target.value)
                    }
                    className={`w-full ${inputClass}`}
                  />

                  <button
                    onClick={async () => {
                      if (!vehicleData?.vehicle?.id) return;

                      const mileageValue =
                        Number(mileageInput);

                      if (
                        !Number.isInteger(mileageValue) ||
                        mileageValue < 0
                      ) {
                        setMileageMessage(
                          'Enter a valid non-negative mileage.'
                        );
                        return;
                      }

                      setMileageUpdating(true);
                      setMileageMessage('');

                      try {
                        const result =
                          (await updateVehicleMileage(
                            vehicleData.vehicle.id,
                            mileageValue
                          )) as MileageResponse;

                        setMileageInput(
                          String(
                            result.vehicle.current_mileage
                          )
                        );

                        setMileageMessage(
                          'Mileage updated successfully.'
                        );

                        setVehicleData((prev) => {
                          if (!prev || !prev.vehicle) {
                            return prev;
                          }

                          return {
                            ...prev,
                            vehicle: {
                              ...prev.vehicle,
                              current_mileage:
                                result.vehicle
                                  .current_mileage,
                            },
                          };
                        });
                      } catch (err: unknown) {
                        const apiError =
                          err as ApiError;

                        setMileageMessage(
                          apiError.message ||
                            'Failed to update mileage.'
                        );
                      } finally {
                        setMileageUpdating(false);
                      }
                    }}
                    disabled={mileageUpdating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Edit3 className="h-4 w-4" />

                    {mileageUpdating
                      ? 'Saving…'
                      : 'Update'}
                  </button>
                </div>

                {mileageMessage && (
                  <p className="mt-2 text-sm text-slate-600">
                    {mileageMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          <PreTripChecklistForm
            driverId={
              selectedDriverId || user?.id || ''
            }
            vehicleId={vehicleData.vehicle.id}
            onSubmitted={() => setError('')}
          />
        </>
      )}

      {/* Assignment Drawer */}
      {isManager && (
        <AssignDriverDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          vehicles={fleetVehicles}
          onSuccess={() =>
            fetchAssignmentData(selectedDriverId)
          }
        />
      )}
    </div>
  );
}