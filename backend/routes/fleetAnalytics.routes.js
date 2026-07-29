const express = require('express');
const router = express.Router();
const fleetAnalyticsController = require('../controllers/fleetAnalytics.controller');


router.get('/metrics', fleetAnalyticsController.getFleetMetrics);

module.exports = router;
