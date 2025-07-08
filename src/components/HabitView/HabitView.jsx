import React, { useEffect, useState } from 'react';
import './habitview.css';
import apiRequest from '../../utils/apiRequest';

const HabitView = () => {
  const [habitData, setHabitData] = useState([]);
  const [habitKeys, setHabitKeys] = useState([]);

  useEffect(() => {
    const loadHabits = async () => {
      const data = await apiRequest('/habits/weekly');
      setHabitData(data);

      if (data.length > 0) {
        const keys = Object.keys(data[0].habits);
        setHabitKeys(keys);
      }
    };

    loadHabits();
  }, []);

  return (
    <div className="habit-row">
      <div className="habit-label">
        <span className="habit-icon">🧩</span>
        <span>Overall</span>
      </div>
      <div className="habit-days">
        {habitData.map(({ date, habits }) => {
          const completedCount = Object.values(habits).filter(Boolean).length;
          const total = habitKeys.length || 1;
          const backgroundOpacity = completedCount / total;

          return (
            <div
              key={date}
              className="day-box"
              title={`${date}: ${completedCount}/${total} habits done`}
              style={{
                backgroundColor: `rgba(76, 175, 80, ${backgroundOpacity})`,
              }}
            >
              {new Date(date).toLocaleDateString('en-GB', { weekday: 'short' })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitView;
