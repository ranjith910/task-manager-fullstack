const Activity = require("../models/Activity");

// The task change already went through at this point, so if logging the
// activity fails we just log it instead of failing the whole request.
const recordActivity = async ({ user, task, action, meta }) => {
  try {
    await Activity.create({ user, task: task._id, taskTitle: task.title, action, meta });
  } catch (err) {
    console.error("Could not save activity:", err.message);
  }
};

const activityForUpdate = (previousStatus, task) => {
  if (previousStatus === task.status) return { action: "updated" };
  if (task.status === "Completed") return { action: "completed" };
  return { action: "status_changed", meta: { from: previousStatus, to: task.status } };
};

module.exports = { recordActivity, activityForUpdate };
