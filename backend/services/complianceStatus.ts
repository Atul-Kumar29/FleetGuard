export const STATUS: Readonly<{
  VALID: 'VALID';
  WARNING: 'WARNING';
  EXPIRED: 'EXPIRED';
}> = {
  VALID: 'VALID',
  WARNING: 'WARNING',
  EXPIRED: 'EXPIRED',
};

function toUtcDate(
  value: string | Date | null | undefined,
  fieldName: string
): Date {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match) {
      return new Date(
        Date.UTC(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3])
        )
      );
    }
  }

  const parsed =
    value instanceof Date ? new Date(value.getTime()) : new Date(String(value ?? ''));

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate()
    )
  );
}

export function calculateComplianceStatus(
  document: {
    expiration_date?: string | Date | null;
    lead_time_days?: number;
  },
  today: Date = new Date()
): 'VALID' | 'WARNING' | 'EXPIRED' {
  const expirationDate = toUtcDate(
    document.expiration_date,
    'Expiration date'
  );
  const currentDate = toUtcDate(today, 'Today');
  const leadTimeDays = Number(document.lead_time_days ?? 30);

  if (!Number.isInteger(leadTimeDays) || leadTimeDays < 0) {
    throw new Error('Lead time days must be a non-negative integer.');
  }

  if (expirationDate < currentDate) {
    return STATUS.EXPIRED;
  }

  const warningDate = new Date(currentDate.getTime());
  warningDate.setUTCDate(warningDate.getUTCDate() + leadTimeDays);

  return expirationDate <= warningDate
    ? STATUS.WARNING
    : STATUS.VALID;
}
