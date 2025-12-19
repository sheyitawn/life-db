// src/state/masterStorage.js
import { DEFAULT_MASTER } from "./masterSchema";

export const MASTER_LS_KEY = "lifeDashboard:master"; // legacy key (migration source)

// IndexedDB config
const DB_NAME = "lifeDashboard";
const DB_VERSION = 1;
const STORE = "kv";
const MASTER_IDB_KEY = "master";

export function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function clampInt(n, min, max, fallback) {
  if (!isFiniteNumber(n)) return fallback;
  const v = Math.round(n);
  return Math.max(min, Math.min(max, v));
}

function normalizeYmd(s) {
  if (typeof s !== "string") return "";
  const t = s.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : "";
}

function normalizeWeightEntries(entries) {
  const arr = Array.isArray(entries) ? entries : [];
  return arr
    .filter(Boolean)
    .map((e) => {
      const ts = typeof e.ts === "string" ? e.ts : null;
      const kg = typeof e.kg === "number" ? e.kg : typeof e.weight === "number" ? e.weight : null;
      if (!ts || !isFiniteNumber(kg) || kg <= 0) return null;

      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return null;

      return { ts: d.toISOString(), kg };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.ts) - new Date(b.ts));
}

function normalizePhasesHistory(hist) {
  const arr = Array.isArray(hist) ? hist : [];
  return arr
    .filter(Boolean)
    .map((h) => {
      // support both old keys (start/end) and newer keys if present
      const start = normalizeYmd(h.startYmd || h.start || "");
      const end = normalizeYmd(h.endYmd || h.end || "");
      const recordedAt = typeof h.recordedAt === "string" ? h.recordedAt : new Date().toISOString();

      // allow partial entries (start-only or end-only)
      if (!start && !end) return null;

      // if both exist, basic sanity (end >= start)
      if (start && end) {
        const a = new Date(start);
        const b = new Date(end);
        if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
        if (b < a) return null;
      }

      return { startYmd: start, endYmd: end, recordedAt };
    })
    .filter(Boolean)
    .sort((a, b) => (a.startYmd || "").localeCompare(b.startYmd || ""));
}

