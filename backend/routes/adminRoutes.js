const express = require('express');
const adminController = require('../controllers/adminController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * Route to fetch all assignment override records for administrative review.
 * Protected: Requires ADMIN role authorization.
 */
router.get('/overrides', requireRole(['ADMIN']), adminController.getAssignmentOverrides);

module.exports = router;
