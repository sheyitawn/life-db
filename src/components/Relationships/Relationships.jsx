import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import apiRequest from '../../utils/apiRequest';
import { toast } from 'react-toastify';
import './relationships.css'

const Relationships = () => {
    const [relationships, setRelationships] = useState([]);


    // Handle check-in action
    const handleCheckIn = async (id) => {
        try {
            await apiRequest(`/relationships/relationships/${id}`, 'POST', { action: 'check-in' });
            // Refresh relationships after check-in
            const response = await apiRequest('/relationships/relationships');
            setRelationships(response);
            
            toast(`Checked in with ${relationships[id]}`)
            console.log("🚀 ~ handleCheckIn ~ relationships:", relationships[id])

        } catch (error) {
            console.error('Error updating relationship:', error);
        }
    };

    // Handle skip action
    const handleSkip = async (id) => {
        try {
            await apiRequest(`/relationships/relationships/${id}`, 'POST', { action: 'skip' });
            // Refresh relationships after skip
            const response = await apiRequest('/relationships/relationships');
            setRelationships(response);
            toast("skipped. next call in 2 days.")
        } catch (error) {
            console.error('Error skipping relationship:', error);
        }
    };
    

    const fetchAllRelationships = async () => {
        try {
            const response = await apiRequest('/relationships/relationships');
            setRelationships(response);

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


    // useImperativeHandle(ref, () => ({
    //     fetchMostDueRelationships,
    // }));

    useEffect(() => {


        fetchMostDueRelationships();
        fetchAllRelationships()
    }, [setRelationships]);

    return (
        <div className="relationships">
            <div className="relationships_box">
                <h1 className="relationships_header">relationships</h1>
                <div className="relationships_relations">
                    {relationships.map((relationship) => (
                        <div key={relationship.id} className="relationships_relation">
                            <div className="relationships_relation_content">
                                <p>{relationship.name}</p>
                                {/* <p>
                                    {relationship.daysLeft > 0
                                        ? `Next call in ${relationship.daysLeft} day(s)`
                                        : `Overdue by ${relationship.overdueDays} day(s)! Call now.`}
                                </p> */}
                                <div className="relationships_relation_content_progress">
                                    <div
                                        className="relationships_relation_content_progress-bar"
                                        style={{
                                            width: `${relationship.progress * 100}%`,
                                            background: relationship.overdue
                                                ? '#C62915'
                                                : '#15BAC6',
                                        }}
                                    />
                                </div>
                                
                            </div>

                            <div className="relationships_relation_buttons">
                                <button onClick={() => handleCheckIn(relationship.id)}>CHECK-IN</button>
                                <button onClick={() => handleSkip(relationship.id)}>SKIP</button>    
                            </div>
                            
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Relationships;
