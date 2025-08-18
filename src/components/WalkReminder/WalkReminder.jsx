import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal/Modal';

const CHIME_MS = 9000;           // how long each chime plays (ms)
const RECHIME_MS = 10 * 60 * 1000; // 5 minutes between chimes

const WalkReminder = ({ open, onClose, onComplete }) => {
  const [minutes, setMinutes] = useState(5);

  const audioRef = useRef(null);      // current Audio instance
  const chimeStopRef = useRef(null);  // timeout id to stop current chime
  const rechimeRef = useRef(null);    // interval id for re-chimes

  // Stop & cleanup helper
  const stopSound = () => {
    if (chimeStopRef.current) {
      clearTimeout(chimeStopRef.current);
      chimeStopRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
      audioRef.current = null;
    }
  };

  // Play one short chime, auto-stop after CHIME_MS
  const playChime = () => {
    // safety: if a previous chime is still going, stop it first
    stopSound();

    const audio = new Audio('/reminder.mp3'); // ensure file exists in /public
    audio.loop = false;
    audioRef.current = audio;

    // Stop when sound ends naturally
    const onEnded = () => stopSound();
    audio.addEventListener('ended', onEnded);

    // Auto-stop after CHIME_MS even if file is long
    chimeStopRef.current = setTimeout(() => {
      audio.removeEventListener('ended', onEnded);
      stopSound();
    }, CHIME_MS);

    audio.play().catch(() => {
      // Autoplay might be blocked until user interacts with the page
      // We'll still re-ping on the schedule after interaction.
    });
  };

  // Start periodic re-chimes (every RECHIME_MS)
  const startRechimeLoop = () => {
    // immediate single chime
    playChime();
    // schedule future chimes
    rechimeRef.current = setInterval(() => {
      playChime();
    }, RECHIME_MS);
  };

  const stopRechimeLoop = () => {
    if (rechimeRef.current) {
      clearInterval(rechimeRef.current);
      rechimeRef.current = null;
    }
    stopSound();
  };

  useEffect(() => {
    if (open) {
      setMinutes(5);
      startRechimeLoop();
      return () => {
        stopRechimeLoop();
      };
    }
    // if not open, make sure everything is stopped
    return () => stopRechimeLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    stopRechimeLoop();
    onClose?.();
  };

  const handleComplete = () => {
    stopRechimeLoop();
    onComplete?.(minutes);
  };

  return (
    <Modal isOpen={open} onClose={handleClose}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>🕒 Move Break</h3>
        <p style={{ marginTop: 0 }}>
          Please walk around for <b>5–10 minutes</b>.
        </p>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', margin: '12px 0 20px' }}>
          <label htmlFor="minutes" style={{ fontWeight: 600 }}>Minutes walked:</label>
          <input
            id="minutes"
            type="number"
            min={1}
            step={1}
            value={minutes}
            onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 5))}
            style={{
              width: 100,
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: 'white',
              textAlign: 'center'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={handleClose}
            style={{ padding: '10px 14px', borderRadius: 10, background: '#2b2b2b', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Dismiss
          </button>
          <button
            onClick={handleComplete}
            style={{ padding: '10px 14px', borderRadius: 10, background: '#4caf50', color: '#0d0d0d', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Completed
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WalkReminder;
