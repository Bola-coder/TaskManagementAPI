const Tasks = require("./../models/task");
const Users = require("./../models/user");
const catchAsync = require("./../utils/catchAync");
const AppError = require("./../utils/AppError");

// Create a new task
// Private Rooute
const createNewTask = catchAsync(async (req, res, next) => {
  const user = req.user;
  const task = await Tasks.create({ ...req.body, user: user._id });
  if (!task) {
    return next(new AppError("Failed to create new task", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Task created successfully",
    task,
  });
});

// Get all tasks belongting to the specified user
// Private Route
const getAllTasks = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const tasks = await Tasks.find({ user: userID }).populate(
    "user collaborators.user"
  );

  if (!tasks) {
    return next(new AppError("Failed to get all tasks", 404));
  }

  res.status(200).json({
    status: "success",
    result: tasks.length,
    message: "All Tasks fectched successfully",
    tasks,
  });
});

// Get single task details
// Private Route
const getTaskDetails = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const taskID = req.params.id;
  const task = await Tasks.findOne({ user: userID, _id: taskID }).populate(
    "user collaborators.user"
  );

  if (!task) {
    return next(new AppError("Failed to get task details", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Task details fectched successfully",
    task,
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

  //   2 Check if the the user id supplied can modify the tour either as the creator of the task or as a collabortor with editor permmission
  const isCollaboratorAndCanEdit = task.collaborators.findIndex(
    (collaborator) =>
      collaborator.user.equals(userId) && collaborator.role == "editor"
  );

  if (!task.user.equals(userId) && isCollaboratorAndCanEdit === -1) {
    return next(
      new AppError("You are not authorized to modify this task", 403)
    );
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
      task[key] = req.body[key];
    } else {
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

  task.modifications.push({
    user: userId,
    edits: req.body,
    timeStamp: Date.now(),
  });
  const updatedTask = await task.save();
  const newTask = await updatedTask.populate(
    "user collaborators.user modifications.user"
  );

  res.status(200).json({
    status: "success",
    message: "Task modified successfully",
    task: newTask,
  });
});

// Add a task Contributor
// Private Route
const addTaskContributors = catchAsync(async (req, res, next) => {
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

  const { collaborator_email, role } = req.body;

  if (!collaborator_email || !role) {
    return next(
      new AppError(
        "Request body should contain the email of the collaborator you want to add and the role",
        403
      )
    );
  }

  const collaborator = await Users.findOne({ email: collaborator_email });

  //   Check if the collaborator doesn't exist yet for the task
  for (const collab of task.collaborators) {
    console.log(collab);
    console.log(collab.user);
    console.log(collaborator._id);
    if (collab.user.equals(collaborator.id)) {
      return next(
        new AppError(
          "User is already a collaborator for the specified task",
          404
        )
      );
    }
  }

  //   Push the collaborator to the collaborators array on the task
  task.collaborators.push({ user: collaborator._id, role });

  //   Save the new task as updatedTask
  const updatedTask = await task.save();
  // updatedtask = await updatedTask.populate("user, collaborators.user");

  res.status(200).json({
    status: "success",
    message: "Collaborator added successfully",
    task: updatedTask,
  });
});

module.exports = {
  createNewTask,
  getAllTasks,
  getTaskDetails,
  modifyTask,
  addTaskContributors,
};
