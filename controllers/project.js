const Products = require("./../models/product");
const Tasks = require("./../models/task");
const Users = require("./../models/user");
const Teams = require("./../models/team");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/AppError");
const Projects = require("./../models/product");

// Permisssions
const PERMISSIONS = ["addMember", "createTask", "removeMember"];

// Create New Project
const createNewProject = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;
  const userID = req.user.id;

  if (!name || !description) {
    return next(new AppError("Please provide name and description", 404));
  }

  const project = await Products.create({ name, description, user: userID });

  if (!project) {
    return next(new AppError("Failed to create new project", 404));
  }

  res.status(200).json({
    status: "success",
    message: "New Project created successfully",
    project,
  });
});

const getAllProjects = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  const projects = await Projects.find({ user: userID });

  if (!projects) {
    return next(new AppError("Failed to get all projects", 404));
  }

  res.status(200).json({
    status: "success",
    message: "All projects fetched successfully",
    result: projects.length,
    projects,
  });
});

const addMemberToProject = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const projectID = req.params.projectID;
  const { memberEmail } = await req.body;

  const project = await Projects.findOne({ _id: projectID, user: userID });

  if (!project) {
    return next(
      new AppError("Failed to get project with the specified ID belonging", 404)
    );
  }

  const member = await Users.findOne({ email: memberEmail });
  if (!member) {
    return next(
      new AppError("Failed to get user with the specified member ID", 404)
    );
  }

  if (!member.emailVerified) {
    return next(
      new AppError(
        "Member has not verified their email address. Only members who have verified their email address can be added as project members",
        404
      )
    );
  }

  project.members.push({ user: member.id });
  await project.save();

  res.status(200).json({
    status: "success",
    message: "Member addedd successfully",
    project,
  });
});

// Exports
module.exports = { createNewProject, getAllProjects, addMemberToProject };
