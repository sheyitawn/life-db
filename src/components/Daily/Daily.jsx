import React, { useMemo } from 'react';
import './Daily.css';

import { useMaster } from '../../state/MasterContext';
import {
  normalizeHabits,
  ymdLocal,
  parseYmdToLocalDate,
  isHabitScheduledOnDate,
  getDoneForDate,
  toggleDoneForDate,
} from '../../utils/habitsLocal';

function Daily() {
  const { master, updateMaster } = useMaster();

  const today = ymdLocal(new Date());
  const todayDateObj = useMemo(() => parseYmdToLocalDate(today), [today]);

  const habits = useMemo(() => {
    const raw = master?.habits?.list || [];
    const normalized = normalizeHabits(raw);
    return normalized.filter(h => isHabitScheduledOnDate(h, todayDateObj));
  }, [master, todayDateObj]);

  const records = master?.habits?.records || [];

  const completedCount = habits.filter(h => getDoneForDate(records, today, h.id)).length;
  const progress = habits.length ? Math.round((completedCount / habits.length) * 100) : 0;

  const toggleHabit = (habitId) => {
    updateMaster(prev => {
      const m = structuredClone(prev);
      m.habits = m.habits || {};
      m.habits.records = Array.isArray(m.habits.records) ? m.habits.records : [];

      const { next } = toggleDoneForDate(m.habits.records, today, habitId);
      m.habits.records = next;

      return m;
    });
  };

  return (
    <div className="daily-card">
      <div className="daily-header">
        <h4>daily</h4>

        <div className="daily-header-icons">
          <div className="daily-progress-circle" style={{ '--value': progress }}>
            <div className="daily-progress-circle_center">
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {!habits.length ? (
        <p className="card-subtle" style={{ opacity: 0.7 }}>
          No habits scheduled for today. Add habits in <b>Config → Habits</b>.
        </p>
      ) : (
        <ul className="daily-goals">
          {habits.map((h) => {
            const done = getDoneForDate(records, today, h.id);
            return (
              <li key={h.id} className={`goal-item ${done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => toggleHabit(h.id)}
                />
                <span>{h.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Daily;
