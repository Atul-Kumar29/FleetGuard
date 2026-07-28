const express = require('express');
const { registerVehicle } = require('../controllers/vehicleController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireRole(['FLEET_MANAGER', 'ADMIN']), registerVehicle);

module.exports = router;
