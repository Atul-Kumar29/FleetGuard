import axios from 'axios';

/**
 * Service to interact with the Predictive Maintenance API endpoint.
 */

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

export interface PredictiveMaintenanceItem {
  [key: string]: unknown;
}

/**
 * Fetches the predictive maintenance risk report
 * for all fleet vehicles.
 *
 * @returns Promise resolving to the list of vehicles and risk scores.
 */
export const getPredictiveMaintenanceReport =
  async (): Promise<PredictiveMaintenanceItem[]> => {
    try {
      const response = await axios.get<PredictiveMaintenanceItem[]>(
        `${API_BASE_URL}/predictive-maintenance`
      );

      return response.data;
    } catch (error: unknown) {
      console.error(
        'API Error in getPredictiveMaintenanceReport:',
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
        'Unable to fetch predictive maintenance report.'
      );
    }
  };