const express = require('express');
const { requireRole } = require('../middleware/auth');
const { createComplianceDocument, updateComplianceDocument } = require('../controllers/complianceController');

const router = express.Router();

router.post('/', requireRole(['FLEET_MANAGER', 'ADMIN', 'MECHANIC']), createComplianceDocument);
router.put('/:id', requireRole(['FLEET_MANAGER', 'ADMIN', 'MECHANIC']), updateComplianceDocument);

module.exports = router;
