import axios from 'axios';

/**
 * Service to interact with the Predictive Maintenance API endpoint.
 */

// Use the VITE_API_URL environment variable provided by Vercel for the Render backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api/admin`;

/**
 * Fetches the predictive maintenance risk report for all fleet vehicles.
 * 
 * @returns {Promise<Array>} Promise resolving to the list of vehicles and risk scores.
 */
export const getPredictiveMaintenanceReport = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/predictive-maintenance`);
    return response.data;
  } catch (error) {
    console.error('API Error in getPredictiveMaintenanceReport:', error);
    // Propagate the specific backend error message if available
    const message = error.response?.data?.details || error.response?.data?.error || error.message;
    throw new Error(message, { cause: error });
  }
};
