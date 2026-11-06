const { z } = require("zod");
const { TASK_STATUSES, TASK_PRIORITIES } = require("../models/Task");
const { dateOnly } = require("./common");

const title = z
  .string("Title is required")
  .trim()
  .min(1, "Title is required")
  .max(100, "Title must be at most 100 characters");

const description = z.string().trim().max(1000, "Description must be at most 1000 characters");

const status = z.enum(TASK_STATUSES, `Status must be one of: ${TASK_STATUSES.join(", ")}`);
const priority = z.enum(TASK_PRIORITIES, `Priority must be one of: ${TASK_PRIORITIES.join(", ")}`);

// strictObject -> unknown keys are rejected, so nobody can send `user` or `completedAt`
const createTaskSchema = z.strictObject({
  title,
  description: description.optional(),
  status: status.optional(),
  priority: priority.optional(),
  dueDate: dateOnly("Due date"),
});

const updateTaskSchema = z
  .strictObject({
    title: title.optional(),
    description: description.optional(),
    status: status.optional(),
    priority: priority.optional(),
    dueDate: dateOnly("Due date").optional(),
  })
  .refine((body) => Object.keys(body).length > 0, "Nothing to update");

const SORT_FIELDS = ["createdAt", "updatedAt", "dueDate", "priority", "title"];
const SORT_OPTIONS = SORT_FIELDS.flatMap((field) => [field, `-${field}`]);

const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be 1 or more").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be between 1 and 100")
    .max(100, "Limit must be between 1 and 100")
    .default(10),
  search: z.string().trim().max(100, "Search is too long").optional(),
  status: status.optional(),
  priority: priority.optional(),
  overdue: z.enum(["true", "false"]).optional(),
  dueFrom: dateOnly("dueFrom").optional(),
  dueTo: dateOnly("dueTo").optional(),
  sort: z
    .enum(SORT_OPTIONS, `Sort must be one of: ${SORT_OPTIONS.join(", ")}`)
    .default("-createdAt"),
  // client's local date, so "overdue" matches what the user sees
  today: dateOnly("today").optional(),
});

const statsQuerySchema = z.object({
  today: dateOnly("today").optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
  statsQuerySchema,
};
