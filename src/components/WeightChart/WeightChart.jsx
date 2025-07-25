
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import apiRequest from "../../utils/apiRequest";
import "./weightchart.css";
import add from 'date-fns/add';
import format from 'date-fns/format';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

// Format timestamps to "dd/MMM" like "25/Jul"
const dateFormatter = (timestamp) => format(new Date(timestamp), "dd/MMM");

// Create evenly spaced ticks between startDate and endDate
const getTicks = (startDate, endDate, numTicks) => {
  const diffDays = differenceInCalendarDays(endDate, startDate);
  const ticks = [];
  for (let i = 0; i < numTicks; i++) {
    const dayOffset = Math.round((diffDays / (numTicks - 1)) * i);
    ticks.push(add(startDate, { days: dayOffset }).getTime());
  }
  return ticks;
};

const WeightChart = () => {
  const [weights, setWeights] = useState([]);
  // Special points as timestamps
  const specialPoints = [
    { date: new Date(2025, 6, 18).getTime(), weight: 101 }, // July 25, 2018
    { date: new Date(2025, 10, 10).getTime(), weight: 85 },  // Nov 10, 2025
  ];

  useEffect(() => {
    async function fetchWeights() {
      const data = await apiRequest("/weighin");

      // Normalize API dates to timestamps:
      const normalized = data
        .map(({ date, weight }) => {
          // Parse date string into Date object; adjust format if needed here
          // [Unverified] Assuming ISO or parseable format
          const parsedDate = new Date(date);
          return { date: parsedDate.getTime(), weight };
        })
        .sort((a, b) => a.date - b.date);

      setWeights(normalized);
    }

    fetchWeights();
  }, []);

  // Determine date range for ticks (earliest and latest date between data and special points)
  const allDates = [...weights.map(d => d.date), ...specialPoints.map(d => d.date)];
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const ticks = getTicks(minDate, maxDate, 6); // 6 ticks on x-axis

  return (
    <div className="weight-chart">
      <h3>📈 Weight Tracker</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            domain={[minDate.getTime(), maxDate.getTime()]}
            ticks={ticks}
            scale="time"
            type="number"
            tickFormatter={dateFormatter}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip labelFormatter={(val) => dateFormatter(val)} />
          <Legend verticalAlign="top" height={36} />

          {/* Original weights line */}
          <Line
            type="monotone"
            data={weights}
            dataKey="weight"
            stroke="#4caf50"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Weight (kg)"
            connectNulls={false}
          />

          {/* Special points line with isolated points */}
          <Line
            type="monotone"
            data={specialPoints}
            dataKey="weight"
            stroke="#ff5722"
            strokeWidth={3}
            dot={{ r: 6 }}
            name="Special Points"
            isAnimationActive={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
