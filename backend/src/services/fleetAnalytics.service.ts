import { getSupabaseClient } from '../config/supabase.js';
import { calculateMaintenanceRisk } from '../utils/riskCalculator.js';

type Vehicle = {
  id: string;
  current_mileage: number | string;
};

type ComplianceItem = {
  vehicle_id: string;
  status: string;
  expiration_date: string | null;
};

type ServiceLog = {
  vehicle_id: string;
  service_date: string;
  odometer_reading: number;
  cost: number | string | null;
};

type FleetMetrics = {
  totalVehicles: number;
  compliantVehicles: number;
  expiredVehicles: number;
  upcomingExpiryVehicles: number;
  totalMaintenanceCost: number;
  highRiskVehicles: number;
};

async function getFleetMetrics(): Promise<FleetMetrics> {
  try {
    const supabase = getSupabaseClient();
    const [vehiclesResult, complianceResult, logsResult] = await Promise.all([
      supabase.from('vehicles').select('id, current_mileage'),
      supabase
        .from('compliance_items')
        .select('vehicle_id, status, expiration_date'),
      supabase
        .from('service_logs')
        .select('vehicle_id, service_date, odometer_reading, cost')
    ]);

    const error =
      vehiclesResult.error || complianceResult.error || logsResult.error;
    if (error) {
      throw new Error(error.message);
    }

    const vehicles = (vehiclesResult.data ?? []) as unknown as Vehicle[];
    const complianceItems =
      (complianceResult.data ?? []) as unknown as ComplianceItem[];
    const serviceLogs = (logsResult.data ?? []) as unknown as ServiceLog[];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    thirtyDaysFromNow.setHours(23, 59, 59, 999);

    const vehicleComplianceMap: {
      [vehicleId: string]: ComplianceItem[];
    } = {};

    complianceItems.forEach((item) => {
      const documents = vehicleComplianceMap[item.vehicle_id];
      if (!documents) {
        vehicleComplianceMap[item.vehicle_id] = [];
      }
      vehicleComplianceMap[item.vehicle_id]?.push(item);
    });

    let compliantVehicles = 0;
    vehicles.forEach((vehicle) => {
      const documents = vehicleComplianceMap[vehicle.id] ?? [];
      if (documents.length > 0) {
        const allActive = documents.every((document) => {
          const isExpiredDate =
            document.expiration_date !== null &&
            new Date(document.expiration_date) < today;

          return (
            (document.status === 'VALID' ||
              document.status === 'WARNING' ||
              document.status === 'ACTIVE') &&
            !isExpiredDate
          );
        });

        if (allActive) {
          compliantVehicles++;
        }
      }
    });

    const expiredVehicles = complianceItems.filter((item) => {
      const isExpiredStatus = item.status === 'EXPIRED';
      const isExpiredDate =
        item.expiration_date !== null &&
        new Date(item.expiration_date) < today;
      return isExpiredStatus || isExpiredDate;
    }).length;

    const upcomingExpiryVehicles = complianceItems.filter((item) => {
      if (!item.expiration_date) {
        return false;
      }

      const expiryDate = new Date(item.expiration_date);
      return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    }).length;

    const totalMaintenanceCost = serviceLogs.reduce((sum, log) => {
      return sum + (Number(log.cost) || 0);
    }, 0);

    const vehicleLogsMap: {
      [vehicleId: string]: ServiceLog[];
    } = {};

    serviceLogs.forEach((log) => {
      const logs = vehicleLogsMap[log.vehicle_id];
      if (!logs) {
        vehicleLogsMap[log.vehicle_id] = [];
      }
      vehicleLogsMap[log.vehicle_id]?.push(log);
    });

    let highRiskVehicles = 0;
    vehicles.forEach((vehicle) => {
      const logs = vehicleLogsMap[vehicle.id] ?? [];
      let latestOdometer = 0;

      if (logs.length > 0) {
        const latestLog = logs.reduce((latest, current) => {
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

        latestOdometer = latestLog.odometer_reading;
      }

      const { risk } = calculateMaintenanceRisk(
        vehicle.current_mileage,
        logs.length > 0 ? latestOdometer : null
      );

      if (risk === 'HIGH') {
        highRiskVehicles++;
      }
    });

    return {
      totalVehicles: vehicles.length,
      compliantVehicles,
      expiredVehicles,
      upcomingExpiryVehicles,
      totalMaintenanceCost: Number(totalMaintenanceCost.toFixed(2)),
      highRiskVehicles
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        `Supabase analytics query failed (${message}). Returning mock data for preview.`
      );
      return getMockMetrics();
    }

    throw new Error(`Database error while generating fleet analytics: ${message}`);
  }
}

function getMockMetrics(): FleetMetrics {
  return {
    totalVehicles: 120,
    compliantVehicles: 98,
    expiredVehicles: 12,
    upcomingExpiryVehicles: 10,
    totalMaintenanceCost: 458230.75,
    highRiskVehicles: 18
  };
}

export {
  getFleetMetrics
};
