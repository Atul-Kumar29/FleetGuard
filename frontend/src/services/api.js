const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getApiError(data, fallback) {
  const details = Array.isArray(data.details) ? data.details.join(' ') : data.details;
  return details || data.error || data.message || fallback;
}

export async function loginWithSupabase(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiError(data, 'Unable to sign in.'));
  }

  return data;
}

export async function registerWithSupabase(email, password, fullName, role) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName, role }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiError(data, 'Unable to sign up.'));
  }

  return data;
}

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
    throw new Error(getApiError(data, 'Unable to register vehicle.'));
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
    throw new Error(getApiError(data, 'Unable to fetch vehicle details.'));
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
    throw new Error(getApiError(data, 'Unable to fetch fleet list.'));
  }

  return data;
}

export async function updateCompliance(complianceId, updates) {
  const response = await fetch(`${API_BASE_URL}/api/compliance/${complianceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('fleetguard_token') || ''}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiError(data, 'Unable to update compliance document.'));
  }

  return data;
}

export async function createCompliance(document) {
  const response = await fetch(`${API_BASE_URL}/api/compliance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('fleetguard_token') || ''}`,
    },
    body: JSON.stringify(document),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getApiError(data, 'Unable to create compliance document.'));
  }

  return data;
}

export async function getServiceQueue(search = "", status = "all", sort = "due_date") {
  const response = await fetch(
    `${API_BASE_URL}/api/services/queue?search=${encodeURIComponent(search)}&status=${status}&sort=${sort}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('fleetguard_token') || ''}`,
      },
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getApiError(data, 'Unable to fetch service queue.'));
  }

  return data;
}

export async function postCompleteService(payload) {
  const response = await fetch(`${API_BASE_URL}/api/services/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("fleetguard_token") || ""}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getApiError(data, "Unable to complete service."));
  }

  return data;
}
