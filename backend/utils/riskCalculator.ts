/**
 * Calculates the maintenance risk and distance since last service based on vehicle mileage.
 */
export function calculateMaintenanceRisk(
  currentMileage: number,
  lastServiceMileage?: number | null
): {
  distanceSinceLastService: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
} {
  const serviceMileage =
    lastServiceMileage !== null && lastServiceMileage !== undefined
      ? Number(lastServiceMileage)
      : 0;

  const distance = Math.max(0, Number(currentMileage) - serviceMileage);

  let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  if (distance > 10000) {
    risk = 'HIGH';
  } else if (distance > 7000) {
    risk = 'MEDIUM';
  }

  return {
    distanceSinceLastService: distance,
    risk,
  };
}
