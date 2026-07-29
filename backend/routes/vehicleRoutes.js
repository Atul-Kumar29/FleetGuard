const express = require('express');
const { registerVehicle, getVehicleDetails } = require('../controllers/vehicleController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireRole(['FLEET_MANAGER', 'ADMIN']), registerVehicle);
router.get('/:id', requireRole(['FLEET_MANAGER', 'ADMIN', 'DRIVER']), getVehicleDetails);

module.exports = router;
