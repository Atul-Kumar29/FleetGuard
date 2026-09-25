import axios from 'axios';

/**
 * Service to interact with the Fleet Analytics API endpoint.
 */

// We use the proxy configured in vite.config.js
// (mapping /api to http://localhost:5000)
const API_BASE_URL = '/api/admin';

const createErrorWithCause = (
  message: string,
  cause: unknown
): Error => {
  const wrapped = new Error(message) as Error & {
    cause?: unknown;
  };

  wrapped.cause = cause;
  return wrapped;
};

export interface FleetAnalyticsMetrics {
  totalVehicles: number;
  compliantVehicles: number;
  expiredVehicles: number;
  upcomingExpiryVehicles: number;
  totalMaintenanceCost: number;
  highRiskVehicles: number;
}

/**
 * Fetches the fleet analytics metrics report.
 *
 * @returns Promise resolving to the dashboard metrics.
 */
export const getFleetAnalyticsMetrics =
  async (): Promise<FleetAnalyticsMetrics> => {
    try {
      const response = await axios.get<FleetAnalyticsMetrics>(
        `${API_BASE_URL}/metrics`
      );

      return response.data;
    } catch (error: unknown) {
      console.error(
        'API Error in getFleetAnalyticsMetrics:',
        error
      );

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.details ||
          error.response?.data?.error ||
          error.message;

        throw createErrorWithCause(message, error);
      }

      if (error instanceof Error) {
        throw createErrorWithCause(error.message, error);
      }

      throw new Error(
        'Unable to fetch fleet analytics metrics.'
      );
    }
  };