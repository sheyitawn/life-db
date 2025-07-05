import React, { useEffect, useState } from 'react';
import './weightchart.css';
import apiRequest from '../../utils/apiRequest';
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  YAxis,
} from 'recharts';

const WeightChart = () => {
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await apiRequest('/weighin');
      const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
      setDataPoints(sorted);
    };
    loadData();
  }, []);

  return (
    <div className="weight-chart">
      <h3>📈 Weight Tracker</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dataPoints} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#4caf50"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Weight (kg)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
