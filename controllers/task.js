const Tasks = require("./../models/task");
const catchAsync = require("./../utils/catchAync");
const AppError = require("./../utils/AppError");

// Create a new task
// Private Rooute
const createNewTask = catchAsync(async (req, res, next) => {
  const task = await Tasks.create(req.body);
  if (!task) {
    return next(new AppError("Failed to create new task", 404));
  }
  res.status(200).json({
    status: "success",
    task,
  });
});

// Get all tasks
// Private Route
const getAllTasks = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const tasks = await Tasks.find({ user: userID });

  if (!tasks) {
    return next(new AppError("Failed to get all tasks", 404));
  }

  res.status(200).json({
    status: "success",
    result: tasks.length,
    tasks,
  });
});

// Modify a task
// Private Route
const modifyTask = catchAsync(async (req, res, next) => {
  // Modufy the task
  const taskId = req.params.id;
  const userId = req.user._id;

  // 1. Check if the task exists
  const task = await Tasks.findById(taskId);
  if (!task) {
    return next(new AppError("Task with the specified ID not found", 404));
  }

  //   2 Check if the the user id supplied can modify the tour
  console.log(
    task.collaborators.filter((collaborator) => {
      collaborator.user == userId && collaborator.role == "editor";
    })
  );

  if (!task.user.equals(userId)) {
    return next(new AppError("You are not authorized to modify a task", 403));
  }

  //   Check if the field supplied to be modifeid is allowed, and then, saving the modification
  const allowedFields = [
    "name",
    "description",
    "priority",
    "dueDate",
    "completed",
  ];

  let containsDisallowedField = false;
  for (const [key, value] of Object.entries(req.body)) {
    if (allowedFields.includes(key)) {
      console.log(key);
      task[key] = req.body[key];
    } else {
      console.log("Nothing dey sup for here");
      containsDisallowedField = true;
    }
  }

  if (containsDisallowedField) {
    return next(
      new AppError(
        `Only "${allowedFields}" fields can be modified using this route`,
        400
      )
    );
  }

  const updatedTask = await task.save();

  res.status(200).json({
    status: "success",
    task: updatedTask,
  });
});

// Modify a task Contributor
// Private Route
const modifyTaskContributors = catchAsync(async (req, res, next) => {
  const taskId = req.params.id;
  const userId = req.user._id;

  const task = await Tasks.findById(taskId);

  if (!task) {
    return next(new AppError("Task with the provided ID does not exist", 404));
  }

  //   Check if it is the task owner who is trying to add a collaborator
  if (!task.user.equals(userId)) {
    return next(
      new AppError(
        "You are not authorized to add a collaborator to this task",
        403
      )
    );
  }

  const { collaborator } = req.body;
  if (!collaborator || !collaborator.user) {
    return next(
      new AppError(
        "Request body should contain a collaborator with a user and role field",
        403
      )
    );
  }

  //   Check if the collaborator doesn't exist yet for the task
  for (const collab of task.collaborators) {
    console.log(collab.user);
    console.log(collaborator.user);
    if (collab.user == collaborator.user) {
      return next(
        new AppError(
          "User is already a collaborator for the specified task",
          404
        )
      );
    }
  }

  //   Push the collaborator to the collaborators array on the task
  task.collaborators.push(collaborator);

  //   Save the new task as updatedTask
  const updatedTask = await task.save();

  res.status(200).json({
    status: "success",
    message: "Collaborator added successfully",
    task: updatedTask,
  });
});

module.exports = {
  createNewTask,
  getAllTasks,
  modifyTask,
  modifyTaskContributors,
};
