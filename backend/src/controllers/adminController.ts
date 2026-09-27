const adminService = require('../services/adminService');

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
