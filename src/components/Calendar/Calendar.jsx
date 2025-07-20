import React, { useEffect, useState } from 'react';
import './calendar.css';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reauthNeeded, setReauthNeeded] = useState(false); // NEW

  const getProgressPercentage = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now < startTime || now > endTime) return 0;

    const duration = endTime - startTime;
    const elapsed = now - startTime;
    return Math.min(100, Math.max(0, (elapsed / duration) * 100));
  };


  const fetchEvents = async () => {
    setLoading(true);
    setError(false);
    setReauthNeeded(false);

    try {
      const res = await fetch('http://localhost:3001/calendar/today');
      const data = await res.json();

      if (res.status === 401 && data.error === 'expired_token') {
        setReauthNeeded(true);
        setEvents([]);
        return;
      }

      if (!Array.isArray(data)) {
        console.error('Invalid event data format:', data);
        setEvents([]);
        setError(true);
      } else {
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setEvents([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isAllDay = (event) => !event.start.includes('T') && !event.end.includes('T');
  const isNow = (start, end, isAllDayEvent) => {
    if (isAllDayEvent) return false;
    const now = new Date();
    return new Date(start) <= now && now <= new Date(end);
  };
  const isPast = (end) => new Date(end) < new Date();

  useEffect(() => {
  const interval = setInterval(() => {
    setEvents((prev) => [...prev]); // triggers re-render to update progress bars
  }, 60 * 1000); // every minute

  return () => clearInterval(interval);
}, []);


  return (
    <div className="calendar glass-card">
      {loading ? (
        <p className="card-subtle">Loading events...</p>
      ) : reauthNeeded ? (
        <div>
          <p className="card-subtle">Your Google Calendar session expired.</p>
          <a href="http://localhost:3001/calendar/login"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="google-reconnect-button">Reconnect to Google</button>
          </a>
        </div>
      ) : error ? (
        <p className="card-subtle">Could not get calendar</p>
      ) : events.length === 0 ? (
        <p className="card-subtle">Nothing scheduled today</p>
      ) : (
        <ul className="event-list">
          {events.map((event) => {
            const allDay = isAllDay(event);
            const past = isPast(event.end);
            const now = isNow(event.start, event.end, allDay);
            const itemClass = `event-item ${past ? 'past-event' : ''} ${now ? 'current-event' : ''}`;

            return (
              <li key={event.id} className={itemClass}>
                {now && !allDay && (
                  // <div className="event-progress">
                    <div
                      className="event-progress-bar"
                      style={{ width: `${getProgressPercentage(event.start, event.end)}%` }}
                    />
                  // </div>
                )}
                <strong>{event.summary}</strong>
                {!allDay && (
                  <div className="event-time">
                    {formatTime(event.start)} – {formatTime(event.end)}
                  </div>
                )}

                
              </li>

            );
          })}
        </ul>
      )}
      <button onClick={fetchEvents}>Refresh</button>
    </div>
  );
}

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default Calendar;
