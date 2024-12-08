import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import apiRequest from '../../utils/apiRequest';

const Relationships = forwardRef(({ setRelationships }, ref) => {
    const [relationships, setLocalRelationships] = useState([]);


    // Handle check-in action
    const handleCheckIn = async (id) => {
        try {
            await apiRequest(`/relationships/relationships/${id}`, 'POST', { action: 'checked-in' });
            // Refresh relationships after check-in
            const response = await apiRequest('/relationships');
            setRelationships(response);
        } catch (error) {
            console.error('Error updating relationship:', error);
        }
    };

    // Handle skip action
    const handleSkip = async (id) => {
        try {
            await apiRequest(`/relationships/relationships/${id}`, 'POST', { action: 'skip' });
            // Refresh relationships after skip
            const response = await apiRequest('/relationships');
            setRelationships(response);
        } catch (error) {
            console.error('Error skipping relationship:', error);
        }
    };
    

    const fetchAllRelationships = async () => {
        try {
            const response = await apiRequest('/relationships/relationships');
            setLocalRelationships(response);

            // // Pass the most due relationships to the parent
            // if (setRelationships) {
            //     setRelationships(response);
            // }
        } catch (error) {
            console.error('Error fetching most due relationships:', error);
        }
    };

    const fetchMostDueRelationships = async () => {
        console.error('fetching');

        try {
            const response = await apiRequest('/relationships/most-due');
            // setLocalRelationships(response);

            // Pass the most due relationships to the parent
            if (setRelationships) {
                setRelationships(response);
            }
        } catch (error) {
            console.error('Error fetching most due relationships:', error);
        }
    };


    useImperativeHandle(ref, () => ({
        fetchMostDueRelationships,
    }));

    useEffect(() => {


        fetchMostDueRelationships();
        fetchAllRelationships()
    }, [setLocalRelationships]); // Re-fetch if setRelationships changes

    return (
        <div className="db-sidebar_relationships">
            <div className="db-sidebar_relationships_box">
                <div className="db-sidebar_relationships_header">RECOMMENDED CHECK-INS:</div>
                <div className="db-sidebar_relationships_relations">
                    {relationships.map((relationship) => (
                        <div key={relationship.id} className="db-sidebar_relationships_relation">
                            <div className="db-sidebar_relationships_relation_content">
                                {relationship.name}
                                <p>
                                    {relationship.daysLeft > 0
                                        ? `Next call in ${relationship.daysLeft} day(s)`
                                        : `Overdue by ${relationship.overdueDays} day(s)! Call now.`}
                                </p>
                                <div className="db-sidebar_relationships_relation_content_progress">
                                    <div
                                        className="db-sidebar_relationships_relation_content_progress-bar"
                                        style={{
                                            width: `${relationship.progress * 100}%`,
                                            background: relationship.overdue
                                                ? '#ff6f61'
                                                : '#15BAC6',
                                        }}
                                    />
                                </div>
                                
                            </div>
                            <button onClick={() => handleCheckIn(relationship.id)}>Checked In</button>
                                <button onClick={() => handleSkip(relationship.id)}>Skip</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default Relationships;
