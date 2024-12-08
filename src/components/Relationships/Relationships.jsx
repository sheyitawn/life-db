import React, { useState, useEffect } from 'react';
import apiRequest from '../../utils/apiRequest';

const Relationships = ({ setRelationships }) => {
    const [relationships, setLocalRelationships] = useState([]);

    // Fetch the 3 most due relationships
    useEffect(() => {
        const fetchMostDueRelationships = async () => {
            try {
                const response = await apiRequest('/relationships/most-due');
                setLocalRelationships(response);

                // Pass the most due relationships to the parent
                if (setRelationships) {
                    setRelationships(response);
                }
            } catch (error) {
                console.error('Error fetching most due relationships:', error);
            }
        };

        fetchMostDueRelationships();
    }, [setRelationships]); // Re-fetch if setRelationships changes

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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Relationships;
