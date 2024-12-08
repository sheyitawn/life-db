import React, { useState } from "react";
import { isTaskDue, rescheduleTask, pushTask } from "../../utils/adventureUtil";

const Adventures = ({ tasks, onUpdate }) => {
  const dueTasks = tasks.filter(isTaskDue);

  const handleDo = (task) => {
    const updatedTask = rescheduleTask(task, task.intervalInWeeks);
    onUpdate(task.id, updatedTask);
  };

  const handleSkip = (task) => {
    const updatedTask = { ...task, status: "skipped" };
    onUpdate(task.id, updatedTask);
  };

  const handlePush = (task, days) => {
    const updatedTask = pushTask(task, days);
    onUpdate(task.id, updatedTask);
  };

  return (
    <div>
      <h3>Today's Recommendations</h3>
      {dueTasks.map((task) => (
        <div key={task.id}>
          <p>{task.title} (Due: {new Date(task.dueDate).toLocaleDateString()})</p>
          <button onClick={() => handleDo(task)}>Do it</button>
          <button onClick={() => handleSkip(task)}>Skip</button>
          <button onClick={() => handlePush(task, 7)}>Push 1 Week</button>
        </div>
      ))}
    </div>
  );
};

export default Adventures;
