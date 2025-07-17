import React, { useEffect, useState } from 'react';
import './Daily.css';
import { FaPen } from 'react-icons/fa';
import apiRequest from '../../utils/apiRequest';

function Daily() {
  const [habits, setHabits] = useState({});
  
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const data = await apiRequest('/habits');
        setHabits(data.habits); // ✅ FIX: data.habits already contains the habit object
        setLoading(false);
      } catch (error) {
        console.error('Failed to load habits:', error);
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  const completedCount = Object.values(habits).filter(Boolean).length;
  const habitKeys = Object.keys(habits);
  const progress = habitKeys.length
    ? Math.round((completedCount / habitKeys.length) * 100)
    : 0;

  const toggleHabit = async (habitKey) => {
    try {
      const response = await apiRequest('/habits/toggle', 'POST', {
        date: today,
        habitKey,
      });
      setHabits(response.habits); // ✅ FIX: no double `.habits.habits`
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  return (
    <div className="daily-card">
      <div className="daily-header">
        <h4>daily</h4>
        <div className="daily-header-icons">
          <div
            className="daily-progress-circle"
            style={{ '--value': progress }}
          >
            <div className="daily-progress-circle_center">
              <span>{progress}%</span>
            </div>
          </div>

          {/* <button className="daily-edit">
            <FaPen size={12} />
          </button> */}
        </div>
      </div>

      {loading ? (
        <p className="card-subtle">Loading habits...</p>
      ) : (
        <ul className="daily-goals">
          {Object.entries(habits).map(([key, completed]) => (
            <li key={key} className={`goal-item ${completed ? 'done' : ''}`}>
              <input
                type="checkbox"
                checked={completed}
                onChange={() => toggleHabit(key)}
              />
              <span>{key}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Daily;
