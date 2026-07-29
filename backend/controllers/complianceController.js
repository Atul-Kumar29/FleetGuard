const { getSupabaseClient } = require('../config/supabase');

async function updateComplianceDocument(req, res) {
  try {
    const { id } = req.params;
    const { expiration_date, lead_time_days, document_number } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Compliance document ID is required.' });
    }

    const errors = [];

    if (expiration_date) {
      const expiryDate = new Date(expiration_date);
      if (isNaN(expiryDate.getTime())) {
        errors.push('Expiration date must be a valid date.');
      }
    }

    if (lead_time_days !== undefined) {
      const leadTime = Number(lead_time_days);
      if (!Number.isInteger(leadTime) || leadTime < 0 || leadTime > 365) {
        errors.push('Lead time days must be an integer between 0 and 365.');
      }
    }

    if (document_number !== undefined) {
      const docNumber = String(document_number).trim();
      if (docNumber.length > 100) {
        errors.push('Document number must be 100 characters or fewer.');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const supabase = getSupabaseClient();

    const updatePayload = {};
    if (expiration_date) updatePayload.expiration_date = expiration_date;
    if (lead_time_days !== undefined) updatePayload.lead_time_days = lead_time_days;
    if (document_number !== undefined) updatePayload.document_number = document_number;

    updatePayload.last_verified_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('compliance_items')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update compliance document.' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Compliance document not found.' });
    }

    res.status(200).json({ message: 'Compliance document updated successfully.', compliance_item: data });
  } catch (err) {
    console.error('Error updating compliance document:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = {
  updateComplianceDocument,
};
