import React, { useMemo } from 'react';
import { useMaster } from '../../state/MasterContext';
import './daily.css';

function todayKey(date = new Date()) {
  const day = date.getDay();
  if (day === 0) return 'sunday';
  if (day === 1) return 'monday';
  if (day === 2) return 'tuesday';
  if (day === 3) return 'wednesday';
  if (day === 4) return 'thursday';
  if (day === 5) return 'friday';
  if (day === 6) return 'saturday';
  return null;
}

export default function DailyGoal() {
  const { master } = useMaster();

  const goal = useMemo(() => {
    const key = todayKey(new Date());
    if (!key) return '';
    return (master?.weeklyGoals?.[key] || '').trim();
  }, [master]);

  return (
    <div className="ld-daily-goal">
      <h4>WEEKLY GOAL (TODAY)</h4>

      <div className="db-main_content_daily-goal">
        {goal ? (
          <p>{goal}</p>
        ) : (
          <p style={{ opacity: 0.5, fontWeight: 600 }}>
            Set your weekly goals in Config → Widgets → Weekly Goals
          </p>
        )}
      </div>
    </div>
  );
}
