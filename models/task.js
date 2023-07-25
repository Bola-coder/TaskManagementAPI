const mongoose = require("mongoose");

const tasksSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
  name: {
    type: String,
    required: [true, "A task should have a name"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
  collaborators: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      role: {
        type: String,
        enum: ["viewer", "editor"],
        default: "viewer",
      },
    },
  ],
  startDate: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  dueDate: {
    type: Date,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const Tasks = mongoose.model("Tasks", tasksSchema);

module.exports = Tasks;