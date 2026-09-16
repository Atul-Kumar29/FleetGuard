type MaintenanceRisk = 'LOW' | 'MEDIUM' | 'HIGH';

type MaintenanceRiskResult = {
  distanceSinceLastService: number;
  risk: MaintenanceRisk;
};

function calculateMaintenanceRisk(
  currentMileage: number | string,
  lastServiceMileage: number | string | null | undefined
): MaintenanceRiskResult {
  const serviceMileage =
    lastServiceMileage !== null && lastServiceMileage !== undefined
      ? Number(lastServiceMileage)
      : 0;

  const distance = Math.max(0, Number(currentMileage) - serviceMileage);

  let risk: MaintenanceRisk = 'LOW';
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

export {
  calculateMaintenanceRisk
};
