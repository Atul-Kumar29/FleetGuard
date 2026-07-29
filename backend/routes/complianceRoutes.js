const express = require('express');
const { requireRole } = require('../middleware/auth');
const { updateComplianceDocument } = require('../controllers/complianceController');

const router = express.Router();

router.put('/:id', requireRole(['FLEET_MANAGER', 'ADMIN', 'MECHANIC']), updateComplianceDocument);

module.exports = router;
