import React, { useState } from 'react';
import { postPreTripChecklist } from '../../services/api';
import { Disc, OctagonAlert, Droplet, ShieldAlert, CheckCircle2, AlertTriangle, ClipboardCheck, Zap } from 'lucide-react';

const DEFAULT_ITEMS = [
  { id: 'tires_lights', label: 'Tires & Lights',       icon: Disc,        description: 'Tread depth, tire pressure, headlights, brake lights & turn signals' },
  { id: 'brakes',       label: 'Brake System',          icon: OctagonAlert, description: 'Foot brake responsiveness, air brake pressure & emergency parking brake' },
  { id: 'fluids',       label: 'Fluid Levels',          icon: Droplet,     description: 'Engine oil level, radiator coolant, windshield washer fluid' },
  { id: 'safety_gear',  label: 'Safety Equipment',      icon: ShieldAlert, description: 'Seatbelts operational, fire extinguisher charged, reflective triangles' },
];

export default function PreTripChecklistForm({ driverId, vehicleId, onSubmitted }) {
  const [itemsState, setItemsState] = useState({ tires_lights: 'PASS', brakes: 'PASS', fluids: 'PASS', safety_gear: 'PASS' });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCompletedToday, setIsCompletedToday] = useState(false);

  const handleToggleItem = (id, status) => setItemsState((prev) => ({ ...prev, [id]: status }));
  const handleAllPass = () => setItemsState({ tires_lights: 'PASS', brakes: 'PASS', fluids: 'PASS', safety_gear: 'PASS' });

  const hasFailedItem = Object.values(itemsState).some((val) => val === 'FAIL');
  const overallStatus = hasFailedItem ? 'FAIL' : 'PASS';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driverId || !vehicleId) { setError('Driver and Vehicle details are required to submit pre-trip check.'); return; }
    if (hasFailedItem && (!notes || notes.trim().length < 5)) { setError('Please provide issue notes for failed inspection items (minimum 5 characters).'); return; }

    try {
      setLoading(true); setError(''); setSuccessMessage('');
      const payload = { driver_id: driverId, vehicle_id: vehicleId, status: overallStatus, passed: !hasFailedItem, checklist_items: itemsState, notes: notes.trim() || null };
      const res = await postPreTripChecklist(payload);
      setSuccessMessage(res.message || 'Pre-trip checklist recorded successfully!');
      setIsCompletedToday(true);
      if (onSubmitted) onSubmitted(res);
    } catch (err) {
      setError(err.message || 'Failed to record pre-trip checklist.');
    } finally {
      setLoading(false);
    }
  };

  if (isCompletedToday) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center gap-3 shadow-sm">
        <CheckCircle2 size={44} className="text-emerald-500" />
        <h3 className="text-lg font-extrabold text-slate-900">Pre-Trip Inspection Complete</h3>
        <p className="text-sm text-emerald-700">
          Today's pre-trip safety checklist has been logged. Status: <strong>{overallStatus}</strong>
        </p>
        <button type="button" onClick={() => setIsCompletedToday(false)}
          className="mt-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-all">
          Submit New Check
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">
            <ClipboardCheck size={13} /> Pre-Trip Safety Check
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">Vehicle Duty Checklist</h2>
          <p className="text-xs text-slate-500 mt-0.5">Fast 4-item tap-through inspection before departure</p>
        </div>
        <button type="button" onClick={handleAllPass}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full transition-all shrink-0">
          <Zap size={13} /> All Pass
        </button>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-lg">{error}</div>}
      {successMessage && <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-lg">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Checklist items */}
        <div className="flex flex-col gap-2.5">
          {DEFAULT_ITEMS.map((item) => {
            const currentStatus = itemsState[item.id] || 'PASS';
            const isPass = currentStatus === 'PASS';
            const ItemIcon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border transition-all
                  ${isPass ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
              >
                <div className="flex items-center gap-3">
                  <ItemIcon size={20} className="text-slate-500 shrink-0" />
                  <div>
                    <strong className="text-sm font-bold text-slate-900">{item.label}</strong>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id, 'PASS')}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all
                      ${isPass ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}
                  >
                    <CheckCircle2 size={13} /> PASS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id, 'FAIL')}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all
                      ${!isPass ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}
                  >
                    <AlertTriangle size={13} /> FAIL
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notes for failures */}
        {hasFailedItem && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <label htmlFor="pretrip-notes-input" className="flex items-center gap-1.5 text-xs font-bold text-red-800 uppercase mb-2">
              <AlertTriangle size={14} className="text-amber-600" /> Report Failed Inspection Details <span className="text-red-500">*</span>
            </label>
            <textarea
              id="pretrip-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the failed item defect (e.g. low tire tread depth on rear left tire)..."
              rows={2}
              required
              className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border
            ${hasFailedItem ? 'bg-red-100 text-red-800 border-red-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
            Overall: <strong>{overallStatus}</strong>
          </span>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2.5 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:bg-slate-300
              ${hasFailedItem ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {loading ? 'Submitting...' : `Log Checklist (${overallStatus})`}
          </button>
        </div>
      </form>
    </div>
  );
}
