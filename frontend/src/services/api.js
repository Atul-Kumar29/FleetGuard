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
