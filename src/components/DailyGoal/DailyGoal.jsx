import React, { useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import './daily.css'

const AddGoal = () => {
    const [newGoal, setNewGoal] = useState('');
    const [goalDate, setGoalDate] = useState('');
    const [message, setMessage] = useState('');

    const handleAddGoal = async () => {
        if (!newGoal || !goalDate) {
            setMessage('Please provide both a goal and a date.');
            return;
        }

        try {
            // Send the new goal to the backend
            await apiRequest('/goals/daily-goal', 'POST', {
                date: goalDate,
                goal: newGoal,
            });

            setMessage(`goal for ${goalDate} added.`);
            setNewGoal('');
            setGoalDate('');
        } catch (error) {
            console.error('Error adding goal:', error);
            setMessage('Failed to add goal. Please try again.');
        }
    };

    return (
        <div className='daily'>
            <h2>daily goal</h2>
            <div className="daily-input">
                <div>
                    {/* <label htmlFor="goal">GOAL:</label> */}
                    <input
                        type="text"
                        id="goal"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="GOAL"
                    />
                </div>
                <div>
                    {/* <label htmlFor="date">DATE:</label> */}
                    <input
                        type="date"
                        id="date"
                        value={goalDate}
                        onChange={(e) => setGoalDate(e.target.value)}
                    />
                </div>
            </div>

            <button onClick={handleAddGoal}>ADD GOAL</button>
            <h4 className="daily-success">
                {message && <h1>{message}</h1>}
            </h4>
        </div>
    );
};

export default AddGoal;
