import React, { useEffect, useMemo, useState } from 'react';
import { IoScaleSharp, IoEyeSharp, IoEyeOffSharp } from 'react-icons/io5';
import { useMaster } from '../../state/MasterContext';
import { formatTimeAgo, getLatestEntry } from '../../utils/weightLocal';

const ShowWeight = ({ onClick }) => {
  const { master } = useMaster();
  const entries = master?.weight?.entries || [];

  const latest = useMemo(() => getLatestEntry(entries), [entries]);

  const [timeAgo, setTimeAgo] = useState('');
  const [showWeight, setShowWeight] = useState(true);

  useEffect(() => {
    if (!latest?.ts) return;

    const update = () => setTimeAgo(formatTimeAgo(latest.ts));
    update();

    const interval = setInterval(update, 60 * 1000);
    return () => clearInterval(interval);
  }, [latest?.ts]);

  return (
    <div className="weight-card glass-card">
      {latest ? (
        <>
          <div className="weight-card-top">
            <span className="weight-card-weight">
              {showWeight ? latest.kg : '**'}
            </span>
            <span className="weight-card-unit">kg</span>
            <button onClick={() => setShowWeight(!showWeight)} type="button">
              {showWeight ? <IoEyeOffSharp /> : <IoEyeSharp />}
            </button>
          </div>

          <div className="weight-card-label">Body weight</div>
          <div className="weight-card-time">{timeAgo}</div>

          <button onClick={onClick} type="button">
            <IoScaleSharp /> Log Weight
          </button>
        </>
      ) : (
        <>
          <div style={{ opacity: 0.8, marginBottom: 8 }}>No weigh-ins yet</div>
          <button onClick={onClick} type="button">
            <IoScaleSharp /> Log First Weight
          </button>
        </>
      )}
    </div>
  );
};

export default ShowWeight;
