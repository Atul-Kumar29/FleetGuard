const adminService = require('../services/adminService');

/**
 * Controller to handle retrieving assignment override records for admin dashboard.
 * 
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @returns {Promise<Object>} JSON response containing list of overrides or error message
 */
async function getAssignmentOverrides(req, res) {
  try {
    const data = await adminService.getAssignmentOverrides();
    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  getAssignmentOverrides
};
