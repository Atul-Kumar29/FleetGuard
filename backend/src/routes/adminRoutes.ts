const express = require('express');
const adminController = require('../controllers/adminController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/overrides', requireRole(['ADMIN']), adminController.getAssignmentOverrides);

module.exports = router;
