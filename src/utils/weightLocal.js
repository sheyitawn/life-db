// src/utils/weightLocal.js

export function nowIso() {
  return new Date().toISOString();
}

export function ymdLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addWeightEntry(entries, kg, ts = nowIso()) {
  const value = typeof kg === 'number' ? kg : Number(kg);
  if (!Number.isFinite(value) || value <= 0) throw new Error('Weight must be a positive number');

  const next = Array.isArray(entries) ? [...entries] : [];
  next.push({ ts, kg: value });

  next.sort((a, b) => new Date(a.ts) - new Date(b.ts));
  return next;
}

export function getLatestEntry(entries) {
  const arr = Array.isArray(entries) ? entries : [];
  if (arr.length === 0) return null;
  return arr[arr.length - 1];
}

export function computeWeeklyAverage(entries, days = 7) {
  const arr = Array.isArray(entries) ? entries : [];
  if (arr.length === 0) return null;

  // last N entries (simple + reliable)
  const slice = arr.slice(-days);
  const avg = slice.reduce((s, e) => s + e.kg, 0) / slice.length;
  return Number(avg.toFixed(1));
}

export function computeTrend(entries) {
  const arr = Array.isArray(entries) ? entries : [];
  if (arr.length < 2) return null;

  const prev = arr[arr.length - 2].kg;
  const latest = arr[arr.length - 1].kg;
  const diff = latest - prev;

  if (diff > 0) return 'up';
  if (diff < 0) return 'down';
  return 'same';
}

export function formatTimeAgo(tsIso, now = new Date()) {
  const t = new Date(tsIso);
  if (Number.isNaN(t.getTime())) return '';

  const diffMs = now.getTime() - t.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return `${hours}h ${mins}m ago`;
}
