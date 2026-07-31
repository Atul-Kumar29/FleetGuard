import React from 'react';
import { AlertCircle, Clock, FileText, Truck, Lock, AlertTriangle, Zap } from 'lucide-react';

const PRESET_CATEGORIES = [
  { id: 'EMERGENCY',       label: 'Emergency Shift Coverage',  icon: AlertCircle },
  { id: 'GRACE_PERIOD',    label: 'Temporary Grace Period',    icon: Clock },
  { id: 'EXECUTIVE_ORDER', label: 'Executive Authorization',   icon: FileText },
  { id: 'ROUTE_CRITICAL',  label: 'Route Critical Dispatch',   icon: Truck },
];

export default function OverrideJustificationForm({
  value = '',
  onChange,
  category = '',
  onCategoryChange,
  onSubmit,
  onCancel,
  loading = false,
  minChars = 10,
  submitText = 'Force Assignment'
}) {
  const charCount = value ? value.trim().length : 0;
  const isValid = charCount >= minChars;

  const handleCategorySelect = (cat) => {
    if (onCategoryChange) onCategoryChange(cat.id);
    if (onChange && (!value || value.trim().length < minChars)) {
      const template = `[${cat.label}] `;
      if (!value.startsWith(template)) onChange(template + value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || loading) return;
    if (onSubmit) onSubmit(e);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 uppercase tracking-wide mb-1">
          <Lock size={13} /> Manager Override Authorization
        </div>
        <p className="text-xs text-amber-700">Explicit reasoning is required to force driver assignment on non-compliant vehicles.</p>
      </div>

      {/* Category chips */}
      <div>
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">Select Override Reason Category</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg text-xs font-semibold text-left transition-all duration-150
                  ${isSelected
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <CatIcon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="override-justification-input" className="text-xs font-bold text-amber-800 uppercase tracking-wide">
            Justification <span className="text-red-500">*</span>
          </label>
          <span className={`text-[11px] font-extrabold ${isValid ? 'text-emerald-600' : 'text-red-600'}`}>
            {charCount} / {minChars} min chars
          </span>
        </div>
        <textarea
          id="override-justification-input"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder="Describe the operational business reason for forcing this assignment..."
          rows={3}
          required
          className="w-full px-3 py-2.5 border border-amber-300 rounded-lg bg-white text-slate-900 text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
        />
        {!isValid && (
          <p className="flex items-center gap-1 text-[11px] text-amber-700 mt-1">
            <AlertTriangle size={13} className="text-amber-600" />
            Button remains disabled until {minChars} characters are entered.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all">
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm disabled:bg-slate-300 disabled:text-slate-500 transition-all"
        >
          {loading ? 'Authorizing...' : <><Zap size={15} /> {submitText}</>}
        </button>
      </div>
    </div>
  );
}
