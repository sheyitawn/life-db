import React, { useEffect, useState } from 'react';
import { IoScaleSharp } from 'react-icons/io5';
import { IoEyeSharp, IoEyeOffSharp } from 'react-icons/io5';

const ShowWeight = ({ onClick }) => {
  const [weightData, setWeightData] = useState(null);
  const [timeAgo, setTimeAgo] = useState('');
  const [showWeight, setShowWeight] = useState(true);

  useEffect(() => {
    const fetchWeight = async () => {
      try {
        const res = await fetch('http://localhost:3001/weighin/latest');
        const data = await res.json();
        setWeightData(data);
      } catch (err) {
        console.error('Failed to fetch latest weight:', err);
      }
    };

    fetchWeight();
  }, []);

  // ⏳ Update timeAgo every minute
  useEffect(() => {
    if (!weightData?.date) return;

    const updateTimeAgo = () => {
      const timestamp = new Date(weightData.date).getTime();
      const now = new Date().getTime();
      const diffMs = now - timestamp;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      let result = '';
      if (diffMinutes < 1) {
        result = 'just now';
      } else if (diffMinutes < 60) {
        result = `${diffMinutes} min ago`;
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        result = `${hours}h ${mins}m ago`;
      }

      setTimeAgo(result);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60 * 1000); // every minute

    return () => clearInterval(interval);
  }, [weightData]);

  return (
    <div className="weight-card glass-card">
      {weightData ? (
        <>
          <div className="weight-card-top">
            <span className="weight-card-weight">
              {showWeight ? weightData.weight : '**'}
            </span>
            <span className="weight-card-unit">kg</span>
            <button onClick={() => setShowWeight(!showWeight)}>
              {showWeight ? <IoEyeOffSharp /> : <IoEyeSharp />}
            </button>
          </div>
          <div className="weight-card-label">Body weight</div>
          <div className="weight-card-time">{timeAgo}</div>
          <button onClick={onClick}><IoScaleSharp /> Log Weight</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ShowWeight;
