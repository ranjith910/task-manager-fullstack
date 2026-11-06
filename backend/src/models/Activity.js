const mongoose = require("mongoose");

// Log of task events for the "Recent Activity" section on the dashboard.
// The title is copied in so old entries still make sense after a task is
// renamed or deleted.
const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    taskTitle: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ["created", "updated", "status_changed", "completed", "deleted"],
      required: true,
    },
    // e.g. { from: "Pending", to: "In Progress" }
    meta: {
      from: String,
      to: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.user;
        return ret;
      },
    },
  },
);

activitySchema.index({ user: 1, createdAt: -1 });
// mongo removes entries older than 90 days on its own
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model("Activity", activitySchema);
