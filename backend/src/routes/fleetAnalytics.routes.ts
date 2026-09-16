import express from 'express';
import { getFleetMetrics } from '../controllers/fleetAnalytics.controller.js';

const router = express.Router();
router.get('/metrics', getFleetMetrics);

export default router;
