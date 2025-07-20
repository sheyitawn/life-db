import React, { useEffect, useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import './activities.css';

const Activities = () => {
    const [weeklyActivity, setWeeklyActivity] = useState(null);
    const [exercises, setExercises] = useState([]);

    useEffect(() => {
        const load = async () => {
            const weeklyRes = await apiRequest('/activities/weekly');
            const exerciseRes = await apiRequest('/activities/exercise/today');
            setWeeklyActivity(weeklyRes.activity);
            setExercises(exerciseRes.exercises);
        };
        load();
    }, []);

    return (
        <div className="overview-container">
            <div className="overview-section">
                <h4>Weekly</h4>
                {weeklyActivity ? (
                    <p className={weeklyActivity.done ? 'crossed-out' : ''}>
                        {weeklyActivity.title}
                    </p>
                ) : (
                    <p>Loading...</p>
                )}
            </div>

            <div className="overview-section">
                <h4>Today</h4>
                {exercises.length ? (
                    <ul>
                        {exercises.map((e) => (
                            <li key={e.name} className={e.done ? 'crossed-out' : ''}>
                                {e.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Rest day</p>
                )}
            </div>
        </div>
    );
};

export default Activities;
