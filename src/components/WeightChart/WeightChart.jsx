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
  const [projectedData, setProjectedData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await apiRequest('/weighin');
      const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
      setDataPoints(sorted);

      const today = sorted.length > 0 ? new Date(sorted[sorted.length - 1].date) : new Date();
      const projection = [];

      let weight = 101; // Starting projected weight
      for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i * 7); // 1-week intervals
        projection.push({
          date: date.toISOString().split('T')[0],
          projectedWeight: parseFloat((weight - i).toFixed(1)),
        });
      }

      setProjectedData(projection);
    };

    loadData();
  }, []);

  const mergedData = dataPoints.map(d => ({ ...d }));


  // Add projected weights to the merged data
  projectedData.forEach((proj) => {
    const existing = mergedData.find((d) => d.date === proj.date);
    if (existing) {
      existing.projectedWeight = proj.projectedWeight;
    } else {
      mergedData.push(proj);
    }
  });

  // Sort by date again
  const sortedMergedData = mergedData.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="weight-chart">
      <h3>📈 Weight Tracker</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sortedMergedData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
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
            name="Actual Weight (kg)"
          />
          <Line
            type="monotone"
            dataKey="projectedWeight"
            stroke="#2196f3"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            name="Projected Weight"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
