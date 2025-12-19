// src/pages/widgets/WeightSettings.jsx
import React from 'react';

export default function WeightSettings({ value, onChange }) {
  const mode = value || { enabled: false, startKg: null, goalKg: null };

  const set = (patch) => {
    onChange({
      enabled: !!(patch.enabled ?? mode.enabled),
      startKg: patch.startKg ?? mode.startKg ?? null,
      goalKg: patch.goalKg ?? mode.goalKg ?? null,
    });
  };

  return (
    <div className="cfg-form">
      <div className="cfg-row">
        <label className="cfg-label">Weight loss mode</label>
        <button
          className={mode.enabled ? 'cfg-toggle cfg-toggle-on' : 'cfg-toggle'}
          onClick={() => set({ enabled: !mode.enabled })}
          type="button"
        >
          {mode.enabled ? 'On' : 'Off'}
        </button>
      </div>

      <div className="cfg-row">
        <label className="cfg-label">Starting weight (kg)</label>
        <input
          type="number"
          step="0.1"
          value={mode.startKg ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            set({ startKg: v === '' ? null : Number(v) });
          }}
          placeholder="e.g. 101.0"
        />
      </div>

      <div className="cfg-row">
        <label className="cfg-label">Goal weight (kg)</label>
        <input
          type="number"
          step="0.1"
          value={mode.goalKg ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            set({ goalKg: v === '' ? null : Number(v) });
          }}
          placeholder="e.g. 85.0"
        />
      </div>

      <div style={{ opacity: 0.8, marginTop: 8 }}>
        Tip: even if Weight loss mode is off, you can still log weight entries.
      </div>
    </div>
  );
}
