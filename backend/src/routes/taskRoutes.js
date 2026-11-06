const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { idParamSchema } = require("../validators/common");
const {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
  statsQuerySchema,
} = require("../validators/taskSchemas");
const {
  getTasks,
  getTaskStats,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(validate({ query: listTasksQuerySchema }), getTasks)
  .post(validate({ body: createTaskSchema }), createTask);

// has to come before /:id
router.get("/stats", validate({ query: statsQuerySchema }), getTaskStats);

router
  .route("/:id")
  .get(validate({ params: idParamSchema }), getTask)
  .patch(validate({ params: idParamSchema, body: updateTaskSchema }), updateTask)
  .delete(validate({ params: idParamSchema }), deleteTask);

module.exports = router;
