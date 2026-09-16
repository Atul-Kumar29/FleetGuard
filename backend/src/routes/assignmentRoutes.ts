import express from 'express';
import { createAssignment, overrideAssignment, unassignDriver } from '../controllers/assignmentController.js';

const router = express.Router();
router.post('/', createAssignment);
router.post('/override', overrideAssignment);
router.post('/unassign', unassignDriver);
router.delete('/unassign/:vehicleId', unassignDriver);
router.delete('/:vehicleId', unassignDriver);

export default router;
