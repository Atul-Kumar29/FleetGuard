import supabase from '../config/supabase.js';

type Vehicle = {
  id: string;
  license_plate: string;
  make: string;
  model: string;
};

type User = {
  id: string;
  full_name: string;
  email: string;
};

type AssignmentOverrideRecord = {
  id: string;
  justification: string;
  created_at: string;
  vehicle: Vehicle | null;
  driver: User | null;
  manager: User | null;
};

type AssignmentOverride = {
  id: string;
  vehicle: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
  } | null;
  driver: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  manager: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  overrideReason: string;
  createdAt: string;
};

/**
 * Fetch and format every record from assignment_overrides.
 * Joins vehicles, users as Driver, and users as Manager.
 * Sorts by created_at descending (newest overrides first).
 *
 * @returns Formatted override records
 */
async function getAssignmentOverrides(): Promise<AssignmentOverride[]> {
  try {
    const { data, error } = await supabase
      .from('assignment_overrides')
      .select(`
        id,
        justification,
        created_at,
        vehicle:vehicles (
          id,
          license_plate,
          make,
          model
        ),
        driver:users!driver_id (
          id,
          full_name,
          email
        ),
        manager:users!approved_by (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(
        `Database error while fetching assignment overrides: ${error.message}`
      );
    }

    const records: AssignmentOverrideRecord[] =
      (data ?? []) as unknown as AssignmentOverrideRecord[];

    return records.map((record) => ({
      id: record.id,

      vehicle: record.vehicle
        ? {
            id: record.vehicle.id,
            licensePlate: record.vehicle.license_plate,
            make: record.vehicle.make,
            model: record.vehicle.model
          }
        : null,

      driver: record.driver
        ? {
            id: record.driver.id,
            fullName: record.driver.full_name,
            email: record.driver.email
          }
        : null,

      manager: record.manager
        ? {
            id: record.manager.id,
            fullName: record.manager.full_name,
            email: record.manager.email
          }
        : null,

      overrideReason: record.justification,
      createdAt: record.created_at
    }));
  } catch (error) {
    throw error;
  }
}

export {
  getAssignmentOverrides
};