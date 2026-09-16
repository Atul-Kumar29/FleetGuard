import express from 'express';
import { getDriverVehicle, submitPreTripChecklist, getDrivers } from '../controllers/driverController.js';

const router = express.Router();
router.get('/list', getDrivers);
router.get('/vehicle', getDriverVehicle);
router.post('/pre-trip', submitPreTripChecklist);

export default router;
