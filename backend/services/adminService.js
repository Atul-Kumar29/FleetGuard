const supabase = require('../config/supabase');

/**
 * Fetch and format every record from assignment_overrides.
 * Joins vehicles, users as Driver, and users as Manager.
 * Sorts by created_at descending (newest overrides first).
 * 
 * @returns {Promise<Array<Object>>} Formatted override records
 */
async function getAssignmentOverrides() {
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
      throw new Error(`Database error while fetching assignment overrides: ${error.message}`);
    }

    const records = data || [];

    // Map fields to match administrative camelCase API structure
    return records.map(record => ({
      id: record.id,
      vehicle: record.vehicle ? {
        id: record.vehicle.id,
        licensePlate: record.vehicle.license_plate,
        make: record.vehicle.make,
        model: record.vehicle.model
      } : null,
      driver: record.driver ? {
        id: record.driver.id,
        fullName: record.driver.full_name,
        email: record.driver.email
      } : null,
      manager: record.manager ? {
        id: record.manager.id,
        fullName: record.manager.full_name,
        email: record.manager.email
      } : null,
      overrideReason: record.justification,
      createdAt: record.created_at
    }));
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAssignmentOverrides
};
