// src/utils/relationshipsLocal.js

function ymdLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Parses either:
// - "YYYY-MM-DD"
// - ISO string "2025-12-18T10:20:30.000Z"
// - Date object
function parseDateFlexible(v) {
  if (!v) return null;

  // Date object
  if (v instanceof Date && !isNaN(v.getTime())) return v;

  const s = String(v).trim();
  if (!s) return null;

  // YYYY-MM-DD
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // ISO / other Date-parsable string
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

// Match backend: ceil((now - last) / days)
function daysSince(last, now = new Date()) {
  const a = new Date(last);
  const b = new Date(now);
  const ms = 1000 * 60 * 60 * 24;
  return Math.ceil((b - a) / ms);
}

export function normalizeRelationships(list) {
  const arr = Array.isArray(list) ? list : [];

  return arr
    .filter(Boolean)
    .map((r, idx) => {
      const id =
        (r.id || r.name || `rel_${idx}`)
          .toString()
          .trim()
          .replace(/\s+/g, '_')
          .toLowerCase();

      // accept old backend keys + new keys
      const checkinFrequency =
        r.checkinFrequency ??
        r.checkin_freq ??
        r.checkinFreq ??
        'weekly';

      // accept old backend keys + new keys
      const lastRaw =
        r.lastCheckinDate ??
        r.last_checkin ??
        r.lastCheckin ??
        '';

      // store as YYYY-MM-DD in the normalized view (even if ISO is provided)
      const lastDate = parseDateFlexible(lastRaw);
      const lastCheckinDate = lastDate ? ymdLocal(lastDate) : '';

      return {
        id,
        name: (r.name || '').toString(),
        birthday: r.birthday || '',
        checkinFrequency,
        lastCheckinDate,
        gettingPresent: !!(r.gettingPresent ?? r.present),
        gotPresent: !!(r.gotPresent ?? r.got_present),
      };
    });
}

// Map BOTH your new strings and the old backend strings
export function freqToDays(freq) {
  const f = String(freq || '').toLowerCase();

  switch (f) {
    case 'weekly': return 7;

    case 'biweekly':
    case 'bi-weekly': return 14;

    case 'monthly': return 30;

    case 'bimonthly':
    case 'bi-monthly': return 60;

    case 'half-yearly':
    case 'biyearly': return 182;

    case 'yearly': return 365;

    default: return 7;
  }
}

export function computeCheckinMeta(r, now = new Date()) {
  const intervalDays = freqToDays(r?.checkinFrequency || 'weekly');

  // If never checked in, treat as due now and overdue (same “attention needed” behavior)
  if (!r?.lastCheckinDate) {
    return {
      progress: 0,
      dueInDays: 0,
      daysLeft: 0,
      overdue: true,
      overdueDays: 0,
      intervalDays,
    };
  }

  const last = parseDateFlexible(r.lastCheckinDate);
  if (!last) {
    return {
      progress: 0,
      dueInDays: 0,
      daysLeft: 0,
      overdue: true,
      overdueDays: 0,
      intervalDays,
    };
  }

  // Match backend
  const daysSinceCheckin = daysSince(last, now);
  const progress = Math.min(daysSinceCheckin / intervalDays, 1);
  const daysLeft = Math.max(intervalDays - daysSinceCheckin, 0);
  const overdueDays = daysSinceCheckin > intervalDays ? (daysSinceCheckin - intervalDays) : 0;
  const overdue = daysSinceCheckin >= intervalDays;

  // dueInDays is what your UI text uses; keep it compatible with existing sort logic
  const dueInDays = intervalDays - daysSinceCheckin;

  return {
    progress,
    dueInDays,
    daysLeft,
    overdue,
    overdueDays,
    intervalDays,
  };
}

export function daysUntilBirthday(birthdayYmd, now = new Date()) {
  const b = parseDateFlexible(birthdayYmd);
  if (!b) return null;

  const year = now.getFullYear();
  const next = new Date(year, b.getMonth(), b.getDate());
  next.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (next < today) next.setFullYear(year + 1);

  // return whole days away (ceil)
  const ms = 1000 * 60 * 60 * 24;
  return Math.ceil((next - today) / ms);
}

export function todayYmd() {
  return ymdLocal(new Date());
}
