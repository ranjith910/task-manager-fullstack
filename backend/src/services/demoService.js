const env = require("../config/env");
const User = require("../models/User");
const Task = require("../models/Task");
const Activity = require("../models/Activity");

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// a calendar day relative to today
const dayOffset = (days) => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + days));
};

const hoursAgo = (hours) => new Date(Date.now() - hours * HOUR);

// [title, description, status, priority, due (days from today), created (hours ago)]
const SAMPLE_TASKS = [
  ["Set up CI pipeline", "Run lint and tests on every push", "Completed", "High", -5, 240],
  [
    "Fix login redirect bug",
    "Users land on a blank page after login on Safari",
    "Pending",
    "High",
    -2,
    200,
  ],
  ["Renew SSL certificate", "", "Pending", "Medium", -1, 180],
  ["Prepare sprint demo", "Short walkthrough of the new dashboard", "Pending", "High", 0, 150],
  ["Review pull requests", "Two PRs waiting on the API repo", "In Progress", "Medium", 1, 120],
  [
    "Write API documentation",
    "Document every endpoint with examples",
    "In Progress",
    "Medium",
    2,
    100,
  ],
  [
    "Write unit tests for auth",
    "Cover login, register and password change",
    "In Progress",
    "High",
    3,
    80,
  ],
  ["Design calendar view", "Month grid with tasks on their due dates", "Pending", "Medium", 5, 60],
  ["Set up error monitoring", "", "Pending", "Medium", 7, 40],
  ["Update dependencies", "Check for breaking changes first", "Pending", "Low", 9, 30],
  ["Plan next quarter roadmap", "", "Pending", "Low", 14, 20],
  ["Refactor task filters", "Move filtering to the API", "Completed", "Medium", -8, 300],
  ["Add pagination to task list", "", "Completed", "High", -3, 260],
  ["Clean up old git branches", "", "Completed", "Low", -10, 320],
];

// Creates the demo account, or puts it back to its original state.
// Expects mongoose to be connected already.
const resetDemoAccount = async () => {
  let user = await User.findOne({ email: env.DEMO_EMAIL });
  if (user) {
    await Promise.all([
      Task.deleteMany({ user: user._id }),
      Activity.deleteMany({ user: user._id }),
    ]);
    user.set({ name: "Demo User", password: env.DEMO_PASSWORD });
    await user.save();
  } else {
    user = await User.create({
      name: "Demo User",
      email: env.DEMO_EMAIL,
      password: env.DEMO_PASSWORD,
    });
  }

  const tasks = await Task.create(
    SAMPLE_TASKS.map(([title, description, status, priority, due, createdHoursAgo]) => ({
      title,
      description,
      status,
      priority,
      dueDate: dayOffset(due),
      createdAt: hoursAgo(createdHoursAgo),
      user: user._id,
    })),
  );

  // a believable history: everything was created, some got started or finished later
  const activity = tasks.flatMap((task, i) => {
    const createdHoursAgo = SAMPLE_TASKS[i][5];
    const base = { user: user._id, task: task._id, taskTitle: task.title };
    const events = [{ ...base, action: "created", createdAt: hoursAgo(createdHoursAgo) }];

    if (task.status === "In Progress") {
      events.push({
        ...base,
        action: "status_changed",
        meta: { from: "Pending", to: "In Progress" },
        createdAt: hoursAgo(createdHoursAgo / 3),
      });
    }
    if (task.status === "Completed") {
      events.push({ ...base, action: "completed", createdAt: hoursAgo(createdHoursAgo / 4) });
    }
    return events;
  });
  await Activity.insertMany(activity);

  // completedAt is set to "now" by the model, spread it out a bit
  const completed = tasks.filter((task) => task.status === "Completed");
  await Promise.all(
    completed.map((task, i) =>
      Task.updateOne({ _id: task._id }, { completedAt: new Date(Date.now() - (i + 1) * DAY) }),
    ),
  );

  return { email: env.DEMO_EMAIL, password: env.DEMO_PASSWORD, taskCount: tasks.length };
};

module.exports = { resetDemoAccount };
