// src/pages/widgets/PhasesSettings.jsx
import React, { useMemo, useState } from 'react';
import { computePhaseModel } from '../../../utils/phasesLocal';

export default function PhasesSettings({ master, enabled, onChangeSettings, onRecord }) {
  const settings = master?.phases?.settings || {
    lastPeriodStart: '',
    lastPeriodEnd: '',
    cycleLengthDays: 28,
    periodLengthDays: 5,
    ovulationLengthDays: 1,
    lutealLengthDays: 14,
  };

  const history = master?.phases?.history || [];

  const model = useMemo(() => computePhaseModel(settings, history), [settings, history]);

  const [msg, setMsg] = useState('');

  const set = (patch) => {
    onChangeSettings({ ...settings, ...patch });
  };

  const canRecord =
    enabled &&
    /^\d{4}-\d{2}-\d{2}$/.test(settings.lastPeriodStart) &&
    /^\d{4}-\d{2}-\d{2}$/.test(settings.lastPeriodEnd);

  // helpful derived info shown to user
  const cycle = Number(settings.cycleLengthDays || 28);
  const period = Number(settings.periodLengthDays || 5);
  const ovul = Number(settings.ovulationLengthDays || 1);
  const luteal = Number(settings.lutealLengthDays || 14);
  const follicular = Math.max(1, cycle - (period + ovul + luteal));

  return (
    <div className="cfg-form">
      <div className="cfg-row">
        <label className="cfg-label">Last Period Start</label>
        <input
          type="date"
          value={settings.lastPeriodStart}
          onChange={(e) => set({ lastPeriodStart: e.target.value })}
        />
      </div>

      <div className="cfg-row">
        <label className="cfg-label">Last Period End</label>
        <input
          type="date"
          value={settings.lastPeriodEnd}
          onChange={(e) => set({ lastPeriodEnd: e.target.value })}
        />
      </div>

      <div className="cfg-row">
        <label className="cfg-label">Cycle Length (days)</label>
        <input
          type="number"
          min={10}
          max={60}
          value={settings.cycleLengthDays}
          onChange={(e) => set({ cycleLengthDays: Number(e.target.value) })}
        />
      </div>

      <div className="cfg-row">
        <label className="cfg-label">Average Period Length (days)</label>
        <input
          type="number"
          min={1}
          max={14}
          value={settings.periodLengthDays}
          onChange={(e) => set({ periodLengthDays: Number(e.target.value) })}
        />
      </div>

      {/* ✅ NEW */}
      <div className="cfg-row">
        <label className="cfg-label">Ovulation Length (days)</label>
        <input
          type="number"
          min={1}
          max={5}
          value={settings.ovulationLengthDays ?? 1}
          onChange={(e) => set({ ovulationLengthDays: Number(e.target.value) })}
        />
      </div>

      {/* ✅ NEW */}
      <div className="cfg-row">
        <label className="cfg-label">Luteal Length (days)</label>
        <input
          type="number"
          min={7}
          max={18}
          value={settings.lutealLengthDays ?? 14}
          onChange={(e) => set({ lutealLengthDays: Number(e.target.value) })}
        />
      </div>

      <div style={{ marginTop: 8, opacity: 0.85 }}>
        Follicular (auto): <b>{follicular}</b> day(s) — calculated as: cycle − (period + ovulation + luteal)
      </div>

      <div className="cfg-row" style={{ gap: 10, alignItems: 'center', marginTop: 10 }}>
        <button
          type="button"
          disabled={!canRecord}
          onClick={() => {
            if (!enabled) {
              setMsg('Enable the Phases widget first to record history.');
              return;
            }
            onRecord();
            setMsg('Recorded this month’s period to history.');
          }}
        >
          Record This Month
        </button>

        <div style={{ opacity: 0.8 }}>
          History entries: <b>{Array.isArray(history) ? history.length : 0}</b>
        </div>
      </div>

      {msg && <div style={{ marginTop: 8, opacity: 0.85 }}>{msg}</div>}

      <div style={{ marginTop: 12, opacity: 0.85 }}>
        {model.ok ? (
          <>
            Current: <b>{model.phase}</b> (Day {model.cycleDay}/{model.cycleLen})<br />
            Next period (predicted): <b>{model.nextPeriodStartYmd}</b>
          </>
        ) : (
          <>Set “Last Period Start” to enable phase prediction.</>
        )}
      </div>
    </div>
  );
}
