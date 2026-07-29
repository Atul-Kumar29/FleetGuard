const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateComplianceStatus } = require('../services/complianceStatus');
const { runComplianceMonitoring } = require('../services/complianceMonitoringService');
const { millisecondsUntilNextDailyRun } = require('../services/complianceScheduler');

test('calculates valid, warning, and expired documents independently', () => {
  const today = new Date('2026-07-29T10:00:00Z');

  assert.equal(calculateComplianceStatus({ expiration_date: '2026-09-01', lead_time_days: 30 }, today), 'VALID');
  assert.equal(calculateComplianceStatus({ expiration_date: '2026-08-28', lead_time_days: 30 }, today), 'WARNING');
  assert.equal(calculateComplianceStatus({ expiration_date: '2026-07-28', lead_time_days: 7 }, today), 'EXPIRED');
});

test('monitor updates only documents whose persisted status is stale', async () => {
  const updates = [];
  const documents = [
    { id: 'expired', expiration_date: '2026-07-28', lead_time_days: 30, status: 'VALID' },
    { id: 'warning', expiration_date: '2026-08-01', lead_time_days: 7, status: 'VALID' },
    { id: 'valid', expiration_date: '2026-09-01', lead_time_days: 30, status: 'VALID' },
  ];
  const supabase = {
    from(table) {
      assert.equal(table, 'compliance_items');
      return {
        select() {
          return Promise.resolve({ data: documents, error: null });
        },
        update(payload) {
          return {
            eq(_column, id) {
              updates.push({ id, ...payload });
              return Promise.resolve({ error: null });
            },
          };
        },
      };
    },
  };

  const summary = await runComplianceMonitoring({
    supabase,
    today: new Date('2026-07-29T10:00:00Z'),
    logger: { info() {} },
  });

  assert.deepEqual(updates, [
    { id: 'expired', status: 'EXPIRED' },
    { id: 'warning', status: 'WARNING' },
  ]);
  assert.deepEqual(summary, { evaluated: 3, updated: 2, expired: 1, warning: 1 });
});

test('schedules the next check at 00:05 the following day after the daily window', () => {
  const now = new Date('2026-07-29T10:00:00');
  assert.equal(millisecondsUntilNextDailyRun(now), 14 * 60 * 60 * 1000 + 5 * 60 * 1000);
});
