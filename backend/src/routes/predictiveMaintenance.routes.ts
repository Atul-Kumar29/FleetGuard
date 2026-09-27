const express = require('express');
const router = express.Router();
const predictiveMaintenanceController = require('../controllers/predictiveMaintenance.controller');


router.get('/predictive-maintenance', predictiveMaintenanceController.getPredictiveMaintenanceRisk);

module.exports = router;
