// src/components/HabitTracker/Habit/Habit.jsx
import React, { useMemo } from 'react';
import './habit.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Habit({ habitKey, label, history, onToggleDate }) {
  const safeHistory = useMemo(() => (Array.isArray(history) ? history : []), [history]);

  const getDayCircle = (entry) => {
    const day = new Date(entry.date).getDay();
    const completed = !!entry.done;

    return (
      <div
        key={entry.date}
        className={`habit-day ${completed ? 'completed' : 'missed'}`}
        title={daysOfWeek[day]}
        onClick={() => onToggleDate?.(entry.date)}
        style={{ cursor: 'pointer' }}
      >
        {new Date(entry.date).getDate()}
      </div>
    );
  };

  return (
    <div className="habit">
      <div className="habit-header">
        <div className="habit-title">{label}</div>
        <div className="habit-key">{habitKey}</div>
      </div>

      <div className="habit-days">
        {safeHistory.map(getDayCircle)}
      </div>
    </div>
  );
}
