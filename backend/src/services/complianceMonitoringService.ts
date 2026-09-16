import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../config/supabase.js';
import { calculateComplianceStatus } from './complianceStatus.js';

type ComplianceDocument = {
  id: string;
  expiration_date: string | Date;
  lead_time_days?: number | string;
  status: string;
};

type MonitoringLogger = {
  info?: (message: string, summary: MonitoringSummary) => void;
};

type MonitoringOptions = {
  supabase?: SupabaseClient;
  today?: Date;
  logger?: MonitoringLogger;
};

type MonitoringSummary = {
  evaluated: number;
  updated: number;
  expired: number;
  warning: number;
};

async function runComplianceMonitoring({
  supabase = getSupabaseClient(),
  today = new Date(),
  logger = console
}: MonitoringOptions = {}): Promise<MonitoringSummary> {
  const { data, error: fetchError } = await supabase
    .from('compliance_items')
    .select('id, expiration_date, lead_time_days, status');

  if (fetchError) {
    throw new Error(
      `Unable to evaluate compliance documents: ${fetchError.message}`
    );
  }

  const documents = (data ?? []) as unknown as ComplianceDocument[];
  const changedDocuments = documents
    .map((document) => ({
      ...document,
      nextStatus: calculateComplianceStatus(document, today)
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

  const summary: MonitoringSummary = {
    evaluated: documents.length,
    updated: changedDocuments.length,
    expired: changedDocuments.filter(
      (document) => document.nextStatus === 'EXPIRED'
    ).length,
    warning: changedDocuments.filter(
      (document) => document.nextStatus === 'WARNING'
    ).length
  };

  logger.info?.('Compliance monitoring completed.', summary);
  return summary;
}

export {
  runComplianceMonitoring
};
