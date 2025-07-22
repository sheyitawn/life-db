import React, { useEffect, useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import './habit.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Habit = ({ habitKey, label, icon }) => {
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const data = await apiRequest('/habits/weekly');
    setWeeklyData(data);
  };

  const toggleHabit = async (date) => {
    try {
      await apiRequest('/habits/toggle', 'POST', { date, habitKey });
      // Refresh local state
      setWeeklyData((prev) =>
        prev.map((entry) =>
          entry.date === date
            ? {
                ...entry,
                habits: {
                  ...entry.habits,
                  [habitKey]: !entry.habits[habitKey],
                },
              }
            : entry
        )
      );
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const getDayCircle = (entry) => {
    const day = new Date(entry.date).getDay();
    const completed = entry.habits[habitKey];

    return (
      <div
        key={entry.date}
        className={`habit-day ${completed ? 'completed' : 'missed'}`}
        title={daysOfWeek[day]}
        onClick={() => toggleHabit(entry.date)}
        style={{ cursor: 'pointer' }}
      >
        {new Date(entry.date).getDate()}
      </div>
    );
  };

  return (
    <div className="habit-card">
      <div className="habit-header">
        <div className="habit-title">{label}</div>
        {icon && <div className="habit-icon">{icon}</div>}
      </div>
      <div className="habit-subtitle">Every day</div>
      <div className="habit-days">
        {weeklyData.map((entry) => getDayCircle(entry))}
      </div>
    </div>
  );
};

export default Habit;
