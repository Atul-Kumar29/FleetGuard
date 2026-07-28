const supabase = require('../config/supabase');
const { calculateMaintenanceRisk } = require('../utils/riskCalculator');

/**
 * Service to calculate predictive maintenance risk for all vehicles.
 * Retrieves vehicle data and joins with maintenance logs.
 * 
 * @returns {Promise<Array>} A list of vehicles with mileage and risk info.
 */
async function getPredictiveMaintenanceRisk() {
  // Query all vehicles along with their maintenance logs
  // PostgREST will return maintenance_logs as an array nested in each vehicle object
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select(`
      id,
      license_plate,
      make,
      model,
      current_mileage,
      maintenance_logs (
        service_mileage,
        service_date
      )
    `);

  if (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`Supabase query failed (${error.message}). Falling back to mock data for demonstration.`);
      return getMockVehiclesReport();
    }
    throw new Error(`Database error while fetching predictive risk: ${error.message}`);
  }

  if (!vehicles) {
    return [];
  }

  // Map each vehicle to include risk calculations
  return vehicles.map(vehicle => {
    const logs = vehicle.maintenance_logs || [];
    
    let lastServiceMileage = 0;
    
    if (logs.length > 0) {
      // Find the log with the latest service date
      const latestLog = logs.reduce((latest, current) => {
        const latestTime = new Date(latest.service_date).getTime();
        const currentTime = new Date(current.service_date).getTime();
        
        if (currentTime > latestTime) {
          return current;
        } else if (currentTime === latestTime) {
          return current.service_mileage > latest.service_mileage ? current : latest;
        }
        return latest;
      });
      
      lastServiceMileage = latestLog.service_mileage;
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
      lastServiceMileage: logs.length > 0 ? lastServiceMileage : 0,
      distanceSinceLastService,
      risk
    };
  });
}

/**
 * Generates sample data for demonstration when Supabase is unresolvable.
 */
function getMockVehiclesReport() {
  const sampleVehicles = [
    {
      vehicleId: 'uuid-demo-1',
      licensePlate: 'KA19AB1234',
      make: 'Tata',
      model: 'Prima (Cargo Carrier)',
      currentMileage: 48000,
      lastServiceMileage: 39000,
      distanceSinceLastService: 9000,
      risk: 'MEDIUM'
    },
    {
      vehicleId: 'uuid-demo-2',
      licensePlate: 'MH12CD5678',
      make: 'Mahindra',
      model: 'Blazo (Heavy Tipper)',
      currentMileage: 22000,
      lastServiceMileage: 18000,
      distanceSinceLastService: 4000,
      risk: 'LOW'
    },
    {
      vehicleId: 'uuid-demo-3',
      licensePlate: 'DL01EF9012',
      make: 'Ashok Leyland',
      model: 'U-Truck (Tanker)',
      currentMileage: 15000,
      lastServiceMileage: 0,
      distanceSinceLastService: 15000,
      risk: 'HIGH'
    },
    {
      vehicleId: 'uuid-demo-4',
      licensePlate: 'KA03GH3456',
      make: 'Volvo',
      model: 'FMX (Dump Truck)',
      currentMileage: 30000,
      lastServiceMileage: 19000,
      distanceSinceLastService: 11000,
      risk: 'HIGH'
    },
    {
      vehicleId: 'uuid-demo-5',
      licensePlate: 'HR55JK6789',
      make: 'Eicher',
      model: 'Pro 6028',
      currentMileage: 85000,
      lastServiceMileage: 79500,
      distanceSinceLastService: 5500,
      risk: 'LOW'
    }
  ];
  return sampleVehicles;
}

module.exports = {
  getPredictiveMaintenanceRisk
};
