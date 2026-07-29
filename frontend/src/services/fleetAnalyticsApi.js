import axios from 'axios';

/**
 * Service to interact with the Fleet Analytics API endpoint.
 */

// We use the proxy configured in vite.config.js (mapping /api to http://localhost:5000)
const API_BASE_URL = '/api/admin';

/**
 * Fetches the fleet analytics metrics report.
 * 
 * @returns {Promise<Object>} Promise resolving to the dashboard metrics.
 */
export const getFleetAnalyticsMetrics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/metrics`);
    return response.data;
  } catch (error) {
    console.error('API Error in getFleetAnalyticsMetrics:', error);
    const message = error.response?.data?.details || error.response?.data?.error || error.message;
    throw new Error(message);
  }
};
