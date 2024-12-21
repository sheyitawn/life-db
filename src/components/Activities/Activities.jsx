import React, { useState, useEffect } from 'react';
import apiRequest from '../../utils/apiRequest';
import './activities.css'

const Activities = ({ setActivity }) => {
    const [mainActivity, setMainActivity] = useState(null);
    const [otherActivities, setOtherActivities] = useState([]);
    const [newActivity, setNewActivity] = useState({ title: '', intervalInDays: '' });

    // Fetch recommendations
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await apiRequest('/activities/recommendations');
                setMainActivity(response.main);
                setOtherActivities(response.others);

            } catch (error) {
                console.error('Error fetching activities:', error);
            }
        };

        fetchActivities();
    }, [setActivity]); // Dependency ensures the effect runs whenever setActivity changes

    // Update activity
    const updateActivity = async (id, updatedActivity) => {
        try {
            await apiRequest('/activities/update-activity', 'POST', { id, updatedActivity });
            const response = await apiRequest('/activities/recommendations');
            setMainActivity(response.main);
            setOtherActivities(response.others);

            // Pass the updated main activity to the parent
            if (setActivity) {
                setActivity(response.main);
            }
        } catch (error) {
            console.error('Error updating activity:', error);
        }
    };

    // Add a new activity
    const addActivity = async () => {
        if (!newActivity.title || !newActivity.intervalInDays) {
            return alert('Please provide a title and interval.');
        }

        try {
            await apiRequest('/activities/add-activity', 'POST', newActivity);
            setNewActivity({ title: '', intervalInDays: '' });
            const response = await apiRequest('/activities/recommendations');
            setMainActivity(response.main);
            setOtherActivities(response.others);

            // Pass the updated main activity to the parent
            if (setActivity) {
                setActivity(response.main);
            }
        } catch (error) {
            console.error('Error adding activity:', error);
        }
    };

    return (
        <div className='activities'>
            <h1>activities</h1>

            <p>Here are the list of activities! <a href='https://www.youtube.com/watch?v=MYY4fGzvAJY' target='_blank'>Need some motivation?</a></p>
            
            {mainActivity ? (
                <div className='activities-activity'>
                    <h4>{mainActivity.title}</h4>
                    <button
                        onClick={() => updateActivity(mainActivity.id, { lastDone: new Date().toISOString(), status: 'done' })}
                    >
                        DONE
                    </button>
                </div>
            ) : (
                <p>No activities due today.</p>
            )}

            <h3>other activities</h3>
            {otherActivities.map((activity) => (
                <div key={activity.id}  className='activities-activity'>
                    <h4>{activity.title}</h4>
                    <button
                        onClick={() => updateActivity(activity.id, { lastDone: new Date().toISOString(), status: 'done' })}
                    >
                        DONE
                    </button>
                </div>
            ))}

            <div className="activities-add">
                <h3>ADD NEW</h3>
                <div className="activities-add-input">
                    <input
                        type="text"
                        placeholder="TITLE"
                        value={newActivity.title}
                        onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="INTERVAL (DAYS)"
                        value={newActivity.intervalInDays}
                        onChange={(e) => setNewActivity({ ...newActivity, intervalInDays: e.target.value })}
                    />
                    <button onClick={addActivity}>ADD ACTIVITY</button>
                </div>

            </div>

        </div>
    );
};

export default Activities;
