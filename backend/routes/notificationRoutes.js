const express = require('express');
const notificationController = require('../controllers/notificationController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * Route to fetch active notifications for admin dashboard.
 * Protected: Requires ADMIN role authorization.
 */
router.get('/notifications', requireRole(['ADMIN']), notificationController.getNotifications);

module.exports = router;
