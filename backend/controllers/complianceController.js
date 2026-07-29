const { getSupabaseClient } = require('../config/supabase');
const { calculateComplianceStatus } = require('../services/complianceStatus');

const DOCUMENT_TYPE_ALIASES = Object.freeze({
  INSURANCE: 'INSURANCE',
  INSPECTION: 'SAFETY_INSPECTION',
  SAFETY_INSPECTION: 'SAFETY_INSPECTION',
  EMISSIONS: 'EMISSIONS',
});

function normalizeDocumentType(value) {
  return DOCUMENT_TYPE_ALIASES[String(value || '').trim().toUpperCase()];
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validateCompliancePayload(payload, { creating = false } = {}) {
  const errors = [];
  const documentType = normalizeDocumentType(payload.document_type);
  const documentNumber = payload.document_number === undefined ? undefined : String(payload.document_number).trim();
  const leadTimeDays = payload.lead_time_days === undefined ? undefined : Number(payload.lead_time_days);

  if (creating && !payload.vehicle_id) errors.push('Vehicle ID is required.');
  if ((creating || payload.document_type !== undefined) && !documentType) {
    errors.push('Document type must be INSURANCE, INSPECTION, or EMISSIONS.');
  }
  if (creating && !payload.expiration_date) errors.push('Expiration date is required.');
  if (payload.expiration_date !== undefined && !isValidDate(payload.expiration_date)) errors.push('Expiration date must use the YYYY-MM-DD format.');
  if (leadTimeDays !== undefined && (!Number.isInteger(leadTimeDays) || leadTimeDays < 0 || leadTimeDays > 365)) {
    errors.push('Lead time days must be an integer between 0 and 365.');
  }
  if (documentNumber !== undefined && documentNumber.length > 100) {
    errors.push('Document number must be 100 characters or fewer.');
  }

  return {
    errors,
    data: {
      vehicle_id: payload.vehicle_id,
      document_type: documentType,
      expiration_date: payload.expiration_date,
      lead_time_days: leadTimeDays,
      document_number: documentNumber,
    },
  };
}

async function createComplianceDocument(req, res) {
  try {
    const { errors, data } = validateCompliancePayload(req.body || {}, { creating: true });
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed.', details: errors });

    const supabase = getSupabaseClient();
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', data.vehicle_id)
      .maybeSingle();

    if (vehicleError) return res.status(500).json({ error: 'Unable to verify vehicle.', details: vehicleError.message });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

    // A vehicle has one active record for each document type. Renewal changes
    // that record instead of creating ambiguous duplicates.
    const { data: existing, error: existingError } = await supabase
      .from('compliance_items')
      .select('id')
      .eq('vehicle_id', data.vehicle_id)
      .eq('document_type', data.document_type)
      .maybeSingle();

    if (existingError) return res.status(500).json({ error: 'Unable to verify compliance document.', details: existingError.message });
    if (existing) return res.status(409).json({ error: `A ${data.document_type} document already exists for this vehicle. Update it instead.` });

    const complianceItem = {
      ...data,
      lead_time_days: data.lead_time_days ?? 30,
    };
    complianceItem.status = calculateComplianceStatus(complianceItem);
    if (complianceItem.document_number === undefined) delete complianceItem.document_number;

    const { data: created, error: insertError } = await supabase
      .from('compliance_items')
      .insert([complianceItem])
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: 'Unable to create compliance document.', details: insertError.message });
    return res.status(201).json({ message: 'Compliance document created successfully.', compliance_item: created });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
}

async function updateComplianceDocument(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Compliance document ID is required.' });

    const { errors, data } = validateCompliancePayload(req.body || {});
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed.', details: errors });

    const updatePayload = {};
    if (data.document_type !== undefined) updatePayload.document_type = data.document_type;
    if (data.expiration_date !== undefined) updatePayload.expiration_date = data.expiration_date;
    if (data.lead_time_days !== undefined) updatePayload.lead_time_days = data.lead_time_days;
    if (data.document_number !== undefined) updatePayload.document_number = data.document_number;

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ error: 'Provide at least one compliance field to update.' });
    }

    updatePayload.last_verified_at = new Date().toISOString();
    const supabase = getSupabaseClient();
    const { data: updated, error } = await supabase
      .from('compliance_items')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Failed to update compliance document.', details: error.message });
    if (!updated) return res.status(404).json({ error: 'Compliance document not found.' });
    return res.status(200).json({ message: 'Compliance document updated successfully.', compliance_item: updated });
  } catch (error) {
    console.error('Error updating compliance document:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
}

module.exports = {
  createComplianceDocument,
  updateComplianceDocument,
  validateCompliancePayload,
};
