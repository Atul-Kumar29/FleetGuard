import axios from 'axios';

/**
 * Service to interact with the Fleet Analytics API endpoint.
 */

// Use the VITE_API_URL environment variable provided by Vercel for the Render backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api/admin`;

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
    throw new Error(message, { cause: error });
  }
};
