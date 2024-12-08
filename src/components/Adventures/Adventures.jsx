import React, { useState, useEffect } from 'react';
import apiRequest from '../../utils/apiRequest';

const Adventures = ({ setAdventure }) => {
    const [mainRecommendation, setMainRecommendation] = useState(null);
    const [otherRecommendations, setOtherRecommendations] = useState([]);
    const [newAdventure, setNewAdventure] = useState({ title: '', intervalInWeeks: '' });

    // Fetch recommendations from the backend
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await apiRequest('/adventures/recommendations');
                setMainRecommendation(response.main);
                setOtherRecommendations(response.others);

                // Pass the main recommendation to the parent
                if (setAdventure) {
                    setAdventure(response.main);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            }
        };
        fetchRecommendations();
    }, [setAdventure]);

    // Handle updates
    const updateTask = async (id, updatedTask) => {
        try {
            await apiRequest('/adventures/update-task', 'POST', { id, updatedTask });
            // Refresh recommendations after an update
            const response = await apiRequest('/recommendations');
            setMainRecommendation(response.main);
            setOtherRecommendations(response.others);

            // Pass the updated main recommendation to the parent
            if (setAdventure) {
                setAdventure(response.main);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    // Add a new adventure
    const addTask = async () => {
        if (!newAdventure.title || !newAdventure.intervalInWeeks) {
            return alert('Please provide a title and interval.');
        }

        try {
            await apiRequest('/add-task', 'POST', newAdventure);
            setNewAdventure({ title: '', intervalInWeeks: '' });

            // Refresh recommendations after adding a task
            const response = await apiRequest('/recommendations');
            setMainRecommendation(response.main);
            setOtherRecommendations(response.others);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    // Action Handlers
    const handleDo = (task) => {
        const updatedTask = {
            lastDone: new Date().toISOString(),
            status: 'done',
        };
        updateTask(task.id, updatedTask);
    };

    const handleSkip = (task) => {
        const updatedTask = { status: 'skipped' };
        updateTask(task.id, updatedTask);
    };

    return (
        <div>
            <h3>Today's Adventure Recommendation</h3>
            {mainRecommendation ? (
                <div>
                    <h4>{mainRecommendation.title}</h4>
                    <button onClick={() => handleDo(mainRecommendation)}>Mark as Done</button>
                    <button onClick={() => handleSkip(mainRecommendation)}>Skip</button>
                </div>
            ) : (
                <p>No recommendations available.</p>
            )}
            <h3>Other Due Adventures</h3>
            {otherRecommendations.map((task) => (
                <div key={task.id}>
                    <h4>{task.title}</h4>
                    <button onClick={() => handleDo(task)}>Mark as Done</button>
                    <button onClick={() => handleSkip(task)}>Skip</button>
                </div>
            ))}
            <h3>Add a New Adventure</h3>
            <input
                type="text"
                placeholder="Adventure Title"
                value={newAdventure.title}
                onChange={(e) => setNewAdventure({ ...newAdventure, title: e.target.value })}
            />
            <input
                type="number"
                placeholder="Interval in Weeks"
                value={newAdventure.intervalInWeeks}
                onChange={(e) => setNewAdventure({ ...newAdventure, intervalInWeeks: e.target.value })}
            />
            <button onClick={addTask}>Add Adventure</button>
        </div>
    );
};

export default Adventures;
