import React, { useState, useEffect } from "react";
import "./timeline.css";

const Timeline = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const tasks = [
    { time: "06:30", label: "rise & shine" },
    { time: "06:32", label: "pee, weigh in" },
    { time: "06:35", label: "hydrate" },
    { time: "06:40", label: "15-20 min walk" },
    { time: "07:00", label: "prep some tea" },
    { time: "07:10", label: "journal" },
    { time: "07:30", label: "warm up" },
    { time: "08:30", label: "project work" },
    { time: "12:00", label: "activity/ social" },
    { time: "13:30", label: "focused work" },
    { time: "15:30", label: "skill dev" },
    { time: "16:00", label: "activity" },
    { time: "17:30", label: "social" },
    { time: "18:30", label: "dinner" },
    { time: "19:30", label: "wind down" },
    { time: "20:30", label: "leisure time" },
    { time: "21:30", label: "shower" },
    { time: "21:50", label: "stretch" },
    { time: "21:55", label: "5 min clean" },
    { time: "22:00", label: "sleep" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getMinutesOfDay = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getCurrentTaskIndex = () => {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return tasks.findIndex((task, index) => {
      const taskMinutes = getMinutesOfDay(task.time);
      const nextTaskMinutes =
        index + 1 < tasks.length ? getMinutesOfDay(tasks[index + 1].time) : Infinity;
      return currentMinutes >= taskMinutes && currentMinutes < nextTaskMinutes;
    });
  };

  const currentTaskIndex = getCurrentTaskIndex();
  const startIndex = Math.max(currentTaskIndex - 3, 0);
  const endIndex = Math.min(startIndex + 7, tasks.length);
  const visibleTasks = tasks.slice(startIndex, endIndex);

  const dynamicLinePosition = visibleTasks.findIndex(
    (task) => task.time === tasks[currentTaskIndex]?.time
  );

  const isTaskCompleted = (taskTime) => {
    const taskMinutes = getMinutesOfDay(taskTime);
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return taskMinutes <= currentMinutes;
  };

  return (
    <div className="timeline">
      {/* Static Line */}
      <div className="timeline-static-line"></div>



      <div className="timeline-dynamic-line"></div>

      {/* Tasks */}
      {visibleTasks.map((task, index) => (
        <div
          key={index}
          className="task"
          style={{
            top: `${index * 15}%`, // Space tasks evenly
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
            <span className="task-label">{task.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
