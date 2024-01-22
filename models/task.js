const mongoose = require("mongoose");

const tasksSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A task should have a name"],
    index: true,
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

  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Categories",
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

  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teams",
  },

  //For tasks in a team
  assignedTo: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    },
  ],
  modifications: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      edits: {
        type: Object,
      },
      timeStamp: {
        type: Date,
      },
    },
  ],
  reminders: [
    {
      reminderDate: {
        type: Date,
      },
    },
  ],
});

tasksSchema.index({ name: "text", description: "text" });

const Tasks = mongoose.model("Tasks", tasksSchema);

module.exports = Tasks;
