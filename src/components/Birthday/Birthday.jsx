import React, { useEffect, useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import './birthday.css';

const Birthday = () => {
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBirthdays = async () => {
        try {
            const data = await apiRequest('/relationships/birthdays/upcoming');
            setBirthdays(data);
        } catch (err) {
            setError('Failed to load birthdays');
        } finally {
            setLoading(false);
        }
    };

    const handlePresentToggle = async (id, currentStatus) => {
        try {
            await apiRequest(`/relationships/birthdays/${id}/present`, 'POST', {
                got_present: !currentStatus,
            });
            fetchBirthdays(); // Refresh
        } catch (err) {
            console.error('Failed to update present status:', err);
        }
    };

    useEffect(() => {
        fetchBirthdays();
    }, []);

    if (loading) return null;
    if (error) return <div>{error}</div>;
    if (birthdays.length === 0) return null;

    return (
        <div className="birthday-container">
            <h3>🎉 Upcoming Birthdays</h3>
            {birthdays.map((person) => (
                <div key={person.id} className="birthday-person">
                    <strong>{person.name}</strong>'s birthday is in <strong>{person.daysAway}</strong> days!
                    {person.present && (
                        <div style={{ marginTop: '0.5rem' }}>
                            {!person.got_present ? (
                                <button
                                    className="present-button"
                                    onClick={() => handlePresentToggle(person.id, false)}
                                >
                                    🎁 Get Present
                                </button>
                            ) : (
                                <button
                                    className="present-gotten-button"
                                    onClick={() => handlePresentToggle(person.id, true)}
                                    title="Click to mark present as not gotten"
                                >
                                    ✅ Present Gotten
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Birthday;
