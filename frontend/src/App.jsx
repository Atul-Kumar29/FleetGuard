import { useState } from 'react';
import { registerVehicle } from './services/api';

const initialForm = {
  vin: '',
  license_plate: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  type: 'TRUCK',
  status: 'ACTIVE',
  current_mileage: 0,
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...form,
        year: Number(form.year),
        current_mileage: Number(form.current_mileage),
      };

      const result = await registerVehicle(payload);
      setMessage(`Vehicle registered successfully: ${result.vehicle?.license_plate || 'New vehicle'}`);
      setForm(initialForm);
    } catch (err) {
      setError(err.message || 'Unable to register vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="card">
        <div className="card-header">
          <p className="eyebrow">FleetGuard</p>
          <h1>Register a new vehicle</h1>
          <p className="subtitle">Capture the core fleet details required to keep compliance checks accurate.</p>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="grid">
            <label>
              <span>VIN</span>
              <input name="vin" value={form.vin} onChange={handleChange} required />
            </label>
            <label>
              <span>License plate</span>
              <input name="license_plate" value={form.license_plate} onChange={handleChange} required />
            </label>
            <label>
              <span>Make</span>
              <input name="make" value={form.make} onChange={handleChange} required />
            </label>
            <label>
              <span>Model</span>
              <input name="model" value={form.model} onChange={handleChange} required />
            </label>
            <label>
              <span>Year</span>
              <input name="year" type="number" min="1900" max="2100" value={form.year} onChange={handleChange} required />
            </label>
            <label>
              <span>Current mileage</span>
              <input name="current_mileage" type="number" min="0" value={form.current_mileage} onChange={handleChange} required />
            </label>
            <label>
              <span>Vehicle type</span>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="TRUCK">Truck</option>
                <option value="VAN">Van</option>
                <option value="TRAILER">Trailer</option>
                <option value="CAR">Car</option>
              </select>
            </label>
            <label>
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="IN_MAINTENANCE">In maintenance</option>
                <option value="DECOMMISSIONED">Decommissioned</option>
              </select>
            </label>
          </div>

          <button type="submit" disabled={loading}>{loading ? 'Registering…' : 'Register vehicle'}</button>
        </form>

        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </div>
  );
}

export default App;
