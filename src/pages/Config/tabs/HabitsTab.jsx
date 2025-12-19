// src/pages/tabs/HabitsTab.jsx
import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useMaster } from '../../../state/MasterContext';

const MAX_HABITS = 4;

const DAYS = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

function makeHabit(name = '') {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.trim(),
    days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
  };
}

export default function HabitsTab() {
  const { master, actions } = useMaster();
  const habits = useMemo(() => (Array.isArray(master?.habits?.list) ? master.habits.list : []), [master]);

  const [newHabitName, setNewHabitName] = useState('');

  const setHabits = (nextList) => {
    actions.updateMaster(prev => ({
      ...prev,
      habits: { ...prev.habits, list: nextList.slice(0, MAX_HABITS) },
    }));
  };

  const addHabit = () => {
    const trimmed = newHabitName.trim();

    if (habits.length >= MAX_HABITS) {
      toast('Choose only meaningful habits (max 4).');
      return;
    }
    if (!trimmed) {
      toast('Please name the habit.');
      return;
    }
    const exists = habits.some(h => (h?.name || '').trim().toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast('That habit already exists.');
      return;
    }

    setHabits([...habits, makeHabit(trimmed)]);
    setNewHabitName('');
  };

  const removeHabit = (id) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    actions.updateMaster(prev => {
      const m = structuredClone(prev);

      m.habits = m.habits || {};
      m.habits.list = Array.isArray(m.habits.list) ? m.habits.list : [];
      m.habits.records = Array.isArray(m.habits.records) ? m.habits.records : [];
      m.habits.deletedIds = Array.isArray(m.habits.deletedIds) ? m.habits.deletedIds : [];

      // 1) Remove from list
      m.habits.list = m.habits.list.filter(h => h.id !== id);

      // 2) Add audit record (id + name + deletedAt)
      const deletedAt = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const alreadyLogged = m.habits.deletedIds.some(x => x?.id === id);

      if (!alreadyLogged) {
        m.habits.deletedIds.push({
          id,
          name: habit.name || habit.label || '',
          deletedAt,
        });
      }

      // 3) Remove from any existing daily "done" arrays (optional cleanup)
      m.habits.records = m.habits.records
        .map(r => {
          const done = Array.isArray(r?.done) ? r.done.filter(hid => hid !== id) : [];
          return { ...r, done };
        })
        .filter(r => Array.isArray(r.done) && r.done.length > 0);

      return m;
    });
  };


  const toggleDay = (id, dayKey) => {
    setHabits(
      habits.map(h => {
        if (h.id !== id) return h;
        return { ...h, days: { ...h.days, [dayKey]: !h.days?.[dayKey] } };
      })
    );
  };

  const renameHabit = (id, name) => {
    setHabits(habits.map(h => (h.id === id ? { ...h, name } : h)));
  };

  return (
    <>
      <div className="cfg-habits-header">
        <div>
          <h2 className="cfg-section-title">Habits</h2>
          <p className="cfg-help">Pick up to 4 meaningful habits and choose which days they apply.</p>
        </div>

        <div className="cfg-habits-count">
          {habits.length}/{MAX_HABITS}
        </div>
      </div>

      <div className="cfg-habits-add">
        <input
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="New habit name…"
          maxLength={40}
        />
        <button onClick={addHabit}>Add habit</button>
      </div>

      <div className="cfg-habits-list">
        {habits.length === 0 && <div className="cfg-empty">No habits yet. Add one above.</div>}

        {habits.map(h => (
          <div key={h.id} className="cfg-habit-row">
            <div className="cfg-habit-left">
              <input
                className="cfg-habit-name"
                value={h.name || ''}
                onChange={(e) => renameHabit(h.id, e.target.value)}
                placeholder="Habit name"
                maxLength={40}
              />
            </div>

            <div className="cfg-habit-days">
              {DAYS.map(d => {
                const on = !!h.days?.[d.key];
                return (
                  <button
                    key={d.key}
                    className={on ? 'cfg-day cfg-day-on' : 'cfg-day'}
                    onClick={() => toggleDay(h.id, d.key)}
                    title={d.key}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            <div className="cfg-habit-actions">
              <button className="cfg-danger" onClick={() => removeHabit(h.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
