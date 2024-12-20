import React, { useState, useEffect } from "react";
import apiRequest from "../../utils/apiRequest.js";
import "./timeline.css";

const Timeline = () => {
    const [timeline, setTimeline] = useState([]); // Original timeline
    const [adjustedTimeline, setAdjustedTimeline] = useState([]); // Adjusted for late days
    const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
    const [isLateDays, setIsLateDays] = useState(false); // Late days toggle

    useEffect(() => {
        // Fetch timeline data on mount
        const fetchTimeline = async () => {
            try {
                const data = await apiRequest("/timeline");
                setTimeline(data);
                setAdjustedTimeline(data); // Initialize adjusted timeline
            } catch (error) {
                console.error("Error fetching timeline:", error);
            }
        };

        fetchTimeline();
    }, []);

    useEffect(() => {
        // Recalculate current task index periodically
        const updateCurrentTask = () => {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const currentIndex = adjustedTimeline.findIndex((task, index) => {
                const taskMinutes = getMinutesOfDay(task.time);
                const nextTaskMinutes =
                    index + 1 < adjustedTimeline.length
                        ? getMinutesOfDay(adjustedTimeline[index + 1].time)
                        : Infinity;

                return currentMinutes >= taskMinutes && currentMinutes < nextTaskMinutes;
            });

            setCurrentTaskIndex(currentIndex);
        };

        updateCurrentTask();
        const interval = setInterval(updateCurrentTask, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [adjustedTimeline]);

    const getMinutesOfDay = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    const handleLateDays = async () => {
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
        try {
            // Log the payload for debugging
            console.log("🚀 ~ Sending to toggle late day:", { date: today, "late-day": currentTime });
    
            // Send current date and time to toggle late day
            const response = await apiRequest("/goals/toggle-late-day", "POST", {
                date: today,
                "late-day": currentTime,
            });
    
            // Update the late day status
            setIsLateDays(response.goal["late-day"] !== null);
    
            // Fetch the updated timeline
            const updatedTimeline = await apiRequest("/timeline");
            setAdjustedTimeline(updatedTimeline);
            console.log("🚀 ~ handleLateDays ~ updatedTimeline:", updatedTimeline);
    
        } catch (error) {
            console.error("Error toggling late day:", error);
        }
    };
    

    const centerIndex = 3; // Center current task in the middle of visible tasks
    const visibleTaskCount = 7; // Number of tasks to display
    const startIndex = Math.max(currentTaskIndex - centerIndex, 0);
    const endIndex = Math.min(
        startIndex + visibleTaskCount,
        adjustedTimeline.length
    );

    const visibleTasks = adjustedTimeline.slice(startIndex, endIndex);

    const isTaskCompleted = (taskTime) => {
        const taskMinutes = getMinutesOfDay(taskTime);
        const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
        return taskMinutes <= currentMinutes;
    };

    return (
        <>
            <div className="timeline">
                

                {/* Static Line */}
                <div className="timeline-static-line"></div>

                {/* Tasks */}
                {visibleTasks.map((task, index) => (
                    <div
                        key={index}
                        className="task"
                        style={{
                            top: `${(index - centerIndex) * 15 + 50}%`, // Center current task
                        }}
                    >
                        <div
                            className="task-circle"
                            style={{
                                backgroundColor: isTaskCompleted(task.time)
                                    ? "#C62915" // Completed task color
                                    : "#ffffff", // Uncompleted task color
                            }}
                        ></div>
                        <div className="task-content">
                            <span className="task-time">{task.time}</span>
                            <span className="task-label">{task.task}</span>
                        </div>
                    </div>
                ))}

                
                
            </div>
            {/* Late Days Button */}
            <button className={isLateDays ? "timeline-late-button timeline-button-clicked" : "timeline-late-button"} onClick={handleLateDays}>
                {isLateDays ? "RESET" : "PUSH BACK"}
            </button>
        </>
    );
};

export default Timeline;
