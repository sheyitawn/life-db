import React, { useEffect, useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import './fast.css';

const Fast = () => {
  const [fast, setFast] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await apiRequest('/fasting');
      setFast(res);
    };
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (fast?.active) {
        const end = new Date(fast.end);
        const now = new Date();
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft('Fast complete!');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [fast]);

  return (
    <div className="fast">
      <h3>🍽️ Fasting Status</h3>
      {fast?.active ? (
        <>
          <p>Fasting... Time left: <strong>{timeLeft}</strong></p>
        </>
      ) : (
        <p>You should aim for a 20 hour fast today.</p>
      )}
    </div>
  );
};

export default Fast;
