const express = require('express');
const notificationController = require('../controllers/notificationController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/notifications', requireRole(['ADMIN']), notificationController.getNotifications);

module.exports = router;
