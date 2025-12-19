import React, { useMemo } from 'react';
import './habitview.css';
import { useMaster } from '../../state/MasterContext';
import {
  normalizeHabits,
  lastNDays,
  parseYmdToLocalDate,
  isHabitScheduledOnDate,
  getDoneForDate,
} from '../../utils/habitsLocal';

const HabitView = ({ onClick }) => {
  const { master } = useMaster();

  const habits = useMemo(() => normalizeHabits(master?.habits?.list || []), [master]);
  const records = master?.habits?.records || [];
  const dates = useMemo(() => lastNDays(7), []);

  const perDay = useMemo(() => {
    return dates.map(dateStr => {
      const dObj = parseYmdToLocalDate(dateStr);
      const scheduled = habits.filter(h => isHabitScheduledOnDate(h, dObj));
      const total = scheduled.length || 1;
      const done = scheduled.filter(h => getDoneForDate(records, dateStr, h.id)).length;
      return { dateStr, done, total };
    });
  }, [dates, habits, records]);

  return (
    <div className="habit-row">
      {/* <div className="habit-label">
        <h4>WEEKLY PROGRESS</h4>
      </div> */}

      <div className="habit-days">
        {perDay.map(({ dateStr, done, total }) => {
          const opacity = total ? done / total : 0;
          return (
            <div
              key={dateStr}
              className="day-box"
              title={`${dateStr}: ${done}/${total} habits done`}
              onClick={onClick}
              style={{ backgroundColor: `rgba(76, 175, 80, ${opacity})` }}
            >
              {new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short' })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitView;
