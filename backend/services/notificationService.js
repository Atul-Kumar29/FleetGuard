const supabase = require('../config/supabase');

// Severity weight mapping for sorting precedence
const SEVERITY_WEIGHTS = {
  CRITICAL: 3,
  WARNING: 2,
  INFO: 1
};

// Document type human-readable labels mapping
const DOCUMENT_TYPE_LABELS = {
  INSURANCE: 'Insurance',
  SAFETY_INSPECTION: 'Safety Inspection',
  EMISSIONS: 'Emission Certificate'
};

/**
 * Normalizes document type code names into readable formatting labels.
 */
function getDocumentLabel(type) {
  return DOCUMENT_TYPE_LABELS[type] || 'Compliance Document';
}

/**
 * Normalizes dates into UTC calendar dates for comparison.
 */
function toUtcDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

/**
 * Fetch and evaluate compliance exirations.
 * Generates CRITICAL notification if expired, WARNING notification if expiring within 7 days.
 */
async function getComplianceNotifications(client, todayDate) {
  const [vehicleDetailsMap, { data: items, error }] = await Promise.all([
    getVehicleDetailsMap(client),
    client
      .from('compliance_items')
      .select('id, vehicle_id, document_type, expiration_date')
  ]);

  if (error) {
    throw new Error(`Database error in getComplianceNotifications: ${error.message}`);
  }

  const notifications = [];
  const warningLimitDate = new Date(todayDate.getTime());
  warningLimitDate.setUTCDate(warningLimitDate.getUTCDate() + 7);

  (items || []).forEach(item => {
    const expirationDate = toUtcDate(item.expiration_date);
    if (!expirationDate) return;

    const label = getDocumentLabel(item.document_type);
    const vehicleDetails = vehicleDetailsMap.get(item.vehicle_id) || {};
    const vehicleLabel = vehicleDetails.licensePlate || item.vehicle_id;

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

/**
 * Fetch and evaluate vehicle maintenance schedules.
 * Generates WARNING notifications if next service due date or mileage limits are exceeded.
 */
async function getServiceNotifications(client, todayDate) {
  const { data: vehicles, error } = await client
    .from('vehicles')
    .select('id, current_mileage, next_service_due_date, next_service_due_mileage, license_plate');

  if (error) {
    throw new Error(`Database error in getServiceNotifications: ${error.message}`);
  }

  const notifications = [];

  (vehicles || []).forEach(vehicle => {
    const dueDate = toUtcDate(vehicle.next_service_due_date);
    const dueMileage = vehicle.next_service_due_mileage ? Number(vehicle.next_service_due_mileage) : null;
    const currentMileage = Number(vehicle.current_mileage || 0);

    const isDateOverdue = dueDate && todayDate > dueDate;
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

      notifications.push({
        id: `service-${vehicle.id}`,
        vehicleId: vehicle.license_plate || vehicle.id,
        licensePlate: vehicle.license_plate || vehicle.id,
        type: 'SERVICE',
        title: 'Vehicle Service Overdue',
        message: message,
        severity: 'WARNING',
        // Use next service due date or today for notification reference timestamp
        createdAt: vehicle.next_service_due_date || new Date().toISOString()
      });
    }
  });

  return notifications;
}

/**
 * Fetch and map manual supervisor override events.
 * Generates INFO severity auditing notifications.
 */
async function getOverrideNotifications(client) {
  const [vehicleDetailsMap, { data: overrides, error }] = await Promise.all([
    getVehicleDetailsMap(client),
    client
      .from('assignment_overrides')
      .select('id, vehicle_id, driver_id, approved_by, justification, created_at')
  ]);

  if (error) {
    throw new Error(`Database error in getOverrideNotifications: ${error.message}`);
  }

  return (overrides || []).map(item => {
    const vehicleDetails = vehicleDetailsMap.get(item.vehicle_id) || {};
    const vehicleLabel = vehicleDetails.licensePlate || item.vehicle_id;

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

/**
 * Aggregates all dynamic notification rules, sorting by severity index and recency.
 * 
 * @returns {Promise<Array<Object>>} List of sorted notification objects
 */
async function getNotifications() {
  const client = supabase;
  
  // Set comparison today limit to midnight UTC to prevent clock differences
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  try {
    const [compliance, service, overrides] = await Promise.all([
      getComplianceNotifications(client, today),
      getServiceNotifications(client, today),
      getOverrideNotifications(client)
    ]);

    const allNotifications = [...compliance, ...service, ...overrides];

    // Sort by severity hierarchy, then by createdAt descending
    return allNotifications.sort((a, b) => {
      const weightA = SEVERITY_WEIGHTS[a.severity] || 0;
      const weightB = SEVERITY_WEIGHTS[b.severity] || 0;

      if (weightA !== weightB) {
        return weightB - weightA;
      }
      
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getNotifications,
  getComplianceNotifications,
  getServiceNotifications,
  getOverrideNotifications
};
