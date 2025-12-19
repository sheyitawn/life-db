import React, { useEffect, useMemo, useState } from 'react';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
];

// JS getDay(): 0 Sun ... 6 Sat
function getTodayKey() {
  const d = new Date().getDay();
  if (d === 1) return 'monday';
  if (d === 2) return 'tuesday';
  if (d === 3) return 'wednesday';
  if (d === 4) return 'thursday';
  if (d === 5) return 'friday';
  if (d === 6) return 'saturday';
  return null; // Sunday => no weekly goal (per your spec)
}

export default function WeeklyGoalsSettings({
  value,
  onChange,
}) {
  const [todayKey, setTodayKey] = useState(getTodayKey());

  // Keeps "current day" accurate as days roll over (checks every 30s)
  useEffect(() => {
    const t = setInterval(() => setTodayKey(getTodayKey()), 30_000);
    return () => clearInterval(t);
  }, []);

  const todayLabel = useMemo(() => {
    if (!todayKey) return 'Sunday';
    return DAYS.find(d => d.key === todayKey)?.label || 'Today';
  }, [todayKey]);

  const todayGoal = todayKey ? (value?.[todayKey] || '') : '';

  const setDay = (dayKey, nextText) => {
    onChange({
      ...value,
      [dayKey]: nextText,
    });
  };

  return (
    <div className="cfg-widget-block">
      <p className="cfg-help">
        Set your goal for each day (Mon–Sat). The “Today” preview updates automatically as the week moves forward.
      </p>

      <div className="cfg-weekly-preview">
        <div className="cfg-weekly-preview-title">
          <b>Today:</b> {todayLabel}
        </div>
        <div className="cfg-weekly-preview-goal">
          {todayGoal?.trim() ? todayGoal : <span className="cfg-muted">No goal set for today.</span>}
        </div>
      </div>

      <div className="cfg-weekly-grid">
        {DAYS.map(d => (
          <div key={d.key} className="cfg-field">
            <label>{d.label}</label>
            <input
              value={value?.[d.key] ?? ''}
              onChange={(e) => setDay(d.key, e.target.value)}
              placeholder={`Goal for ${d.label}...`}
              className={todayKey === d.key ? 'cfg-input-today' : ''}
            />
          </div>
        ))}
      </div>

      <div className="cfg-note">
        <span className="cfg-muted">
          Saving to the backend comes later — this is just config UI wiring.
        </span>
      </div>
    </div>
  );
}
