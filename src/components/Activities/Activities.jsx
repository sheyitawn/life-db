import React, { useState, useEffect } from 'react';
import apiRequest from '../../utils/apiRequest';

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

                // Pass the main activity to the parent
                if (setActivity) {
                    setActivity(response.main);
                }
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
        <div>
            <h3>Today's Activity Recommendation</h3>
            {mainActivity ? (
                <div>
                    <h4>{mainActivity.title}</h4>
                    <button
                        onClick={() => updateActivity(mainActivity.id, { lastDone: new Date().toISOString(), status: 'done' })}
                    >
                        Mark as Done
                    </button>
                </div>
            ) : (
                <p>No activities due today.</p>
            )}

            <h3>Other Activities</h3>
            {otherActivities.map((activity) => (
                <div key={activity.id}>
                    <h4>{activity.title}</h4>
                    <button
                        onClick={() => updateActivity(activity.id, { lastDone: new Date().toISOString(), status: 'done' })}
                    >
                        Mark as Done
                    </button>
                </div>
            ))}

            <h3>Add a New Activity</h3>
            <input
                type="text"
                placeholder="Activity Title"
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            />
            <input
                type="number"
                placeholder="Interval in Days"
                value={newActivity.intervalInDays}
                onChange={(e) => setNewActivity({ ...newActivity, intervalInDays: e.target.value })}
            />
            <button onClick={addActivity}>Add Activity</button>
        </div>
    );
};

export default Activities;
