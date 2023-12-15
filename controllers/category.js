const Categories = require("../models/category");
const Teams = require("../models/team");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Create a new category
// Private Route
const createNewCategory = catchAsync(async (req, res, next) => {
  const userID = req.user._id;

  const existingCategory = await Categories.findOne({
    name: req.body.name,
    user: userID,
  });

  if (existingCategory) {
    return next(
      new AppError(
        "Category with the specified name already exists for this user",
        404
      )
    );
  }

  const category = await Categories.create({
    ...req.body,
    user: userID,
  });
  if (!category) {
    return next(new AppError("Failed to create new category", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Category created successfully",
    category,
  });
});

// Get all categories belonging to the specified user
// Private Route
const getAllCategoriesBelongingToUser = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const categories = await Categories.find({ user: userID }).populate("user");
  if (!categories) {
    return next(new AppError("Failed to get all categories", 404));
  }
  res.status(200).json({
    status: "success",
    result: categories.length,
    message: "All Categories fectched successfully",
    categories,
  });
});

// Get single category details
// Private Route
const getCategoryDetails = catchAsync(async (req, res, next) => {
  const categoryID = req.params.id;
  const userID = req.user._id;
  const category = await Categories.findOne({
    _id: categoryID,
    user: userID,
  }).populate("user");
  if (!category) {
    return next(new AppError("Failed to get category details", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Category details fetched successfully",
    category,
  });
});

// Update Category
// Private Route
const updateCategoryDetails = catchAsync(async (req, res, next) => {
  const categoryID = req.params.id;
  const userID = req.user._id;
  const category = await Categories.findOneAndUpdate(
    { _id: categoryID, user: userID },
    req.body,
    { new: true, runValidators: true }
  ).populate("user");
  if (!category) {
    return next(new AppError("Failed to update category", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Category updated successfully",
    category,
  });
});

// Delete Category
// Private Route
const deleteCategory = catchAsync(async (req, res, next) => {
  const categoryID = req.params.id;
  const userID = req.user._id;
  const category = await Categories.findOneAndDelete({
    _id: categoryID,
    user: userID,
  });
  if (!category) {
    return next(new AppError("Failed to delete category", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Category deleted successfully",
  });
});

// Create a new category for a team
// Private Route
const createTeamCategory = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const teamID = req.params.teamID;
  const { name, description, colorTag } = req.body;

  const existingCategory = await Categories.findOne({
    name: req.body.name,
    user: userID,
  });

  if (existingCategory) {
    return next(
      new AppError(
        "Category with the specified name already exists for this user",
        404
      )
    );
  }

  const category = await Categories.create({
    name,
    description,
    colorTag,
    categoryType: "team",
    team: teamID,
    user: userID,
  });
  if (!category) {
    return next(new AppError("Failed to create new category", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Category created successfully",
    category,
  });
});

// Get all categories belonging to the specified team
// Private Route
const getAllCategoriesBelongingToTeam = catchAsync(async (req, res, next) => {
  const teamID = req.params.teamID;
  const userID = req.user._id;

  const team = await Teams.findById(teamID);

  if (!team) {
    return next(new AppError("Team does not exist", 404));
  }

  // Check if user is a member of the team or the team owner
  if (!team.members.includes(userID) || !team.owner.equals(userID)) {
    return next(new AppError("You are not a member of this team", 404));
  }

  const categories = await Categories.find({ team: teamID }).populate("user");
  if (!categories) {
    return next(new AppError("Failed to get all categories", 404));
  }

  res.status(200).json({
    status: "success",
    result: categories.length,
    message: "All Categories fectched successfully",
    categories,
  });
});

module.exports = {
  createNewCategory,
  getAllCategoriesBelongingToUser,
  getCategoryDetails,
  updateCategoryDetails,
  deleteCategory,
  createTeamCategory,
  getAllCategoriesBelongingToTeam,
};
