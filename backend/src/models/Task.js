const mongoose = require("mongoose");

const TASK_STATUSES = ["Pending", "In Progress", "Completed"];
const TASK_PRIORITIES = ["Low", "Medium", "High"];

// sorting the priority strings directly gives High, Low, Medium,
// so we keep a numeric rank next to it and sort on that instead
const PRIORITY_RANK = { Low: 1, Medium: 2, High: 3 };

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title must be at most 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be at most 1000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "Pending",
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "Medium",
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    priorityRank: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.priorityRank;
        return ret;
      },
    },
  },
);

taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, status: 1 });

taskSchema.pre("validate", function () {
  if (this.isNew || this.isModified("priority")) {
    this.priorityRank = PRIORITY_RANK[this.priority];
  }
  if (this.isNew || this.isModified("status")) {
    this.completedAt = this.status === "Completed" ? new Date() : null;
  }
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
module.exports.TASK_STATUSES = TASK_STATUSES;
module.exports.TASK_PRIORITIES = TASK_PRIORITIES;
