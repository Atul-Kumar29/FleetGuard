
/**
 * Calculates the maintenance risk and distance since last service based on vehicle mileage.
 * 
 * @param {number} currentMileage - The vehicle's current odometer mileage.
 * @param {number|null|undefined} lastServiceMileage - The odometer mileage at the last service.
 * @returns {Object} An object containing distanceSinceLastService and the risk level (LOW, MEDIUM, HIGH).
 */
function calculateMaintenanceRisk(currentMileage, lastServiceMileage) {
  // If there is no service history, we treat last service mileage as 0
  const serviceMileage = (lastServiceMileage !== null && lastServiceMileage !== undefined) 
    ? Number(lastServiceMileage) 
    : 0;

  const distance = Math.max(0, Number(currentMileage) - serviceMileage);
  
  let risk = 'LOW';
  if (distance > 10000) {
    risk = 'HIGH';
  } else if (distance > 7000) {
    risk = 'MEDIUM';
  }

  return {
    distanceSinceLastService: distance,
    risk
  };
}

module.exports = {
  calculateMaintenanceRisk
};
