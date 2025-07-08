import React, { useEffect, useState } from 'react';
import './calendar.css';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // New error state

  const fetchEvents = () => {
    setLoading(true);
    setError(false); // Reset error on new fetch
    fetch('http://localhost:3001/calendar/today')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error('Invalid event data format:', data);
          setEvents([]);
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load events :( :', err);
        setEvents([]);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30 * 60 * 1000); // every 30 minutes
    return () => clearInterval(interval);
  }, []);

  const isAllDay = (event) => !event.start.includes('T') && !event.end.includes('T');
  const isNow = (start, end, isAllDayEvent) => {
    if (isAllDayEvent) return false;
    const now = new Date();
    return new Date(start) <= now && now <= new Date(end);
  };
  const isPast = (end) => new Date(end) < new Date();

  return (
    <div className="calendar glass-card">
      {loading ? (
        <p className="card-subtle">Loading events...</p>
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
