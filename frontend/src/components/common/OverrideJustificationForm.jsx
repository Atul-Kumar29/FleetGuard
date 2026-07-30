import React, { useState } from 'react';

const PRESET_CATEGORIES = [
  { id: 'EMERGENCY', label: 'Emergency Shift Coverage', icon: '🚑' },
  { id: 'GRACE_PERIOD', label: 'Temporary Grace Period', icon: '⏱️' },
  { id: 'EXECUTIVE_ORDER', label: 'Executive Authorization', icon: '📜' },
  { id: 'ROUTE_CRITICAL', label: 'Route Critical Dispatch', icon: '🚛' },
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
    if (onCategoryChange) {
      onCategoryChange(cat.id);
    }
    // Append preset text if textarea is empty or default
    if (onChange && (!value || value.trim().length < minChars)) {
      const template = `[${cat.label}] `;
      if (!value.startsWith(template)) {
        onChange(template + value);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || loading) return;
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className="override-form-card">
      <div className="override-form-header">
        <div className="override-badge">🔒 Manager Override Authorization</div>
        <p className="override-subtitle">
          Explicit reasoning is required to force driver assignment on non-compliant vehicles.
        </p>
      </div>

      {/* Preset Category Chips */}
      <div className="override-categories-section">
        <label className="override-label">Select Override Reason Category</label>
        <div className="category-chips-grid">
          {PRESET_CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-chip ${isSelected ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat)}
              >
                <span className="chip-icon">{cat.icon}</span>
                <span className="chip-label">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Justification Textarea & Counter */}
      <div className="override-input-group">
        <div className="label-counter-row">
          <label htmlFor="override-justification-input" className="override-label">
            Justification Reasoning <span className="required-star">*</span>
          </label>
          <span className={`char-counter ${isValid ? 'valid' : 'invalid'}`}>
            {charCount} / {minChars} min characters
          </span>
        </div>

        <textarea
          id="override-justification-input"
          className="override-textarea"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder="Describe the operational business reason for forcing this assignment (minimum 10 characters)..."
          rows={3}
          required
        />

        {!isValid && (
          <p className="validation-hint">
            ⚠️ "Force Assignment" button remains disabled until minimum {minChars} characters of justification are entered.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="override-actions-row">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
        <button
          type="button"
          className="btn-primary btn-warning btn-force-assignment"
          onClick={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading ? 'Authorizing...' : `⚡ ${submitText}`}
        </button>
      </div>
    </div>
  );
}
