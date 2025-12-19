import React, { useMemo } from "react";
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

import "./weightchart.css";
import add from 'date-fns/add';
import format from 'date-fns/format';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

import { useMaster } from "../../state/MasterContext";

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
  const { master } = useMaster();
  const entries = master?.weight?.entries || [];
  const mode = master?.weight?.mode || { enabled: false, startKg: null, goalKg: null };

  const weights = useMemo(() => {
    return (Array.isArray(entries) ? entries : [])
      .map(e => ({ date: new Date(e.ts).getTime(), weight: e.kg }))
      .filter(d => Number.isFinite(d.date) && Number.isFinite(d.weight))
      .sort((a, b) => a.date - b.date);
  }, [entries]);

  const specialPoints = useMemo(() => {
    // Show start/goal only if weight loss mode is enabled and values exist
    if (!mode.enabled) return [];

    const pts = [];
    const now = new Date();

    if (typeof mode.startKg === 'number' && Number.isFinite(mode.startKg)) {
      // Use first weigh-in date if available, otherwise today
      const startDate = weights.length ? new Date(weights[0].date) : now;
      pts.push({ date: startDate.getTime(), weight: mode.startKg });
    }

    if (typeof mode.goalKg === 'number' && Number.isFinite(mode.goalKg)) {
      // Place goal at last weigh-in date if available, otherwise today
      const goalDate = weights.length ? new Date(weights[weights.length - 1].date) : now;
      pts.push({ date: goalDate.getTime(), weight: mode.goalKg });
    }

    return pts;
  }, [mode.enabled, mode.startKg, mode.goalKg, weights]);

  const allDates = useMemo(() => {
    const d = [];
    weights.forEach(x => d.push(x.date));
    specialPoints.forEach(x => d.push(x.date));
    return d;
  }, [weights, specialPoints]);

  if (weights.length === 0) {
    return (
      <div className="weight-chart">
        <h3>📈 Weight Tracker</h3>
        <div style={{ opacity: 0.7 }}>No data yet. Log a weigh-in to see your chart.</div>
      </div>
    );
  }

  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const ticks = getTicks(minDate, maxDate, 6);

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

          <Line
            type="monotone"
            data={weights}
            dataKey="weight"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Weight (kg)"
            connectNulls={false}
          />

          {specialPoints.length > 0 && (
            <Line
              type="monotone"
              data={specialPoints}
              dataKey="weight"
              strokeWidth={3}
              dot={{ r: 6 }}
              name="Start/Goal"
              isAnimationActive={false}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
