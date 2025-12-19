// src/state/masterStorage.js

import { DEFAULT_MASTER, SCHEMA_VERSION } from './masterSchema';

export const MASTER_LS_KEY = 'lifeDashboard:master';

export function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e?.message || 'Invalid JSON' };
  }
}

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

function normalizeWeightEntries(entries) {
  const arr = Array.isArray(entries) ? entries : [];

  return arr
    .filter(Boolean)
    .map((e) => {
      const ts = typeof e.ts === 'string' ? e.ts : null;
      const kg = typeof e.kg === 'number' ? e.kg : (typeof e.weight === 'number' ? e.weight : null);

      if (!ts || !isFiniteNumber(kg) || kg <= 0) return null;

      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return null;

      return { ts: d.toISOString(), kg };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.ts) - new Date(b.ts));
}

// minimal normalization so imports don’t crash your UI
export function normalizeMaster(raw) {
  const base = structuredClone(DEFAULT_MASTER);

  if (!isPlainObject(raw)) return base;

  const out = { ...base, ...raw };

  // schema/version
  out.schemaVersion = Number(out.schemaVersion || SCHEMA_VERSION) || SCHEMA_VERSION;
  out.updatedAt = typeof out.updatedAt === 'string' ? out.updatedAt : new Date().toISOString();

  // profile
  out.profile = isPlainObject(out.profile) ? out.profile : base.profile;
  out.profile.name = typeof out.profile.name === 'string' ? out.profile.name : '';
  out.profile.location = typeof out.profile.location === 'string' ? out.profile.location : '';
  out.profile.googleCalendar = isPlainObject(out.profile.googleCalendar) ? out.profile.googleCalendar : base.profile.googleCalendar;
  out.profile.googleCalendar.clientSecret =
    typeof out.profile.googleCalendar.clientSecret === 'string'
      ? out.profile.googleCalendar.clientSecret
      : '';

  // widgets
  out.widgets = isPlainObject(out.widgets) ? out.widgets : base.widgets;
  out.widgets.enabled = isPlainObject(out.widgets.enabled) ? out.widgets.enabled : {};

  // weekly goals
  out.weeklyGoals = isPlainObject(out.weeklyGoals) ? out.weeklyGoals : base.weeklyGoals;
  for (const k of Object.keys(base.weeklyGoals)) {
    if (typeof out.weeklyGoals[k] !== 'string') out.weeklyGoals[k] = '';
  }

  // habits
  out.habits = isPlainObject(out.habits) ? out.habits : base.habits;
  out.habits.list = Array.isArray(out.habits.list) ? out.habits.list : [];
  out.habits.records = Array.isArray(out.habits.records) ? out.habits.records : [];
  out.habits.deletedIds = Array.isArray(out.habits.deletedIds) ? out.habits.deletedIds : [];
  out.habits.list = out.habits.list.slice(0, 4);

  // relationships
  out.relationships = isPlainObject(out.relationships) ? out.relationships : base.relationships;
  out.relationships.list = Array.isArray(out.relationships.list) ? out.relationships.list : [];

  // ✅ weight (new structure)
  out.weight = isPlainObject(out.weight) ? out.weight : base.weight;

  // compat: if someone had old "entries" as {date, weight} from backend export,
  // we still accept it via normalizeWeightEntries (it also accepts e.weight)
  out.weight.entries = normalizeWeightEntries(out.weight.entries);

  out.weight.mode = isPlainObject(out.weight.mode) ? out.weight.mode : base.weight.mode;
  out.weight.mode.enabled = !!out.weight.mode.enabled;

  out.weight.mode.startKg = isFiniteNumber(out.weight.mode.startKg) ? out.weight.mode.startKg : null;
  out.weight.mode.goalKg = isFiniteNumber(out.weight.mode.goalKg) ? out.weight.mode.goalKg : null;

  // phases + other
  out.phases = isPlainObject(out.phases) ? out.phases : base.phases;
  out.other = isPlainObject(out.other) ? out.other : base.other;

  return out;
}

export function loadMasterFromLocalStorage() {
  const raw = localStorage.getItem(MASTER_LS_KEY);
  if (!raw) return structuredClone(DEFAULT_MASTER);

  const parsed = safeJsonParse(raw);
  if (!parsed.ok) return structuredClone(DEFAULT_MASTER);

  return normalizeMaster(parsed.value);
}

export function saveMasterToLocalStorage(master) {
  const safe = normalizeMaster(master);
  safe.updatedAt = new Date().toISOString();
  localStorage.setItem(MASTER_LS_KEY, JSON.stringify(safe, null, 2));
  return safe;
}

export async function importMasterFromFile(file) {
  const text = await file.text();
  const parsed = safeJsonParse(text);
  if (!parsed.ok) throw new Error(parsed.error);

  const normalized = normalizeMaster(parsed.value);
  return saveMasterToLocalStorage(normalized);
}

export function exportMasterToDownload(master, filename = 'life-dashboard.master.json') {
  const safe = saveMasterToLocalStorage(master);
  const blob = new Blob([JSON.stringify(safe, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export function clearMaster() {
  localStorage.removeItem(MASTER_LS_KEY);
  return structuredClone(DEFAULT_MASTER);
}
