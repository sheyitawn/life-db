// src/utils/phasesLocal.js

function ymdLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYmdToLocalDate(ymd) {
  if (typeof ymd !== 'string') return null;
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function diffDays(a, b) {
  // b - a in whole days, local midnight
  const aa = new Date(a); aa.setHours(0, 0, 0, 0);
  const bb = new Date(b); bb.setHours(0, 0, 0, 0);
  return Math.round((bb - aa) / (1000 * 60 * 60 * 24));
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function mean(nums) {
  if (!nums.length) return null;
  const s = nums.reduce((a, b) => a + b, 0);
  return s / nums.length;
}

/**
 * [Inference] “Refine” cycle length + period length from history:
 * - cycle length: average days between consecutive period starts
 * - period length: average days between start and end (inclusive)
 */
export function refineFromHistory(settings, history) {
  const hist = Array.isArray(history) ? history : [];

  const starts = hist
    .map(h => parseYmdToLocalDate(h.start))
    .filter(Boolean)
    .sort((a, b) => a - b);

  const ends = hist
    .map(h => ({ s: parseYmdToLocalDate(h.start), e: parseYmdToLocalDate(h.end) }))
    .filter(x => x.s && x.e && x.e >= x.s);

  const cycleGaps = [];
  for (let i = 1; i < starts.length; i++) {
    const gap = diffDays(starts[i - 1], starts[i]);
    if (gap >= 10 && gap <= 60) cycleGaps.push(gap);
  }

  const periodLens = ends
    .map(x => diffDays(x.s, x.e) + 1)
    .filter(n => n >= 1 && n <= 14);

  const avgCycle = mean(cycleGaps);
  const avgPeriod = mean(periodLens);

  const cycleLengthDays = clamp(
    Math.round(avgCycle ?? settings.cycleLengthDays ?? 28),
    10,
    60
  );

  const periodLengthDays = clamp(
    Math.round(avgPeriod ?? settings.periodLengthDays ?? 5),
    1,
    14
  );

  return { cycleLengthDays, periodLengthDays };
}

/**
 * Compute:
 * - current cycle day (1..cycleLen)
 * - current phase: Menstrual / Follicular / Ovulation / Luteal
 * - next period prediction
 * - progress around circle (0..1)
 */
export function computePhaseModel(settings, history, now = new Date()) {
  const s = settings || {};
  const refined = refineFromHistory(s, history);

  const lastStart = parseYmdToLocalDate(s.lastPeriodStart);
  const lastEnd = parseYmdToLocalDate(s.lastPeriodEnd);

  const cycleLen = refined.cycleLengthDays;
  const periodLen = refined.periodLengthDays;

  if (!lastStart) {
    return {
      ok: false,
      reason: 'missing_last_start',
      cycleLen,
      periodLen,
    };
  }

  // Determine which cycle we’re in: roll forward from lastStart by cycleLen
  const daysSinceStart = diffDays(lastStart, now);
  const cycleIndex = Math.floor(daysSinceStart / cycleLen);
  const cycleStart = addDays(lastStart, cycleIndex * cycleLen);
  const cycleDay = diffDays(cycleStart, now) + 1; // 1-based

  // Predict next period start
  const nextPeriodStart = addDays(cycleStart, cycleLen);

  // Phase boundaries (simple + robust):
  // - menstrual: day 1..periodLen
  // - ovulation day: cycleLen - 14 (typical luteal ~14d), clamped to [periodLen+1, cycleLen-1]
  // - ovulation window: 3 days [ov-1, ov, ov+1]
  const ovDay = clamp(cycleLen - 14, periodLen + 1, cycleLen - 1);
  const ovuStart = clamp(ovDay - 1, periodLen + 1, cycleLen);
  const ovuEnd = clamp(ovDay + 1, periodLen + 1, cycleLen);

  let phase = 'FOLLICULAR';
  if (cycleDay <= periodLen) phase = 'MENSTRUAL';
  else if (cycleDay >= ovuStart && cycleDay <= ovuEnd) phase = 'OVULATION';
  else if (cycleDay > ovuEnd) phase = 'LUTEAL';
  else phase = 'FOLLICULAR';

  // Progress around a circle:
  // map cycleDay 1..cycleLen to 0..1
  const progress = clamp((cycleDay - 1) / cycleLen, 0, 1);

  // Optional: use lastEnd to estimate “currently bleeding” if the saved end is in this cycle window
  // (but we keep phase logic consistent with periodLen anyway)

  return {
    ok: true,
    cycleLen,
    periodLen,
    cycleDay,
    phase,
    progress,
    cycleStartYmd: ymdLocal(cycleStart),
    nextPeriodStartYmd: ymdLocal(nextPeriodStart),
  };
}

export function todayYmd() {
  return ymdLocal(new Date());
}
