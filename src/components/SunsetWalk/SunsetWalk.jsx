import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { TbSunset2 } from "react-icons/tb";
import Modal from '../Modal/Modal'; // ← use your Modal
import './sunsetwalk.css';

/**
 * Recommends a walk time 2 hours (120 min) before sunset.
 * Uses OpenWeather current weather endpoint (sys.sunset).
 * Resets daily shortly after midnight.
 *
 * Props (optional):
 * - city: override city (string)
 * - apiKey: override API key (string)
 * - offsetMinutes: minutes before sunset (number, default 120)
 */
const SunsetWalk = ({ city, apiKey, offsetMinutes = 120 }) => {
  const [sunset, setSunset] = useState(null);           // Date
  const [recommendAt, setRecommendAt] = useState(null); // Date
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);              // ← controls Modal

  const tickRef = useRef(null);
  const midnightTimerRef = useRef(null);

  const effectiveCity = city || process.env.REACT_APP_WEATHER_LOC;
  const effectiveKey  = apiKey || process.env.REACT_APP_WEATHER_API;

  const hhmm = (d) =>
    d?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '--:--';

  const countdown = useMemo(() => {
    if (!recommendAt) return null;
    const now = new Date();
    const diff = recommendAt - now;
    if (diff <= 0) return 'Now';
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`;
  }, [recommendAt, sunset]); // eslint-disable-line

  const fetchSunset = async () => {
    setError(null);
    try {
      if (!effectiveKey || !effectiveCity) {
        setError('Missing weather API key or city.');
        setSunset(null);
        setRecommendAt(null);
        return;
      }
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        effectiveCity
      )}&appid=${effectiveKey}&units=metric`;

      const res = await axios.get(url);
      const sunsetUnix = res?.data?.sys?.sunset; // seconds UTC
      if (!sunsetUnix) {
        setError('Sunset time not available.');
        setSunset(null);
        setRecommendAt(null);
        return;
      }
      const sunsetDate = new Date(sunsetUnix * 1000); // local time
      const rec = new Date(sunsetDate.getTime() - (offsetMinutes * 60000)); // 2h default
      setSunset(sunsetDate);
      setRecommendAt(rec);
    } catch {
      setError('Failed to fetch sunset.');
      setSunset(null);
      setRecommendAt(null);
    }
  };

  const scheduleMidnightRefresh = () => {
    if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
    const now = new Date();
    const tomorrow005 = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 5, 0, 0
    );
    const delay = Math.max(1, tomorrow005 - now);
    midnightTimerRef.current = setTimeout(() => {
      fetchSunset();
      scheduleMidnightRefresh();
    }, delay);
  };

  useEffect(() => {
    fetchSunset();
    scheduleMidnightRefresh();
    // re-render periodically to keep countdown fresh
    tickRef.current = setInterval(() => {
      setSunset(s => (s ? new Date(s) : s));
    }, 15000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCity, effectiveKey, offsetMinutes]);

  const now = new Date();
  const recommendPassed = recommendAt && now > recommendAt;

  return (
    <div className="sunset-walk">
      <div className="sunset-walk__title"><TbSunset2 /> Sunset Walk</div>

      {error ? (
        <div className="sunset-walk__error">⚠ {error}</div>
      ) : (
        <>
          {/* Short descriptor ON CARD */}
          <div className="sunset-walk__descriptor">
            {recommendAt
              ? <>Recommended walk time: <b>{hhmm(recommendAt)}</b> (2h before sunset).</>
              : <>Fetching today’s sunset…</>
            }
          </div>

          <div className="sunset-walk__actions">
            <button className="sunset-walk__btn" onClick={() => setOpen(true)}>
              Details
            </button>
          </div>

          {/* DETAILS IN MODAL */}
          <Modal isOpen={open} onClose={() => setOpen(false)}>
            <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TbSunset2 /> Sunset Walk — Details
              </h3>

              <div className="sunset-walk__row">
                <span>Sunset</span>
                <strong>{sunset ? hhmm(sunset) : '--:--'}</strong>
              </div>

              <div className="sunset-walk__row">
                <span>Recommended Start (−2h)</span>
                <strong>{recommendAt ? hhmm(recommendAt) : '--:--'}</strong>
              </div>

              <div className="sunset-walk__row">
                <span>Countdown</span>
                <strong>{recommendAt ? countdown : '--'}</strong>
              </div>

              <p style={{ marginTop: 14 }}>
                The sun sets at <b>{sunset ? hhmm(sunset) : '--:--'}</b>, so aim to start your walk by <b>{recommendAt ? hhmm(recommendAt) : '--:--'}</b>.
              </p>

              {recommendPassed && (
                <div className="sunset-walk__note">
                  Recommended time has passed. You can still go now, and this will refresh for tomorrow after midnight.
                </div>
              )}
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default SunsetWalk;
