const { getSupabaseClient } = require('../config/supabase');
const { calculateComplianceStatus } = require('./complianceStatus');

/**
 * Re-evaluates every compliance document so status remains correct as dates
 * pass, even when nobody edits a document that day.
 */
async function runComplianceMonitoring({ supabase = getSupabaseClient(), today = new Date(), logger = console } = {}) {
  const { data: documents, error: fetchError } = await supabase
    .from('compliance_items')
    .select('id, expiration_date, lead_time_days, status');

  if (fetchError) {
    throw new Error(`Unable to evaluate compliance documents: ${fetchError.message}`);
  }

  const changedDocuments = (documents || [])
    .map((document) => ({
      ...document,
      nextStatus: calculateComplianceStatus(document, today),
    }))
    .filter((document) => document.status !== document.nextStatus);

  await Promise.all(changedDocuments.map(async (document) => {
    const { error: updateError } = await supabase
      .from('compliance_items')
      .update({ status: document.nextStatus })
      .eq('id', document.id);

    if (updateError) {
      throw new Error(`Unable to update compliance document ${document.id}: ${updateError.message}`);
    }
  }));

  const summary = {
    evaluated: (documents || []).length,
    updated: changedDocuments.length,
    expired: changedDocuments.filter((document) => document.nextStatus === 'EXPIRED').length,
    warning: changedDocuments.filter((document) => document.nextStatus === 'WARNING').length,
  };

  logger.info?.('Compliance monitoring completed.', summary);
  return summary;
}

module.exports = {
  runComplianceMonitoring,
};
