import React, { useState } from 'react';
import apiRequest from '../../utils/apiRequest'; 

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

            setMessage(`Goal for ${goalDate} added successfully!`);
            setNewGoal('');
            setGoalDate('');
        } catch (error) {
            console.error('Error adding goal:', error);
            setMessage('Failed to add goal. Please try again.');
        }
    };

    return (
        <div>
            <h3>Add a New Goal</h3>
            <div>
                <label htmlFor="goal">Goal:</label>
                <input
                    type="text"
                    id="goal"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Enter your goal..."
                />
            </div>
            <div>
                <label htmlFor="date">Date:</label>
                <input
                    type="date"
                    id="date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                />
            </div>
            <button onClick={handleAddGoal}>Add Goal</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddGoal;
