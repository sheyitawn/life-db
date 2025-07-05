import React, { useEffect, useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import './activitymanager.css';

const ActivityManager = () => {
    const [weeklyActivity, setWeeklyActivity] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWeekly = async () => {
        const res = await apiRequest('/activities/weekly');
        setWeeklyActivity(res.activity);
    };

    const fetchExercises = async () => {
        const res = await apiRequest('/activities/exercise/today');
        setExercises(res.exercises);
    };

    const completeActivity = async () => {
        await apiRequest('/activities/weekly/complete', 'POST');
        fetchWeekly();
    };

    const refreshActivity = async () => {
        await apiRequest('/activities/weekly/refresh', 'POST');
        fetchWeekly();
    };

    const completeExercise = async (name) => {
        await apiRequest('/activities/exercise/complete', 'POST', { name });
        fetchExercises();
    };

    const resetExercises = async () => {
        await apiRequest('/activities/exercise/reset', 'POST');
        fetchExercises();
    };

    useEffect(() => {
        const load = async () => {
            await fetchWeekly();
            await fetchExercises();
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="manager-container">
            <div className="section">
                <h3>🌟 Weekly Activity</h3>
                <p><strong>{weeklyActivity?.title}</strong></p>
                <button
                    className={`done-button ${weeklyActivity?.done ? 'completed' : ''}`}
                    onClick={completeActivity}
                    disabled={weeklyActivity?.done}
                >
                    {weeklyActivity?.done ? '✅ Done' : 'Mark as Done'}
                </button>
                <button className="refresh-button" onClick={refreshActivity} title="Refresh activity">
                    🔁
                </button>
            </div>

            <div className="section">
                <h3>🏋️‍♂️ Today's Exercises</h3>
                {exercises.length === 0 ? (
                    <p>Rest day 🎉</p>
                ) : (
                    <ul className="exercise-list">
                        {exercises.map((exercise) => (
                            <li key={exercise.name}>
                                <span>{exercise.name}</span>
                                <button
                                    className={`done-button ${exercise.done ? 'completed' : ''}`}
                                    onClick={() => completeExercise(exercise.name)}
                                    disabled={exercise.done}
                                >
                                    {exercise.done ? '✅' : 'Done'}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <button className="reset-button" onClick={resetExercises}>
                    🔄 Reset Week
                </button>
            </div>
        </div>
    );
};

export default ActivityManager;
