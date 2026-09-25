import { getSupabaseClient } from '../config/supabase';
import { calculateComplianceStatus } from './complianceStatus';

interface ComplianceDocument {
  id: string | number;
  expiration_date: string;
  lead_time_days: number;
  status: string;
}

interface ComplianceDocumentWithNextStatus extends ComplianceDocument {
  nextStatus: string;
}

interface ComplianceMonitoringSummary {
  evaluated: number;
  updated: number;
  expired: number;
  warning: number;
}

interface Logger {
  info?: (message: string, summary: ComplianceMonitoringSummary) => void;
}

interface RunComplianceMonitoringOptions {
  supabase?: ReturnType<typeof getSupabaseClient>;
  today?: Date;
  logger?: Logger;
}

/**
 * Re-evaluates every compliance document so status remains correct as dates
 * pass, even when nobody edits a document that day.
 */
async function runComplianceMonitoring({
  supabase = getSupabaseClient(),
  today = new Date(),
  logger = console,
}: RunComplianceMonitoringOptions = {}): Promise<ComplianceMonitoringSummary> {
  const { data: documents, error: fetchError } = await supabase
    .from('compliance_items')
    .select('id, expiration_date, lead_time_days, status');

  if (fetchError) {
    throw new Error(
      `Unable to evaluate compliance documents: ${fetchError.message}`
    );
  }

  const records = (documents ?? []) as ComplianceDocument[];

  const changedDocuments: ComplianceDocumentWithNextStatus[] = records
    .map((document) => ({
      ...document,
      nextStatus: calculateComplianceStatus(document, today),
    }))
    .filter((document) => document.status !== document.nextStatus);

  await Promise.all(
    changedDocuments.map(async (document) => {
      const { error: updateError } = await supabase
        .from('compliance_items')
        .update({ status: document.nextStatus })
        .eq('id', document.id);

      if (updateError) {
        throw new Error(
          `Unable to update compliance document ${document.id}: ${updateError.message}`
        );
      }
    })
  );

  const summary: ComplianceMonitoringSummary = {
    evaluated: records.length,
    updated: changedDocuments.length,
    expired: changedDocuments.filter(
      (document) => document.nextStatus === 'EXPIRED'
    ).length,
    warning: changedDocuments.filter(
      (document) => document.nextStatus === 'WARNING'
    ).length,
  };

  logger.info?.('Compliance monitoring completed.', summary);

  return summary;
}

export {
  runComplianceMonitoring,
};