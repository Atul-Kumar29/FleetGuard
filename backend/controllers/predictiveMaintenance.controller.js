const predictiveMaintenanceService = require('../services/predictiveMaintenance.service');


/**
 * Retrieves the predictive maintenance risks for all fleet vehicles.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function getPredictiveMaintenanceRisk(req, res) {
  try {
    const riskReport = await predictiveMaintenanceService.getPredictiveMaintenanceRisk();
    return res.status(200).json(riskReport);
  } catch (error) {
    console.error('Error in getPredictiveMaintenanceRisk Controller:', error);
    return res.status(500).json({
      error: 'An internal server error occurred while calculating predictive maintenance risk.',
      details: error.message
    });
  }
}

module.exports = {
  getPredictiveMaintenanceRisk
};
