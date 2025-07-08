import React, { useEffect, useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import './fastview.css';

const FastView = () => {
  const [duration, setDuration] = useState(20);
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [fast, setFast] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await apiRequest('/fasting');
      setFast(res);
    };
    load();
  }, []);

  const startFast = async () => {
    const start = new Date(startTime).toISOString();
    const response = await apiRequest('/fasting/start', 'POST', {
      start,
      duration: parseInt(duration),
    });
    setFast(response.fast);
  };

  const stopFast = async () => {
    const response = await apiRequest('/fasting/stop', 'POST');
    setFast(response.fast);
  };

  return (
    <div className="fastview">
      <h3>⏳ Fasting Tracker</h3>

      {fast?.active ? (
        <div className="fastview-info">
          <p>Fast started at: <strong>{new Date(fast.start).toLocaleString()}</strong></p>
          <p>Duration: <strong>{fast.duration} hours</strong></p>
          <p>Ends at: <strong>{new Date(fast.end).toLocaleString()}</strong></p>
          <button className="stop-btn" onClick={stopFast}>Stop Fast</button>
        </div>
      ) : (
        <div className="fastview-form">
          <label>
            Duration:
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value={12}>12 Hours</option>
              <option value={14}>14 Hours</option>
              <option value={16}>16 Hours</option>
              <option value={18}>18 Hours</option>
              <option value={20}>20 Hours</option>
              <option value={24}>24 Hours</option>
              <option value={36}>36 Hours</option>
            </select>
          </label>

          <label>
            Start Time:
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>

          <button className="start-btn" onClick={startFast}>Start Fast</button>
        </div>
      )}
    </div>
  );
};

export default FastView;
