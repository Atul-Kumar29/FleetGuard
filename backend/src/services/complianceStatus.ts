type ComplianceStatus = 'VALID' | 'WARNING' | 'EXPIRED';

type ComplianceDocument = {
  expiration_date: string | Date;
  lead_time_days?: number | string;
};

const STATUS = {
  VALID: 'VALID',
  WARNING: 'WARNING',
  EXPIRED: 'EXPIRED'
} as const;

function toUtcDate(value: string | Date, fieldName: string): Date {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

    if (match) {
      return new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
      );
    }
  }

  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  );
}

function calculateComplianceStatus(
  { expiration_date, lead_time_days = 30 }: ComplianceDocument,
  today: Date = new Date()
): ComplianceStatus {
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

export {
  STATUS,
  calculateComplianceStatus
};
