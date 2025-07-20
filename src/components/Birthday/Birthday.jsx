import React, { useEffect, useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import { GiPresent } from "react-icons/gi";
import { FaRegCheckCircle } from "react-icons/fa";
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
            {/* <h3>🎉 Upcoming Birthdays</h3> */}
            {birthdays.map((person) => (
                <div key={person.id} className="birthday-person">
                    <div><strong>{person.name}'s</strong> birthday is in <strong>{person.daysAway}</strong> days!</div>
                    
                    {person.present && (
                        <div style={{ marginTop: '0.5rem' }}>
                            {!person.got_present ? (
                                <button
                                    className="present-button"
                                    onClick={() => handlePresentToggle(person.id, false)}
                                >
                                    <GiPresent /> Get Present
                                </button>
                            ) : (
                                <button
                                    className="present-gotten-button"
                                    onClick={() => handlePresentToggle(person.id, true)}
                                    title="Click to mark present as not gotten"
                                >
                                    <FaRegCheckCircle /> Got Present!
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
