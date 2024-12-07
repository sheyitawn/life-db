
// Check if a task is due
export const isTaskDue = (task) => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return today >= dueDate && task.status === "pending";
  };
  
  // Reschedule a task
  export const rescheduleTask = (task, weeksToAdd) => {
    const dueDate = new Date(task.dueDate);
    dueDate.setDate(dueDate.getDate() + weeksToAdd * 7);
    return { ...task, dueDate: dueDate.toISOString(), status: "pending" };
  };
  
  // Push a task further along
  export const pushTask = (task, daysToAdd) => {
    const dueDate = new Date(task.dueDate);
    dueDate.setDate(dueDate.getDate() + daysToAdd);
    return { ...task, dueDate: dueDate.toISOString() };
  };
  