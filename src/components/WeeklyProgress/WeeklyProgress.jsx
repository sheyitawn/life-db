import React, { useEffect, useState } from 'react';
import './weeklyprogress.css';
import apiRequest from '../../utils/apiRequest';
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const WeeklyProgress = () => {
  const [data, setData] = useState([]);
  const [habitKeys, setHabitKeys] = useState([]);

  useEffect(() => {
    apiRequest('/habits/weekly')
      .then((weekData) => {
        const transformed = weekData.map(entry => {
          const habitsNumeric = {};
          for (const key in entry.habits) {
            habitsNumeric[key] = entry.habits[key] ? 1 : 0;
          }
          return { day: entry.date, ...habitsNumeric };
        });

        const keys = Object.keys(transformed[0] || {}).filter(k => k !== 'day');
        setHabitKeys(keys);
        setData(transformed);
      })
      .catch((err) => console.error('Failed to fetch habits', err));
  }, []); // Empty dependency array ensures this runs only once

  const getDayLabel = (isoDate) => {
    const d = new Date(isoDate);
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
  };

  return (
    <div className="weekly-card">


      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tickFormatter={getDayLabel} />
          {/* <Tooltip /> */}
          <Legend />
          {habitKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={['#2989f7', '#01da30', '#b14101', '#ff6600', '#00aaff'][i % 5]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyProgress;
