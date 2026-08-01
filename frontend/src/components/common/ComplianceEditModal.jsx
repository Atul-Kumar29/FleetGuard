import { useState } from 'react';
import { updateCompliance } from '../../services/api';
import { X } from 'lucide-react';

export default function ComplianceEditModal({ compliance, onClose, onSave }) {
  const [formData, setFormData] = useState({
    expiration_date: compliance?.expiration_date ? compliance.expiration_date.split('T')[0] : '',
    document_number: compliance?.document_number || '',
    lead_time_days: compliance?.lead_time_days || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'lead_time_days' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await updateCompliance(compliance.id, formData);
      if (onSave) onSave(result.compliance_item);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update compliance document.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const readonlyClass = "w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm cursor-not-allowed";
  const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-extrabold text-slate-900">Edit Compliance Document</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className={labelClass}>Document Type</label>
            <input type="text" value={compliance?.document_type || 'N/A'} disabled className={readonlyClass} />
          </div>
          <div>
            <label className={labelClass}>Current Status</label>
            <input type="text" value={compliance?.status || 'N/A'} disabled className={readonlyClass} />
          </div>
          <div>
            <label className={labelClass}>Document Number</label>
            <input type="text" name="document_number" value={formData.document_number} onChange={handleChange} placeholder="Enter document number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Expiration Date</label>
            <input type="date" name="expiration_date" value={formData.expiration_date} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Lead Time Days (warning before expiry)</label>
            <input type="number" name="lead_time_days" min="0" max="365" value={formData.lead_time_days} onChange={handleChange} className={inputClass} />
          </div>

          {error && <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:bg-slate-300">
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
