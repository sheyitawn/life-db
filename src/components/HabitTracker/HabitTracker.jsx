// src/components/HabitTracker/HabitTracker.jsx
import React, { useMemo } from 'react';
import Habit from '../Habit/Habit';
import { useMaster } from '../../state/MasterContext';

import {
  normalizeHabits,
  lastNDays,
  parseYmdToLocalDate,
  isHabitScheduledOnDate,
  getDoneForDate,
  toggleDoneForDate,
} from '../../utils/habitsLocal';

export default function HabitTracker() {
  const { master, actions } = useMaster();

  const habits = useMemo(() => normalizeHabits(master?.habits?.list || []), [master]);
  const records = master?.habits?.records || [];
  const dates = useMemo(() => lastNDays(7), []);

  const toggleForDate = (habitId, dateStr) => {
    actions.updateMaster(prev => {
      const prevRecords = prev?.habits?.records || [];
      const { next } = toggleDoneForDate(prevRecords, dateStr, habitId);

      return {
        ...prev,
        habits: {
          ...prev.habits,
          records: next,
        },
      };
    });
  };

  const historyFor = (habitId) => {
    return dates.map(dateStr => ({
      date: dateStr,
      done: getDoneForDate(records, dateStr, habitId),
    }));
  };

  return (
    <div>
      {habits.length === 0 ? (
        <div className="cfg-empty">No habits configured. Add them in Config → Habits.</div>
      ) : (
        habits.map(h => (
          <Habit
            key={h.id}
            habitKey={h.id}
            label={h.label}
            history={historyFor(h.id)}
            onToggleDate={(dateStr) => toggleForDate(h.id, dateStr)}
            // If your Habit component expects extra props, keep them here
          />
        ))
      )}

      {/* NOTE: Monthly view is now its own dashboard widget, so it doesn't need to be embedded here */}
    </div>
  );
}
