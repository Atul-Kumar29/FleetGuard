const notificationService = require('../services/notificationService');

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
