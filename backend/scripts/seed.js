// Creates (or resets) a demo account with sample tasks and activity.
//   pnpm seed
require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const env = require("../src/config/env");
const User = require("../src/models/User");
const Task = require("../src/models/Task");
const Activity = require("../src/models/Activity");

const DEMO_USER = {
  name: "Demo User",
  email: process.env.DEMO_EMAIL || "demo@tasknix.app",
  password: process.env.DEMO_PASSWORD || "demo1234",
};

const DAY = 24 * 60 * 60 * 1000;

// a date relative to today, as a calendar day
const dayOffset = (days) => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + days));
};

const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

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

const seed = async () => {
  await mongoose.connect(env.MONGO_URI);

  let user = await User.findOne({ email: DEMO_USER.email });
  if (user) {
    await Promise.all([
      Task.deleteMany({ user: user._id }),
      Activity.deleteMany({ user: user._id }),
    ]);
  } else {
    user = await User.create(DEMO_USER);
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
  const activity = [];
  tasks.forEach((task, i) => {
    const createdHoursAgo = SAMPLE_TASKS[i][5];
    activity.push({
      user: user._id,
      task: task._id,
      taskTitle: task.title,
      action: "created",
      createdAt: hoursAgo(createdHoursAgo),
    });

    if (task.status === "In Progress") {
      activity.push({
        user: user._id,
        task: task._id,
        taskTitle: task.title,
        action: "status_changed",
        meta: { from: "Pending", to: "In Progress" },
        createdAt: hoursAgo(createdHoursAgo / 3),
      });
    }
    if (task.status === "Completed") {
      activity.push({
        user: user._id,
        task: task._id,
        taskTitle: task.title,
        action: "completed",
        createdAt: hoursAgo(createdHoursAgo / 4),
      });
    }
  });
  await Activity.insertMany(activity);

  // completedAt is set by the model on save, spread it out a bit for realism
  await Promise.all(
    tasks
      .filter((task) => task.status === "Completed")
      .map((task, i) =>
        Task.updateOne({ _id: task._id }, { completedAt: new Date(Date.now() - (i + 1) * DAY) }),
      ),
  );

  console.log(
    `Seeded ${tasks.length} tasks for ${DEMO_USER.email} (password: ${DEMO_USER.password})`,
  );
  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error("Seeding failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
