import express from 'express';
import { registerVehicle, getVehicleDetails, getFleetList, updateVehicleMileage } from '../controllers/vehicleController.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();
router.post('/', requireRole(['FLEET_MANAGER', 'ADMIN']), registerVehicle);
router.get('/', requireRole(['FLEET_MANAGER', 'ADMIN', 'DRIVER']), getFleetList);
router.get('/:id', requireRole(['FLEET_MANAGER', 'ADMIN', 'DRIVER']), getVehicleDetails);
router.put('/:id/mileage', requireRole(['FLEET_MANAGER', 'ADMIN', 'DRIVER']), updateVehicleMileage);

export default router;
