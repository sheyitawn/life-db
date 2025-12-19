import React, { useMemo, useState } from 'react';
import './habitview.css';

import { useMaster } from '../../state/MasterContext';
import {
  ymdLocal,
  getDaysInMonth,
  normalizeHabits,
  parseYmdToLocalDate,
  isHabitScheduledOnDate,
  getDoneForDate,
} from '../../utils/habitsLocal';

const HabitMonthView = ({ onClick, initialDate = new Date() }) => {
  const { master } = useMaster();
  const [viewDate, setViewDate] = useState(initialDate);

  const habits = useMemo(() => normalizeHabits(master?.habits?.list || []), [master]);
  const records = master?.habits?.records || [];

  const year = viewDate.getFullYear();
  const monthIndex = viewDate.getMonth();
  const monthDays = useMemo(() => getDaysInMonth(year, monthIndex), [year, monthIndex]);

  const monthLabel = new Date(year, monthIndex, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  // Sunday-first calendar math
  const firstOfMonth = new Date(year, monthIndex, 1);
  const leading = firstOfMonth.getDay(); // 0=Sun..6=Sat
  const totalCells = leading + monthDays.length;
  const trailing = (7 - (totalCells % 7)) % 7;

  const cells = useMemo(() => {
    const arr = [];

    for (let i = 0; i < leading; i++) arr.push({ type: 'pad', key: `pad-start-${i}` });

    for (const d of monthDays) {
      const dateStr = ymdLocal(d);
      const scheduled = habits.filter(h => isHabitScheduledOnDate(h, d));
      const total = scheduled.length || 1;
      const done = scheduled.filter(h => getDoneForDate(records, dateStr, h.id)).length;
      const opacity = done / total;

      arr.push({
        type: 'day',
        key: dateStr,
        date: new Date(d),
        dateStr,
        done,
        total,
        opacity,
      });
    }

    for (let i = 0; i < trailing; i++) arr.push({ type: 'pad', key: `pad-end-${i}` });

    return arr;
  }, [monthDays, habits, records, leading, trailing]);

  const goPrev = () => setViewDate(new Date(year, monthIndex - 1, 1));
  const goNext = () => setViewDate(new Date(year, monthIndex + 1, 1));
  const goToday = () => setViewDate(new Date());

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = ymdLocal(new Date());

  return (
    <div className="habit-month">
      <div className="habit-row">
        <h4>MONTHLY PROGRESS</h4>

        <div className="habit-label" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <button onClick={goPrev} title="Previous month">‹ Prev</button>
            <div>{monthLabel}</div>
            <button onClick={goNext} title="Next month">Next ›</button>
            <button onClick={goToday} title="Current month">Today</button>
          </div>
        </div>

        <div className="calendar-header">
          {WEEKDAYS.map(d => (
            <div key={d} className="calendar-header-cell">{d}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map(cell => {
            if (cell.type === 'pad') {
              return <div key={cell.key} className="calendar-cell empty" aria-hidden="true" />;
            }
            const isToday = cell.dateStr === todayStr;
            return (
              <div
                key={cell.key}
                className={`calendar-cell ${isToday ? 'today' : ''}`}
                title={`${cell.dateStr}: ${cell.done}/${cell.total} habits done`}
                onClick={onClick}
                style={{ backgroundColor: `rgba(76, 175, 80, ${cell.opacity})` }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' ? onClick?.() : null)}
              >
                <span className="calendar-daynum">{cell.date.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HabitMonthView;
