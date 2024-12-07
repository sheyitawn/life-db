import React, { useState } from "react";

const MenstrualCyclePredictor = () => {
  const [startDate, setStartDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [prediction, setPrediction] = useState(null);

  const calculatePhases = () => {
    if (!startDate || !cycleLength || !periodLength) return;

    const phases = {
      menstruation: [],
      follicular: [],
      ovulation: [],
      luteal: [],
    };

    // Menstruation phase: Days 1 to periodLength
    for (let i = 1; i <= periodLength; i++) {
      phases.menstruation.push(i);
    }

    // Follicular phase: From end of menstruation to day of ovulation
    const ovulationDay = cycleLength - 14; // Ovulation is 14 days before next cycle
    for (let i = periodLength + 1; i < ovulationDay; i++) {
      phases.follicular.push(i);
    }

    // Ovulation phase: Single day (ovulationDay)
    phases.ovulation.push(ovulationDay);

    // Luteal phase: From ovulation day + 1 to the end of the cycle
    for (let i = ovulationDay + 1; i <= cycleLength; i++) {
      phases.luteal.push(i);
    }

    setPrediction(phases);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Menstrual Cycle Predictor</h2>
      <div>
        <label>
          Start Date of Last Period:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Average Cycle Length (days):
          <input
            type="number"
            value={cycleLength}
            onChange={(e) => setCycleLength(Number(e.target.value))}
            min="21"
            max="35"
          />
        </label>
      </div>
      <div>
        <label>
          Average Period Length (days):
          <input
            type="number"
            value={periodLength}
            onChange={(e) => setPeriodLength(Number(e.target.value))}
            min="2"
            max="10"
          />
        </label>
      </div>
      <button onClick={calculatePhases}>Predict Phases</button>
      {prediction && (
        <div style={{ marginTop: "20px" }}>
          <h3>Predicted Phases (Days from Start):</h3>
          <p>
            <strong>Menstruation:</strong> {prediction.menstruation.join(", ")}
          </p>
          <p>
            <strong>Follicular:</strong> {prediction.follicular.join(", ")}
          </p>
          <p>
            <strong>Ovulation:</strong> {prediction.ovulation.join(", ")}
          </p>
          <p>
            <strong>Luteal:</strong> {prediction.luteal.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export default MenstrualCyclePredictor;
