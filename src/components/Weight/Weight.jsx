import React, { useState, useEffect } from 'react';
import apiRequest from '../../utils/apiRequest';
import './weight.css';

const Weight = () => {
    const [weight, setWeight] = useState('');
    const [message, setMessage] = useState('');
    const [weightData, setWeightData] = useState([]);
    const [weeklyAvg, setWeeklyAvg] = useState(null);
    const [trend, setTrend] = useState(null);

    const loadWeights = async () => {
        const data = await apiRequest('/weighin');
        const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        setWeightData(sorted);

        // Weekly average: last 7 entries
        const last7 = sorted.slice(-7);
        if (last7.length) {
            const avg = (
                last7.reduce((sum, w) => sum + w.weight, 0) / last7.length
            ).toFixed(1);
            setWeeklyAvg(avg);
        }

        // Trend: compare last two entries
        if (sorted.length >= 2) {
            const prev = sorted[sorted.length - 2].weight;
            const latest = sorted[sorted.length - 1].weight;
            const diff = latest - prev;

            setTrend(
                diff > 0 ? 'up' :
                diff < 0 ? 'down' :
                'same'
            );
        }
    };

    const submitWeight = async () => {
        if (!weight || isNaN(weight) || weight <= 0) {
            setMessage('Please enter a valid weight');
            return;
        }

        try {
            const res = await apiRequest('/weighin', 'POST', { weight: parseFloat(weight) });
            setMessage(res.message);
            setWeight('');
            await loadWeights();
        } catch (err) {
            setMessage('Failed to log weight');
        }
    };

    useEffect(() => {
        loadWeights();
    }, []);

    return (
        <div className="weight-logger">
            <h3>📝 Log Your Weight</h3>
            <input
                type="number"
                step="0.1"
                placeholder="Enter weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
            />
            <button onClick={submitWeight}>Submit</button>
            {message && <p className="message">{message}</p>}

            <div className="metrics">
                {weeklyAvg && (
                    <div className="average">
                        🧮 Weekly Average: <strong>{weeklyAvg} kg</strong>
                    </div>
                )}
                {trend && (
                    <div
                        className={`trend ${
                            trend === 'up' ? 'gain' :
                            trend === 'down' ? 'loss' : 'same'
                        }`}
                    >
                        {trend === 'up' && '🔺 Weight increased'}
                        {trend === 'down' && '🔻 Weight decreased'}
                        {trend === 'same' && '⏸️ No change'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Weight;
