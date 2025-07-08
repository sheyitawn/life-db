import React, { useEffect, useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import './habit.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Habit = ({ habitKey, label, icon }) => {
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const loadHabits = async () => {
      const data = await apiRequest('/habits/weekly');
      setWeeklyData(data);
    };
    loadHabits();
  }, []);

  const getDayCircle = (entry) => {
    const day = new Date(entry.date).getDay();
    const completed = entry.habits[habitKey];
    return (
      <div
        key={entry.date}
        className={`habit-day ${completed ? 'completed' : 'missed'}`}
        title={daysOfWeek[day]}
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
