import React, { useEffect, useMemo, useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import './habitview.css';

/* Local YYYY-MM-DD (avoid UTC drift) */
const ymdLocal = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/* All Date objects for a month (0-based monthIndex) */
function getDaysInMonth(year, monthIndex) {
  const days = [];
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

const HabitMonthView = ({ onClick, initialDate = new Date() }) => {
  const [viewDate, setViewDate] = useState(initialDate);
  const [habitData, setHabitData] = useState([]); // [{ date, habits }, ...]
  const [habitKeys, setHabitKeys] = useState([]); // union of keys seen this month

  const year = viewDate.getFullYear();
  const monthIndex = viewDate.getMonth();
  const monthDays = useMemo(() => getDaysInMonth(year, monthIndex), [year, monthIndex]);

  useEffect(() => {
    (async () => {
      const y = year;
      const m = String(monthIndex + 1).padStart(2, '0');
      const data = await apiRequest(`/habits/monthly?year=${y}&month=${m}`, 'GET');
      const arr = Array.isArray(data) ? data : [];
      setHabitData(arr);

      const keysSet = new Set();
      for (const row of arr) {
        if (row?.habits && typeof row.habits === 'object') {
          Object.keys(row.habits).forEach(k => keysSet.add(k));
        }
      }
      setHabitKeys([...keysSet]);
    })();
  }, [year, monthIndex]);

  // Index by local date string for quick lookup
  const byDate = useMemo(() => {
    const map = new Map();
    for (const row of habitData) {
      if (row?.date) map.set(row.date, row);
    }
    return map;
  }, [habitData]);

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

    // leading pads
    for (let i = 0; i < leading; i++) arr.push({ type: 'pad', key: `pad-start-${i}` });

    // month days
    for (const d of monthDays) {
      const dateStr = ymdLocal(d);
      const row = byDate.get(dateStr);
      const habits = row?.habits || {};
      const total = habitKeys.length || Object.keys(habits).length || 1;
      const completed = total ? Object.values(habits).filter(Boolean).length : 0;
      const opacity = completed / total;

      arr.push({
        type: 'day',
        key: dateStr,
        date: d,
        dateStr,
        completed,
        total,
        opacity,
      });
    }

    // trailing pads
    for (let i = 0; i < trailing; i++) arr.push({ type: 'pad', key: `pad-end-${i}` });

    return arr;
  }, [monthDays, byDate, habitKeys, leading, trailing]);

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

        {/* Calendar header (Sun–Sat) */}
        <div className="calendar-header">
          {WEEKDAYS.map(d => (
            <div key={d} className="calendar-header-cell">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
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
                title={`${cell.dateStr}: ${cell.completed}/${cell.total} habits done`}
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
