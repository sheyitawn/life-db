// src/utils/habitsLocal.js

// Local YYYY-MM-DD (avoids UTC drift)
export function ymdLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseYmdToLocalDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m - 1), d);
}

export function lastNDays(n = 7, endDate = new Date()) {
  const out = [];
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    out.push(ymdLocal(d));
  }
  return out;
}

export function getDaysInMonth(year, monthIndex) {
  const days = [];
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

// Normalize habit object coming from Config/master.
export function normalizeHabits(rawList) {
  const list = Array.isArray(rawList) ? rawList : [];

  return list
    .filter(Boolean)
    .slice(0, 4)
    .map((h, idx) => {
      const key =
        (h.id || h.key || h.name || h.label || `habit_${idx}`)
          .toString()
          .trim()
          .replace(/\s+/g, '_')
          .toLowerCase();

      const label =
        (h.name || h.label || h.key || h.id || `Habit ${idx + 1}`)
          .toString()
          .trim();

      const days = (h.days && typeof h.days === 'object') ? h.days : null;

      let daysFromFreq = null;
      if (!days && Array.isArray(h.frequency)) {
        daysFromFreq = {};
        for (const k of h.frequency) daysFromFreq[String(k).toLowerCase()] = true;
      }

      return { id: key, label, days: days || daysFromFreq };
    });
}

export function dayKeyForDate(dateObj) {
  const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[dateObj.getDay()];
}

export function isHabitScheduledOnDate(habit, dateObj) {
  const days = habit?.days;
  if (!days || typeof days !== 'object') return true;

  const k = dayKeyForDate(dateObj);
  const longMap = {
    sun: 'sunday', mon: 'monday', tue: 'tuesday', wed: 'wednesday',
    thu: 'thursday', fri: 'friday', sat: 'saturday'
  };

  const v = days[k] ?? days[longMap[k]] ?? false;
  return !!v;
}

/**
 * NEW records format:
 * records: [{ date:'YYYY-MM-DD', done: ['habitId1','habitId2'] }]
 */

function normalizeRecords(records) {
  return Array.isArray(records) ? records.filter(Boolean) : [];
}

function ensureDateRecord(records, date) {
  const arr = normalizeRecords(records);
  const idx = arr.findIndex(r => r?.date === date);

  if (idx >= 0) {
    const rec = arr[idx] || {};
    const done = Array.isArray(rec.done) ? rec.done : [];
    arr[idx] = { ...rec, date, done };
    return { next: arr, index: idx };
  }

  arr.push({ date, done: [] });
  return { next: arr, index: arr.length - 1 };
}

export function getDoneForDate(records, date, habitId) {
  const arr = normalizeRecords(records);
  const rec = arr.find(r => r?.date === date);
  const doneArr = Array.isArray(rec?.done) ? rec.done : [];
  return doneArr.includes(habitId);
}

export function setDoneForDate(records, date, habitId, done) {
  const { next, index } = ensureDateRecord(records, date);
  const rec = next[index];
  const doneArr = Array.isArray(rec.done) ? rec.done : [];

  const has = doneArr.includes(habitId);
  let updated;

  if (done) {
    updated = has ? doneArr : [...doneArr, habitId];
  } else {
    updated = has ? doneArr.filter(id => id !== habitId) : doneArr;
  }

  next[index] = { ...rec, done: updated };

  // Optional cleanup: remove empty date rows
  const cleaned = next.filter(r => Array.isArray(r.done) && r.done.length > 0);

  return cleaned;
}

export function toggleDoneForDate(records, date, habitId) {
  const current = getDoneForDate(records, date, habitId);
  const next = setDoneForDate(records, date, habitId, !current);
  return { next, value: !current };
}
