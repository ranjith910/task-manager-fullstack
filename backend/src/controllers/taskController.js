const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");
const { parseDateOnly, todayUtc } = require("../utils/dates");
const { recordActivity, activityForUpdate } = require("../services/activityService");

const buildSort = (sort) => {
  const direction = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace(/^-/, "");
  const dbField = field === "priority" ? "priorityRank" : field;
  // _id as a tie breaker, otherwise pages can repeat/skip tasks with equal values
  return { [dbField]: direction, _id: direction };
};

const buildFilter = (userId, query) => {
  const filter = { user: userId };

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ title: pattern }, { description: pattern }];
  }
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

  if (query.dueFrom || query.dueTo) {
    filter.dueDate = {};
    if (query.dueFrom) filter.dueDate.$gte = parseDateOnly(query.dueFrom);
    if (query.dueTo) filter.dueDate.$lte = parseDateOnly(query.dueTo);
  }

  if (query.overdue === "true") {
    const today = query.today ? parseDateOnly(query.today) : todayUtc();
    filter.dueDate = { ...filter.dueDate, $lt: today };
    // completed tasks are never overdue
    filter.status = query.status ? { $eq: query.status, $ne: "Completed" } : { $ne: "Completed" };
  }

  return filter;
};

// Always look a task up together with its owner. If it belongs to someone
// else we return 404 rather than 403 so we don't confirm that it exists.
const findOwnedTask = async (taskId, userId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) throw new AppError(404, "Task not found");
  return task;
};

const withParsedDate = (body) =>
  body.dueDate ? { ...body, dueDate: parseDateOnly(body.dueDate) } : body;

// @desc    Get tasks (search, filters, sorting, pagination)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  const { page, limit, sort } = req.validated.query;
  const filter = buildFilter(req.user._id, req.validated.query);

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort(buildSort(sort))
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
};

// @desc    Task counts for the dashboard
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  const { today: todayParam } = req.validated.query;
  const today = todayParam ? parseDateOnly(todayParam) : todayUtc();
  const open = { status: { $ne: "Completed" } };

  const [result] = await Task.aggregate([
    { $match: { user: req.user._id } },
    {
      $facet: {
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
        overdue: [{ $match: { ...open, dueDate: { $lt: today } } }, { $count: "count" }],
        dueToday: [{ $match: { ...open, dueDate: today } }, { $count: "count" }],
      },
    },
  ]);

  const countsFor = (groups, keys) =>
    Object.fromEntries(keys.map((key) => [key, groups.find((g) => g._id === key)?.count || 0]));

  const byStatus = countsFor(result.byStatus, Task.TASK_STATUSES);
  const byPriority = countsFor(result.byPriority, Task.TASK_PRIORITIES);
  const total = byStatus.Pending + byStatus["In Progress"] + byStatus.Completed;

  res.status(200).json({
    success: true,
    data: {
      total,
      byStatus,
      byPriority,
      overdue: result.overdue[0]?.count || 0,
      dueToday: result.dueToday[0]?.count || 0,
      completionRate: total ? Math.round((byStatus.Completed / total) * 100) : 0,
    },
  });
};

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  const task = await findOwnedTask(req.validated.params.id, req.user._id);
  res.status(200).json({ success: true, data: task });
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const task = await Task.create({
    ...withParsedDate(req.validated.body),
    user: req.user._id,
  });

  await recordActivity({ user: req.user._id, task, action: "created" });

  res.status(201).json({ success: true, message: "Task created", data: task });
};

// @desc    Update a task (only the fields sent are changed)
// @route   PATCH /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const task = await findOwnedTask(req.validated.params.id, req.user._id);
  const previousStatus = task.status;

  task.set(withParsedDate(req.validated.body));

  if (task.isModified()) {
    await task.save();
    await recordActivity({
      user: req.user._id,
      task,
      ...activityForUpdate(previousStatus, task),
    });
  }

  res.status(200).json({ success: true, message: "Task updated", data: task });
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.validated.params.id, user: req.user._id });
  if (!task) throw new AppError(404, "Task not found");

  await recordActivity({ user: req.user._id, task, action: "deleted" });

  res.status(200).json({ success: true, message: "Task deleted", data: { id: task.id } });
};

module.exports = {
  getTasks,
  getTaskStats,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
