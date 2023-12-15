const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A team should have a name"],
    index: true,
  },

  description: {
    type: String,
    required: [true, "Please provide a description for the team"],
  },

  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },

  slug: {
    type: String,
  },

  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tasks",
    },
  ],
});

const Teams = mongoose.model("Teams", teamSchema);

module.exports = Teams;
