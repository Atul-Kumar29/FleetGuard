const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCompliancePayload } = require('../controllers/complianceController');

test('accepts an individual emissions document and normalizes inspection aliases', () => {
  const emissions = validateCompliancePayload({
    vehicle_id: 'vehicle-id',
    document_type: 'emissions',
    expiration_date: '2026-12-31',
    lead_time_days: 15,
    document_number: 'EM-123',
  }, { creating: true });
  const inspection = validateCompliancePayload({
    vehicle_id: 'vehicle-id',
    document_type: 'inspection',
    expiration_date: '2026-12-31',
  }, { creating: true });

  assert.deepEqual(emissions.errors, []);
  assert.equal(emissions.data.document_type, 'EMISSIONS');
  assert.deepEqual(inspection.errors, []);
  assert.equal(inspection.data.document_type, 'SAFETY_INSPECTION');
});

test('rejects invalid dates and unsupported document types', () => {
  const result = validateCompliancePayload({
    vehicle_id: 'vehicle-id',
    document_type: 'registration',
    expiration_date: '2026-02-30',
  }, { creating: true });

  assert.deepEqual(result.errors, [
    'Document type must be INSURANCE, INSPECTION, or EMISSIONS.',
    'Expiration date must use the YYYY-MM-DD format.',
  ]);
});
