const { getSupabaseClient } = require('../config/supabase');

const allowedTypes = ['TRUCK', 'VAN', 'TRAILER', 'CAR'];
const allowedStatuses = ['ACTIVE', 'IN_MAINTENANCE', 'DECOMMISSIONED'];

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateVehiclePayload(payload) {
  const errors = [];
  const vin = normalizeString(payload.vin).toUpperCase();
  const licensePlate = normalizeString(payload.license_plate).toUpperCase();
  const make = normalizeString(payload.make);
  const model = normalizeString(payload.model);
  const year = Number(payload.year);
  const type = normalizeString(payload.type).toUpperCase();
  const status = normalizeString(payload.status || 'ACTIVE').toUpperCase();
  const currentMileage = Number(payload.current_mileage ?? 0);

  if (!vin) errors.push('VIN is required.');
  if (vin && vin.length > 17) errors.push('VIN must be 17 characters or fewer.');

  if (!licensePlate) errors.push('License plate is required.');
  if (licensePlate && licensePlate.length > 20) errors.push('License plate must be 20 characters or fewer.');

  if (!make) errors.push('Make is required.');
  if (!model) errors.push('Model is required.');

  if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1) {
    errors.push('Year must be a valid four-digit year.');
  }

  if (!allowedTypes.includes(type)) {
    errors.push('Type must be one of TRUCK, VAN, TRAILER, or CAR.');
  }

  if (!allowedStatuses.includes(status)) {
    errors.push('Status must be ACTIVE, IN_MAINTENANCE, or DECOMMISSIONED.');
  }

  if (!Number.isInteger(currentMileage) || currentMileage < 0) {
    errors.push('Current mileage must be a non-negative integer.');
  }

  return {
    errors,
    data: {
      vin,
      license_plate: licensePlate,
      make,
      model,
      year,
      type,
      status,
      current_mileage: currentMileage,
    },
  };
}

async function registerVehicle(req, res) {
  try {
    const { errors, data } = validateVehiclePayload(req.body || {});

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed.', details: errors });
    }

    const supabase = getSupabaseClient();

    const [{ data: vinMatches, error: vinError }, { data: plateMatches, error: plateError }] = await Promise.all([
      supabase.from('vehicles').select('id').eq('vin', data.vin).limit(1),
      supabase.from('vehicles').select('id').eq('license_plate', data.license_plate).limit(1),
    ]);

    if (vinError || plateError) {
      return res.status(500).json({ error: 'Unable to verify duplicate vehicle records.', details: [vinError?.message, plateError?.message].filter(Boolean) });
    }

    if ((vinMatches || []).length > 0 || (plateMatches || []).length > 0) {
      return res.status(409).json({ error: 'A vehicle with the same VIN or license plate already exists.' });
    }

    const { data: vehicle, error: insertError } = await supabase
      .from('vehicles')
      .insert([data])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: 'Unable to register vehicle.', details: insertError.message });
    }

    return res.status(201).json({
      message: 'Vehicle registered successfully.',
      vehicle,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
}

async function getVehicleDetails(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Vehicle ID is required.' });
    }

    const supabase = getSupabaseClient();

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (vehicleError || !vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    const { data: complianceItems, error: complianceError } = await supabase
      .from('compliance_items')
      .select('*')
      .eq('vehicle_id', id)
      .order('expiration_date', { ascending: true });

    if (complianceError) {
      return res.status(500).json({ error: 'Unable to fetch compliance documents.', details: complianceError.message });
    }

    return res.status(200).json({
      vehicle,
      compliance_items: complianceItems || [],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
}

module.exports = {
  registerVehicle,
  getVehicleDetails,
};
