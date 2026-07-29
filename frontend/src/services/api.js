const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function registerVehicle(payload) {
  const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('fleetguard_token') || ''}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to register vehicle.');
  }

  return data;
}

export async function getVehicleDetails(vehicleId) {
  const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('fleetguard_token') || ''}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to fetch vehicle details.');
  }

  return data;
}

export async function getFleetList(filters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const queryString = params.toString();
  const url = queryString ? `${API_BASE_URL}/api/vehicles?${queryString}` : `${API_BASE_URL}/api/vehicles`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('fleetguard_token') || ''}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Unable to fetch fleet list.');
  }

  return data;
}
