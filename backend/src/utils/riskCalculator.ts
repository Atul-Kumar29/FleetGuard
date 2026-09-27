
function calculateMaintenanceRisk(currentMileage, lastServiceMileage) {
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
