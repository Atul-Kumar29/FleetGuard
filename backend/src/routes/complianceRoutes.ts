import express from 'express';
import { requireRole } from '../middleware/auth.js';
import { createComplianceDocument, updateComplianceDocument } from '../controllers/complianceController.js';

const router = express.Router();
router.post('/', requireRole(['FLEET_MANAGER', 'ADMIN', 'MECHANIC']), createComplianceDocument);
router.put('/:id', requireRole(['FLEET_MANAGER', 'ADMIN', 'MECHANIC']), updateComplianceDocument);

export default router;
