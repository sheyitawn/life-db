// src/components/Phases/Phases.jsx
import React, { useEffect, useRef, useMemo } from "react";
import "./phase.css";
import { useMaster } from "../../state/MasterContext";
import { computePhaseModel } from "../../utils/phasesLocal";

const PHASE_LABELS = {
  MENSTRUAL: "MENSTRUAL PHASE",
  FOLLICULAR: "FOLLICULAR PHASE",
  OVULATION: "OVULATION",
  LUTEAL: "LUTEAL PHASE",
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getPhaseLengths(settings) {
  const cycle = Number(settings?.cycleLengthDays ?? 28);
  const period = Number(settings?.periodLengthDays ?? 5);
  const ovulation = Number(settings?.ovulationLengthDays ?? 1);
  const luteal = Number(settings?.lutealLengthDays ?? 14);

  const safeCycle = clamp(cycle, 10, 60);
  const safePeriod = clamp(period, 1, safeCycle);
  const safeOvul = clamp(ovulation, 1, safeCycle);
  const safeLuteal = clamp(luteal, 1, safeCycle);

  let follicular = safeCycle - (safePeriod + safeOvul + safeLuteal);

  // ensure at least 1 day follicular; shrink luteal first if needed
  if (follicular < 1) {
    const minFol = 1;
    const maxLuteal = Math.max(1, safeCycle - (safePeriod + safeOvul + minFol));
    const adjLuteal = clamp(safeLuteal, 1, maxLuteal);
    follicular = safeCycle - (safePeriod + safeOvul + adjLuteal);

    return {
      cycleDays: safeCycle,
      menstrualDays: safePeriod,
      follicularDays: Math.max(1, follicular),
      ovulationDays: safeOvul,
      lutealDays: adjLuteal,
    };
  }

  return {
    cycleDays: safeCycle,
    menstrualDays: safePeriod,
    follicularDays: follicular,
    ovulationDays: safeOvul,
    lutealDays: safeLuteal,
  };
}

export default function Phases() {
  const { master } = useMaster();

  // do NOT early-return before hooks
  const enabled = !!(master?.widgets?.enabled || {})?.phases;

  const settings = master?.phases?.settings || {};
  const history = master?.phases?.history || [];

  const model = useMemo(() => computePhaseModel(settings, history), [settings, history]);

  // compute proportional segments from settings
  const phaseLayout = useMemo(() => {
    const L = getPhaseLengths(settings);
    const total = L.cycleDays;

    const segments = [
      { key: "MENSTRUAL", days: L.menstrualDays },
      { key: "FOLLICULAR", days: L.follicularDays },
      { key: "OVULATION", days: L.ovulationDays },
      { key: "LUTEAL", days: L.lutealDays },
    ];

    let acc = 0;
    const withFracs = segments.map((s) => {
      const startFrac = acc / total;
      acc += s.days;
      const endFrac = acc / total;
      return { ...s, startFrac, endFrac };
    });

    return { segments: withFracs };
  }, [settings]);

  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    const cx = w / 2;
    const cy = h / 2;
    const radius = 46;
    const ballRadius = 6;

    const GAP = Math.PI / 45;

    const drawFrame = () => {
      ctx.clearRect(0, 0, w, h);

      // ring segments with glow + gaps at boundaries
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(255,255,255,0.35)";
      ctx.shadowBlur = 10;

      for (const seg of phaseLayout.segments) {
        const startA = -Math.PI / 2 + 2 * Math.PI * seg.startFrac;
        const endA = -Math.PI / 2 + 2 * Math.PI * seg.endFrac;

        const a0 = startA + GAP / 2;
        const a1 = endA - GAP / 2;
        if (a1 > a0) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, a0, a1);
          ctx.stroke();
        }
      }
      ctx.restore();

      // center label
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "9px sans-serif";

      const label = model?.ok
        ? (PHASE_LABELS[model.phase] || model.phase)
        : "SET PERIOD DATES";

      ctx.fillText(label, cx, cy);
      ctx.restore();

      // progress dot (still follows full-cycle progress 0..1)
      const p = model?.ok ? clamp(model.progress, 0, 1) : 0;
      const angle = -Math.PI / 2 + 2 * Math.PI * p;

      const bx = cx + radius * Math.cos(angle);
      const by = cy + radius * Math.sin(angle);

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#DC0B46";
      ctx.shadowColor = "rgba(220,11,70,0.8)";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    };

    drawFrame();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(drawFrame, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, model?.ok, model?.progress, model?.phase, phaseLayout]);

  if (!enabled) return null;

  return (
    <div className="phase">
      <canvas ref={canvasRef} className="phase-canvas" width={120} height={120} />
    </div>
  );
}