// minimal normalization so imports don’t crash your UI
export function normalizeMaster(raw) {
  const base = structuredClone(DEFAULT_MASTER);
  if (!isPlainObject(raw)) return base;

  const out = { ...base, ...raw };

  out.updatedAt = typeof out.updatedAt === "string" ? out.updatedAt : new Date().toISOString();

  // profile
  out.profile = isPlainObject(out.profile) ? out.profile : base.profile;
  out.profile.name = typeof out.profile.name === "string" ? out.profile.name : "";
  out.profile.location = typeof out.profile.location === "string" ? out.profile.location : "";
  out.profile.googleCalendar = isPlainObject(out.profile.googleCalendar)
    ? out.profile.googleCalendar
    : base.profile.googleCalendar;
  out.profile.googleCalendar.clientSecret =
    typeof out.profile.googleCalendar.clientSecret === "string" ? out.profile.googleCalendar.clientSecret : "";

  // widgets
  out.widgets = isPlainObject(out.widgets) ? out.widgets : base.widgets;
  out.widgets.enabled = isPlainObject(out.widgets.enabled) ? out.widgets.enabled : {};

  // weekly goals
  out.weeklyGoals = isPlainObject(out.weeklyGoals) ? out.weeklyGoals : base.weeklyGoals;
  for (const k of Object.keys(base.weeklyGoals)) {
    if (typeof out.weeklyGoals[k] !== "string") out.weeklyGoals[k] = "";
  }

  // habits
  out.habits = isPlainObject(out.habits) ? out.habits : base.habits;
  out.habits.list = Array.isArray(out.habits.list) ? out.habits.list : [];
  out.habits.records = Array.isArray(out.habits.records) ? out.habits.records : [];
  out.habits.deletedIds = Array.isArray(out.habits.deletedIds) ? out.habits.deletedIds : [];

  // relationships
  out.relationships = isPlainObject(out.relationships) ? out.relationships : base.relationships;
  out.relationships.list = Array.isArray(out.relationships.list) ? out.relationships.list : [];

  // phases
  out.phases = isPlainObject(out.phases) ? out.phases : base.phases;
  out.phases.settings = isPlainObject(out.phases.settings) ? out.phases.settings : base.phases.settings;

  // support both old and new settings keys
  out.phases.settings.lastPeriodStartYmd = normalizeYmd(
    out.phases.settings.lastPeriodStartYmd || out.phases.settings.lastPeriodStart || ""
  );
  out.phases.settings.lastPeriodEndYmd = normalizeYmd(
    out.phases.settings.lastPeriodEndYmd || out.phases.settings.lastPeriodEnd || ""
  );

  out.phases.settings.cycleLengthDays = clampInt(out.phases.settings.cycleLengthDays, 10, 60, base.phases.settings.cycleLengthDays);
  out.phases.settings.periodLengthDays = clampInt(out.phases.settings.periodLengthDays, 1, 14, base.phases.settings.periodLengthDays);

  out.phases.settings.ovulationLengthDays = clampInt(
    out.phases.settings.ovulationLengthDays ?? 3,
    1,
    6,
    3
  );

  out.phases.settings.lutealLengthDays = clampInt(
    out.phases.settings.lutealLengthDays ?? 14,
    7,
    18,
    14
  );

  // keep sum <= cycle (ensure follicular has at least 1 day)
  const cycle = out.phases.settings.cycleLengthDays;
  const fixed =
    out.phases.settings.periodLengthDays +
    out.phases.settings.ovulationLengthDays +
    out.phases.settings.lutealLengthDays;
  if (fixed >= cycle) {
    const maxLuteal = Math.max(
      7,
      cycle - (out.phases.settings.periodLengthDays + out.phases.settings.ovulationLengthDays + 1)
    );
    out.phases.settings.lutealLengthDays = Math.min(out.phases.settings.lutealLengthDays, maxLuteal);
  }

  out.phases.history = normalizePhasesHistory(out.phases.history);

  // weight
  out.weight = isPlainObject(out.weight) ? out.weight : base.weight;
  out.weight.entries = normalizeWeightEntries(out.weight.entries);

  out.weight.mode = isPlainObject(out.weight.mode) ? out.weight.mode : base.weight.mode;
  out.weight.mode.enabled = !!out.weight.mode.enabled;
  out.weight.mode.startKg = isFiniteNumber(out.weight.mode.startKg) ? out.weight.mode.startKg : null;
  out.weight.mode.goalKg = isFiniteNumber(out.weight.mode.goalKg) ? out.weight.mode.goalKg : null;

  // other
  out.other = isPlainObject(out.other) ? out.other : base.other;

  return out;
}

// -------------------- IndexedDB helpers --------------------

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(key);

    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put({ key, value });

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

function idbDel(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.delete(key);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

async function migrateLegacyLocalStorageIfNeeded() {
  const legacy = localStorage.getItem(MASTER_LS_KEY);
  if (!legacy) return;

  const parsed = safeJsonParse(legacy);
  if (!parsed.ok) return;

  const db = await openDb();
  const existing = await idbGet(db, MASTER_IDB_KEY);

  if (!existing) {
    const normalized = normalizeMaster(parsed.value);
    normalized.updatedAt = new Date().toISOString();
    await idbPut(db, MASTER_IDB_KEY, normalized);
  }

  // remove legacy so DevTools stops showing LS as source of truth
  localStorage.removeItem(MASTER_LS_KEY);
}

// -------------------- Public API (used by MasterContext) --------------------

export async function loadMaster() {
  await migrateLegacyLocalStorageIfNeeded();
  const db = await openDb();
  const val = await idbGet(db, MASTER_IDB_KEY);
  if (!val) return structuredClone(DEFAULT_MASTER);
  return normalizeMaster(val);
}

export async function saveMaster(master) {
  const db = await openDb();
  const safe = normalizeMaster(master);
  safe.updatedAt = new Date().toISOString();
  await idbPut(db, MASTER_IDB_KEY, safe);
  return safe;
}

export async function importMasterFromFile(file) {
  const text = await file.text();
  const parsed = safeJsonParse(text);
  if (!parsed.ok) throw new Error(parsed.error);

  const normalized = normalizeMaster(parsed.value);
  return await saveMaster(normalized);
}

export async function exportMasterToDownload(master, filename = "life-dashboard.master.json") {
  const safe = await saveMaster(master);
  const blob = new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export async function clearMaster() {
  const db = await openDb();
  await idbDel(db, MASTER_IDB_KEY);

  // also clear legacy, just in case
  localStorage.removeItem(MASTER_LS_KEY);

  return structuredClone(DEFAULT_MASTER);
}
