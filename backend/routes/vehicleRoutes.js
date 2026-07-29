const express = require('express');
const { registerVehicle, getVehicleDetails, getFleetList } = require('../controllers/vehicleController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireRole(['FLEET_MANAGER', 'ADMIN']), registerVehicle);
router.get('/', requireRole(['FLEET_MANAGER', 'ADMIN', 'DRIVER']), getFleetList);
router.get('/:id', requireRole(['FLEET_MANAGER', 'ADMIN', 'DRIVER']), getVehicleDetails);

module.exports = router;
