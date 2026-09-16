import express from 'express';
import { getPredictiveMaintenanceRisk } from '../controllers/predictiveMaintenance.controller.js';

const router = express.Router();
router.get('/predictive-maintenance', getPredictiveMaintenanceRisk);

export default router;
