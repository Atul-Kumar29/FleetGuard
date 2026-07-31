import { useState } from 'react';
import { registerVehicle } from '../services/api';
import { PlusCircle } from 'lucide-react';

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

export default function VehicleRegistrationPage() {
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
      const payload = { ...form, year: Number(form.year), current_mileage: Number(form.current_mileage) };
      const result = await registerVehicle(payload);
      setMessage(`Vehicle registered successfully: ${result.vehicle?.license_plate || 'New vehicle'}`);
      setForm(initialForm);
    } catch (err) {
      setError(err.message || 'Unable to register vehicle.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">FleetGuard</p>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Register a New Vehicle</h1>
        <p className="text-sm text-slate-500 mt-1">Capture the core fleet details required to keep compliance checks accurate.</p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>VIN</label>
              <input name="vin" value={form.vin} onChange={handleChange} required placeholder="e.g. 1HGCM82633A123456" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>License Plate</label>
              <input name="license_plate" value={form.license_plate} onChange={handleChange} required placeholder="e.g. MH12AB1234" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Make</label>
              <input name="make" value={form.make} onChange={handleChange} required placeholder="e.g. Toyota" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Model</label>
              <input name="model" value={form.model} onChange={handleChange} required placeholder="e.g. Hilux" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Year</label>
              <input name="year" type="number" min="1900" max="2100" value={form.year} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Current Mileage (km)</label>
              <input name="current_mileage" type="number" min="0" value={form.current_mileage} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Vehicle Type</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                <option value="TRUCK">Truck</option>
                <option value="VAN">Van</option>
                <option value="TRAILER">Trailer</option>
                <option value="CAR">Car</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                <option value="ACTIVE">Active</option>
                <option value="IN_MAINTENANCE">In Maintenance</option>
                <option value="DECOMMISSIONED">Decommissioned</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>
          )}
          {message && (
            <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-lg text-sm transition-all shadow-sm"
          >
            <PlusCircle size={17} />
            {loading ? 'Registering...' : 'Register Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
}
