import express from 'express';
import { getAssignmentOverrides } from '../controllers/adminController.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();
router.get('/overrides', requireRole(['ADMIN']), getAssignmentOverrides);

export default router;
