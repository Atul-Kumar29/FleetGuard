const STATUS = Object.freeze({
  VALID: 'VALID',
  WARNING: 'WARNING',
  EXPIRED: 'EXPIRED',
});

function toUtcDate(value, fieldName) {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match) {
      return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    }
  }

  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

/**
 * Calculates a document's live status using calendar dates, rather than the
 * status persisted when the document was last edited.
 */
function calculateComplianceStatus({ expiration_date, lead_time_days = 30 }, today = new Date()) {
  const expirationDate = toUtcDate(expiration_date, 'Expiration date');
  const currentDate = toUtcDate(today, 'Today');
  const leadTimeDays = Number(lead_time_days);

  if (!Number.isInteger(leadTimeDays) || leadTimeDays < 0) {
    throw new Error('Lead time days must be a non-negative integer.');
  }

  if (expirationDate < currentDate) {
    return STATUS.EXPIRED;
  }

  const warningDate = new Date(currentDate.getTime());
  warningDate.setUTCDate(warningDate.getUTCDate() + leadTimeDays);

  return expirationDate <= warningDate ? STATUS.WARNING : STATUS.VALID;
}

module.exports = {
  STATUS,
  calculateComplianceStatus,
};
