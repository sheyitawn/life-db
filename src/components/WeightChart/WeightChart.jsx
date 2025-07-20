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

    // 🔎 Find starting date when weight ≈ 101
    const startPoint = sorted.find(d => parseFloat(d.weight) === 101);
    const startDate = startPoint ? new Date(startPoint.date) : new Date(sorted[0]?.date || '2025-07-18');

    // 📈 Generate projection from the matching point
    const projection = [];
    let weight = 101;

    for (let i = 0; i < 15; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i * 7); // Weekly intervals
      projection.push({
        date: date.toISOString().split('T')[0],
        projectedWeight: parseFloat((weight - i).toFixed(1)),
      });
    }

    setProjectedData(projection);
  };

  loadData();
}, []);


const mergedData = projectedData.map(d => ({ ...d })); // Clone each object

dataPoints.forEach(actual => {
  const index = mergedData.findIndex(d => d.date === actual.date);
  if (index !== -1) {
    mergedData[index] = { ...mergedData[index], ...actual }; // Merge into a fresh object
  } else {
    mergedData.push({ ...actual }); // Clone to be safe
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
