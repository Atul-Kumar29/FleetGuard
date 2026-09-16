import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../config/supabase.js';

type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

type VehicleDetails = {
  licensePlate: string;
  make: string;
  model: string;
};

type Notification = {
  id: string;
  vehicleId: string;
  licensePlate: string;
  type: 'EXPIRY' | 'SERVICE' | 'OVERRIDE';
  title: string;
  message: string;
  severity: Severity;
  createdAt: string;
};

type ComplianceItem = {
  id: string;
  vehicle_id: string;
  document_type: string;
  expiration_date: string;
};

type Vehicle = {
  id: string;
  current_mileage: number | string | null;
  next_service_due_date: string | null;
  next_service_due_mileage: number | string | null;
  license_plate: string | null;
};

type AssignmentOverride = {
  id: string;
  vehicle_id: string;
  driver_id: string;
  approved_by: string;
  justification: string | null;
  created_at: string;
};

const SEVERITY_WEIGHTS = {
  CRITICAL: 3,
  WARNING: 2,
  INFO: 1
};

const DOCUMENT_TYPE_LABELS = {
  INSURANCE: 'Insurance',
  SAFETY_INSPECTION: 'Safety Inspection',
  EMISSIONS: 'Emission Certificate'
};

function getDocumentLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS] || 'Compliance Document';
}

function toUtcDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  );
}

async function getVehicleDetailsMap(
  client: SupabaseClient
): Promise<Map<string, VehicleDetails>> {
  try {
    const { data: vehicles } = await client
      .from('vehicles')
      .select('id, license_plate, make, model');

    const map = new Map<string, VehicleDetails>();
    const records = (vehicles ?? []) as unknown as Array<{
      id: string;
      license_plate: string | null;
      make: string | null;
      model: string | null;
    }>;

    records.forEach((vehicle) => {
      map.set(vehicle.id, {
        licensePlate: vehicle.license_plate || vehicle.id,
        make: vehicle.make || '',
        model: vehicle.model || ''
      });
    });

    return map;
  } catch (error) {
    return new Map<string, VehicleDetails>();
  }
}

async function getComplianceNotifications(
  client: SupabaseClient,
  todayDate: Date
): Promise<Notification[]> {
  const [vehicleDetailsMap, { data: items, error }] = await Promise.all([
    getVehicleDetailsMap(client),
    client
      .from('compliance_items')
      .select('id, vehicle_id, document_type, expiration_date')
  ]);

  if (error) {
    throw new Error(`Database error in getComplianceNotifications: ${error.message}`);
  }

  const notifications: Notification[] = [];
  const warningLimitDate = new Date(todayDate.getTime());
  warningLimitDate.setUTCDate(warningLimitDate.getUTCDate() + 7);
  const records = (items ?? []) as unknown as ComplianceItem[];

  records.forEach((item) => {
    const expirationDate = toUtcDate(item.expiration_date);
    if (!expirationDate) {
      return;
    }

    const label = getDocumentLabel(item.document_type);
    const vehicleDetails = vehicleDetailsMap.get(item.vehicle_id);
    const vehicleLabel = vehicleDetails?.licensePlate || item.vehicle_id;

    if (expirationDate < todayDate) {
      notifications.push({
        id: `expiry-${item.id}`,
        vehicleId: vehicleLabel,
        licensePlate: vehicleLabel,
        type: 'EXPIRY',
        title: `${label} Expired`,
        message: `${label} for vehicle ${vehicleLabel} expired on ${item.expiration_date}.`,
        severity: 'CRITICAL',
        createdAt: item.expiration_date
      });
    } else if (expirationDate <= warningLimitDate) {
      notifications.push({
        id: `expiry-${item.id}`,
        vehicleId: vehicleLabel,
        licensePlate: vehicleLabel,
        type: 'EXPIRY',
        title: `${label} Expiring Soon`,
        message: `${label} for vehicle ${vehicleLabel} will expire on ${item.expiration_date}.`,
        severity: 'WARNING',
        createdAt: item.expiration_date
      });
    }
  });

  return notifications;
}

