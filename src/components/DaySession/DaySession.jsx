// src/components/DaySession.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WalkReminder from '../WalkReminder/WalkReminder';
import apiRequest from '../../utils/apiRequest';
import './daysession.css';

// Toggle this for testing vs production:
const REMINDER_MS = 60 * 60 * 1000;      // 1 minute for testing
// const REMINDER_MS = 60 * 60 * 1000; // 1 hour for production

function computeNextReminderDate(startDate, from = new Date()) {
  const elapsed = from - startDate;
  if (elapsed < 0) return new Date(startDate);
  const k = Math.floor(elapsed / REMINDER_MS) + 1;
  return new Date(startDate.getTime() + k * REMINDER_MS);
}

const DaySession = () => {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState(null); // <-- NEW: show minutes after end

  const firstTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (firstTimeoutRef.current) {
      clearTimeout(firstTimeoutRef.current);
      firstTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const scheduleReminders = useCallback((start) => {
    clearTimers();
    if (!start) return;
    const next = computeNextReminderDate(start, new Date());
    const delay = Math.max(0, next - new Date());

    firstTimeoutRef.current = setTimeout(() => {
      setShowModal(true);
      intervalRef.current = setInterval(() => setShowModal(true), REMINDER_MS);
    }, delay);
  }, [clearTimers]);

  // Load today's session on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const entry = await apiRequest('/daysession/today', 'GET');
        if (!mounted) return;
        if (entry && entry.startTimestamp && !entry.endTimestamp) {
          setActive(true);
          const s = new Date(entry.startTimestamp);
          setStartDate(s);
          scheduleReminders(s);
        } else {
          setActive(false);
          setStartDate(null);
          clearTimers();
        }
      } catch {
        setActive(false);
        setStartDate(null);
        clearTimers();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; clearTimers(); };
  }, [scheduleReminders, clearTimers]);

  const onStart = useCallback(async () => {
    const entry = await apiRequest('/daysession/start', 'POST');
    const s = new Date(entry.startTimestamp);
    setActive(true);
    setStartDate(s);
    setSummary(null); // clear any previous summary
    scheduleReminders(s);
  }, [scheduleReminders]);

  const onEnd = useCallback(async () => {
    // The /end route returns the updated session including totalWalkMinutes
    const entry = await apiRequest('/daysession/end', 'POST');
    setActive(false);
    setStartDate(null);
    setShowModal(false);
    clearTimers();

    // Show summary: total minutes walked today
    if (entry && typeof entry.totalWalkMinutes === 'number') {
      setSummary({
        totalWalkMinutes: entry.totalWalkMinutes,
        totalDayMs: entry.totalDayMs ?? null,
      });
    } else {
      setSummary({ totalWalkMinutes: 0, totalDayMs: null });
    }
  }, [clearTimers]);

  const onCompleteWalk = useCallback(async (minutes) => {
    await apiRequest('/daysession/walk', 'POST', { minutes });
    setShowModal(false);
  }, []);

  const label = useMemo(() => (active ? 'End Day' : 'Start Day'), [active]);

  // Helper to format totalDayMs (optional)
  const formatDuration = (ms) => {
    if (!ms && ms !== 0) return null;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div className="day-session">
      <button
        className={`day-session-btn ${active ? 'end' : 'start'}`}
        disabled={loading}
        onClick={active ? onEnd : onStart}
      >
        {label}
      </button>

      {/* NEW: show summary after ending the day */}
      {summary && !active && (
        <div style={{ marginTop: 10, color: '#aaa' }}>
          <div><strong>Walked:</strong> {summary.totalWalkMinutes} min</div>
          {summary.totalDayMs != null && (
            <div><strong>Day Length:</strong> {formatDuration(summary.totalDayMs)}</div>
          )}
        </div>
      )}

      <WalkReminder
        open={showModal && active}
        onClose={() => setShowModal(false)}
        onComplete={onCompleteWalk}
      />
    </div>
  );
};

export default DaySession;
