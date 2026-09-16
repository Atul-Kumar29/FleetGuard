import express from 'express';
import { getNotifications } from '../controllers/notificationController.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();
router.get('/notifications', requireRole(['ADMIN']), getNotifications);

export default router;
