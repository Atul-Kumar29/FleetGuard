const notificationService = require('../services/notificationService');

/**
 * Controller to handle retrieving dynamically calculated notification alerts.
 * 
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @returns {Promise<Object>} JSON response containing list of active notifications
 */
async function getNotifications(req, res) {
  try {
    const data = await notificationService.getNotifications();
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
  getNotifications
};
