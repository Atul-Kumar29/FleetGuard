const fleetAnalyticsService = require('../services/fleetAnalytics.service');

/**
 * Retrieves overall fleet statistics.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function getFleetMetrics(req, res) {
  try {
    const metrics = await fleetAnalyticsService.getFleetMetrics();
    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Error in getFleetMetrics Controller:', error);
    return res.status(500).json({
      error: 'An internal server error occurred while generating fleet analytics metrics.',
      details: error.message
    });
  }
}

module.exports = {
  getFleetMetrics
};
