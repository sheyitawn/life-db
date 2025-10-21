import React, { useEffect, useState } from 'react';
import Habit from '../Habit/Habit'; // Adjust the path as needed
import apiRequest from '../../utils/apiRequest';
import HabitMonthView from '../HabitView/HabitMonthView';

const HABIT_ICONS = {
  steps_5000: '🚶‍♂️',
  track_meals: '⚖️',
};

const HabitTracker = () => {
  const [habitData, setHabitData] = useState([]);
  const [habitKeys, setHabitKeys] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await apiRequest('/habits/weekly');
      setHabitData(data);

      if (data.length > 0) {
        const keys = Object.keys(data[0].habits);
        setHabitKeys(keys);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '1rem', background: '#121212', minHeight: '100vh', color: 'white' }}>
                  <HabitMonthView />
      
      <h2 style={{ marginBottom: '1rem' }}>📅 Weekly Habit Tracker</h2>
      {habitKeys.map((key) => (
        <Habit
          key={key}
          habitKey={key}
          label={key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          icon={HABIT_ICONS[key] || '✅'}
          history={habitData.map((entry) => ({
            date: entry.date,
            done: entry.habits[key] || false,
          }))}
        />
      ))}
    </div>
  );
};

export default HabitTracker;
