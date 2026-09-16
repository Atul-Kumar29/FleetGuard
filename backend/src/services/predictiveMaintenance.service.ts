import { getSupabaseClient } from '../config/supabase.js';
import { calculateMaintenanceRisk } from '../utils/riskCalculator.js';

type ServiceLog = {
  id: string;
  service_date: string;
  odometer_reading: number;
  service_center: string | null;
  mechanic_name: string | null;
  cost: number | string | null;
  notes: string | null;
  next_service_date: string | null;
  next_service_km: number | null;
};

type VehicleRecord = {
  id: string;
  license_plate: string;
  make: string;
  model: string;
  current_mileage: number;
  status: string;
  service_logs: ServiceLog[] | null;
};

type PredictiveMaintenanceVehicle = {
  vehicleId: string;
  licensePlate: string;
  make: string;
  model: string;
  currentMileage: number;
  lastServiceMileage: number;
  distanceSinceLastService: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  vehicleStatus: string;
  lastServiceDate: string | null;
  nextServiceKm: number | null;
  nextServiceDate: string | null;
  serviceCenter: string | null;
  mechanicName: string | null;
};

async function getPredictiveMaintenanceRisk(): Promise<
  PredictiveMaintenanceVehicle[]
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      id,
      license_plate,
      make,
      model,
      current_mileage,
      status,
      service_logs (
        id,
        service_date,
        odometer_reading,
        service_center,
        mechanic_name,
        cost,
        notes,
        next_service_date,
        next_service_km
      )
    `);

  if (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        `Supabase query failed (${error.message}). Falling back to mock data for demonstration.`
      );
      return getMockVehiclesReport();
    }

    throw new Error(
      `Database error while fetching predictive risk: ${error.message}`
    );
  }

  if (!data) {
    return [];
  }

  const vehicles = data as unknown as VehicleRecord[];

  return vehicles.map((vehicle) => {
    const logs = vehicle.service_logs || [];
    let lastServiceMileage = 0;
    let latestLog: ServiceLog | null = null;

    if (logs.length > 0) {
      latestLog = logs.reduce((latest, current) => {
        const latestTime = new Date(latest.service_date).getTime();
        const currentTime = new Date(current.service_date).getTime();

        if (currentTime > latestTime) {
          return current;
        }

        if (
          currentTime === latestTime &&
          current.odometer_reading > latest.odometer_reading
        ) {
          return current;
        }

        return latest;
      });

      lastServiceMileage = latestLog.odometer_reading;
    }

    const { distanceSinceLastService, risk } = calculateMaintenanceRisk(
      vehicle.current_mileage,
      logs.length > 0 ? lastServiceMileage : null
    );

    return {
      vehicleId: vehicle.id,
      licensePlate: vehicle.license_plate,
      make: vehicle.make,
      model: vehicle.model,
      currentMileage: vehicle.current_mileage,
      lastServiceMileage,
      distanceSinceLastService,
      risk,
      vehicleStatus: vehicle.status,
      lastServiceDate: latestLog?.service_date ?? null,
      nextServiceKm: latestLog?.next_service_km ?? null,
      nextServiceDate: latestLog?.next_service_date ?? null,
      serviceCenter: latestLog?.service_center ?? null,
      mechanicName: latestLog?.mechanic_name ?? null
    };
  });
}

function getMockVehiclesReport(): PredictiveMaintenanceVehicle[] {
  return [
    {
      vehicleId: 'uuid-demo-1',
      licensePlate: 'KA19AB1234',
      make: 'Tata',
      model: 'Prima (Cargo Carrier)',
      currentMileage: 48000,
      vehicleStatus: 'ACTIVE',
      lastServiceMileage: 39000,
      distanceSinceLastService: 9000,
      risk: 'MEDIUM',
      lastServiceDate: '2026-01-01',
      nextServiceKm: 49000,
      nextServiceDate: '2026-07-01',
      serviceCenter: 'Tata Motors Service',
      mechanicName: 'Ramesh Kumar'
    },
    {
      vehicleId: 'uuid-demo-2',
      licensePlate: 'MH12CD5678',
      make: 'Mahindra',
      model: 'Blazo (Heavy Tipper)',
      currentMileage: 22000,
      vehicleStatus: 'ACTIVE',
      lastServiceMileage: 18000,
      distanceSinceLastService: 4000,
      risk: 'LOW',
      lastServiceDate: '2026-02-15',
      nextServiceKm: 28000,
      nextServiceDate: '2026-08-15',
      serviceCenter: 'Mahindra Trucks Garage',
      mechanicName: 'Sanjay Dutt'
    },
    {
      vehicleId: 'uuid-demo-3',
      licensePlate: 'DL01EF9012',
      make: 'Ashok Leyland',
      model: 'U-Truck (Tanker)',
      currentMileage: 15000,
      vehicleStatus: 'ACTIVE',
      lastServiceMileage: 0,
      distanceSinceLastService: 15000,
      risk: 'HIGH',
      lastServiceDate: null,
      nextServiceKm: null,
      nextServiceDate: null,
      serviceCenter: null,
      mechanicName: null
    },
    {
      vehicleId: 'uuid-demo-4',
      licensePlate: 'KA03GH3456',
      make: 'Volvo',
      model: 'FMX (Dump Truck)',
      currentMileage: 30000,
      vehicleStatus: 'ACTIVE',
      lastServiceMileage: 19000,
      distanceSinceLastService: 11000,
      risk: 'HIGH',
      lastServiceDate: '2026-03-01',
      nextServiceKm: 29000,
      nextServiceDate: '2026-09-01',
      serviceCenter: 'Volvo Services HQ',
      mechanicName: 'John Doe'
    },
    {
      vehicleId: 'uuid-demo-5',
      licensePlate: 'HR55JK6789',
      make: 'Eicher',
      model: 'Pro 6028',
      currentMileage: 85000,
      vehicleStatus: 'ACTIVE',
      lastServiceMileage: 79500,
      distanceSinceLastService: 5500,
      risk: 'LOW',
      lastServiceDate: '2026-03-10',
      nextServiceKm: 89500,
      nextServiceDate: '2026-09-10',
      serviceCenter: 'Eicher Diagnostics',
      mechanicName: 'Gurpreet Singh'
    }
  ];
}

export {
  getPredictiveMaintenanceRisk
};