async function getServiceNotifications(
  client: SupabaseClient,
  todayDate: Date
): Promise<Notification[]> {
  const { data: vehicles, error } = await client
    .from('vehicles')
    .select('id, current_mileage, next_service_due_date, next_service_due_mileage, license_plate');

  if (error) {
    throw new Error(`Database error in getServiceNotifications: ${error.message}`);
  }

  const notifications: Notification[] = [];
  const records = (vehicles ?? []) as unknown as Vehicle[];

  records.forEach((vehicle) => {
    const dueDate = toUtcDate(vehicle.next_service_due_date);
    const dueMileage = vehicle.next_service_due_mileage
      ? Number(vehicle.next_service_due_mileage)
      : null;
    const currentMileage = Number(vehicle.current_mileage || 0);

    const isDateOverdue = dueDate !== null && todayDate > dueDate;
    const isMileageOverdue = dueMileage !== null && currentMileage >= dueMileage;

    if (isDateOverdue || isMileageOverdue) {
      let message = '';
      if (isDateOverdue && isMileageOverdue) {
        message = `Service is overdue by date (${vehicle.next_service_due_date}) and mileage limit (${dueMileage} km).`;
      } else if (isDateOverdue) {
        message = `Service was due on ${vehicle.next_service_due_date}.`;
      } else {
        message = `Current mileage (${currentMileage} km) is equal to or exceeds due mileage (${dueMileage} km).`;
      }

      const vehicleLabel = vehicle.license_plate || vehicle.id;
      notifications.push({
        id: `service-${vehicle.id}`,
        vehicleId: vehicleLabel,
        licensePlate: vehicleLabel,
        type: 'SERVICE',
        title: 'Vehicle Service Overdue',
        message,
        severity: 'WARNING',
        createdAt: vehicle.next_service_due_date || new Date().toISOString()
      });
    }
  });

  return notifications;
}

async function getOverrideNotifications(
  client: SupabaseClient
): Promise<Notification[]> {
  const [vehicleDetailsMap, { data: overrides, error }] = await Promise.all([
    getVehicleDetailsMap(client),
    client
      .from('assignment_overrides')
      .select('id, vehicle_id, driver_id, approved_by, justification, created_at')
  ]);

  if (error) {
    throw new Error(`Database error in getOverrideNotifications: ${error.message}`);
  }

  const records = (overrides ?? []) as unknown as AssignmentOverride[];
  return records.map((item) => {
    const vehicleDetails = vehicleDetailsMap.get(item.vehicle_id);
    const vehicleLabel = vehicleDetails?.licensePlate || item.vehicle_id;

    return {
      id: `override-${item.id}`,
      vehicleId: vehicleLabel,
      licensePlate: vehicleLabel,
      type: 'OVERRIDE',
      title: 'Assignment Override',
      message: `Assignment override occurred for vehicle ${vehicleLabel} (Driver: ${item.driver_id}) authorized by ${item.approved_by}. Justification: ${item.justification || 'No justification reason provided.'}`,
      severity: 'INFO',
      createdAt: item.created_at
    };
  });
}

async function getNotifications(): Promise<Notification[]> {
  const client = getSupabaseClient();
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  try {
    const [compliance, service, overrides] = await Promise.all([
      getComplianceNotifications(client, today),
      getServiceNotifications(client, today),
      getOverrideNotifications(client)
    ]);

    const allNotifications = [...compliance, ...service, ...overrides];

    return allNotifications.sort((a, b) => {
      const weightA = SEVERITY_WEIGHTS[a.severity];
      const weightB = SEVERITY_WEIGHTS[b.severity];

      if (weightA !== weightB) {
        return weightB - weightA;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    throw error;
  }
}

export {
  getNotifications,
  getComplianceNotifications,
  getServiceNotifications,
  getOverrideNotifications
};
