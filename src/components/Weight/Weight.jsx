import React, { useMemo, useState } from 'react';
import './weight.css';

import { useMaster } from '../../state/MasterContext';
import { addWeightEntry, computeTrend, computeWeeklyAverage } from '../../utils/weightLocal';
import WeightChart from '../WeightChart/WeightChart';

const Weight = () => {
  const { master, actions } = useMaster();

  const entries = master?.weight?.entries || [];
  const mode = master?.weight?.mode || { enabled: false, startKg: null, goalKg: null };

  const [weight, setWeight] = useState('');
  const [message, setMessage] = useState('');

  const weeklyAvg = useMemo(() => computeWeeklyAverage(entries, 7), [entries]);
  const trend = useMemo(() => computeTrend(entries), [entries]);

  const submitWeight = () => {
    const v = Number(weight);

    if (!Number.isFinite(v) || v <= 0) {
      setMessage('Please enter a valid weight');
      return;
    }

    actions.updateMaster(prev => {
      const nextEntries = addWeightEntry(prev.weight?.entries || [], v);
      return {
        ...prev,
        weight: {
          ...prev.weight,
          entries: nextEntries,
        },
      };
    });

    setMessage(`Weighed in at ${v.toFixed(1)}kg`);
    setWeight('');
  };

  return (
    <div className="weight-logger">
      <h3>📝 Log Your Weight</h3>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="number"
          step="0.1"
          placeholder="Enter weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <button onClick={submitWeight} type="button">Submit</button>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="metrics">
        {weeklyAvg !== null && (
          <div className="average">
            🧮 Weekly Average: <strong>{weeklyAvg} kg</strong>
          </div>
        )}

        {trend && (
          <div
            className={`trend ${
              trend === 'up' ? 'gain' : trend === 'down' ? 'loss' : 'same'
            }`}
          >
            {trend === 'up' && '🔺 Weight increased'}
            {trend === 'down' && '🔻 Weight decreased'}
            {trend === 'same' && '⏸️ No change'}
          </div>
        )}

        {mode.enabled && (
          <div style={{ marginTop: 8, opacity: 0.9 }}>
            🎯 Goal: <b>{mode.goalKg ?? '—'}kg</b> (Start: {mode.startKg ?? '—'}kg)
          </div>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <WeightChart />
      </div>
    </div>
  );
};

export default Weight;
