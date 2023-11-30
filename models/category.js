const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A category must have a name"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
  },
  colorTag: {
    type: String,
    default: "#000000",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
});

const Categories = mongoose.model("Categories", CategorySchema);

module.exports = Categories;
