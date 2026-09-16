import express from 'express';
import * as serviceController from '../controllers/serviceController.js';

const router = express.Router();
router.get('/queue', serviceController.getServiceQueue);
router.get('/service-types', serviceController.getServiceTypes);
router.post('/start', serviceController.startService);
router.post('/complete', serviceController.completeService);
router.get('/history/:vehicleId', serviceController.getServiceHistory);

export default router;
