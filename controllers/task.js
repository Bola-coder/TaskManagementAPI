const Tasks = require("./../models/task");
const Users = require("./../models/user");
const Teams = require("./../models/team");
const catchAsync = require("../utils/catchAsync");
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

  // Filtering data (basic)
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((field) => delete queryObj[field]);
  const query = Tasks.find({ user: userID, ...queryObj });

  // sorting data
  // This mostly works with the startDate and dueDate fields
  if (req.query.sort) {
    console.log(req.query.sort);
    const sortBy = req.query.sort.split(",").join(" ");
    query.sort(sortBy);
  } else {
    query.sort("-startDate");
  }

  // Executing the query
  const tasks = await query.populate("user collaborators.user category");

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
    "user collaborators.user category"
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
    "category",
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
    "user collaborators.user modifications.user category"
  );

  res.status(200).json({
    status: "success",
    message: "Task modified successfully",
    task: newTask,
  });
});

// Delete a task
// Private Route
const deleteTask = catchAsync(async (req, res, next) => {
  const taskId = req.params.id;
  const userId = req.user._id;

  // 1. Check if the task exists
  const task = await Tasks.findById(taskId);
  if (!task) {
    return next(new AppError("Task with the specified ID not found", 404));
  }

  const taskName = task.name;

  //   2 Check if the the user id supplied can modify the tour either as the creator of the task

  if (!task.user.equals(userId)) {
    return next(
      new AppError("You are not authorized to modify this task", 403)
    );
  }
  //   Delete the task
  await Tasks.findByIdAndDelete(taskId);
  res.status(200).json({
    status: "success",
    message: `Task "${taskName}" deleted successfully`,
  });
});

const getCompletedTasks = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const tasks = await Tasks.find({ user: userID, completed: true }).populate(
    "user collaborators.user category"
  );

  if (!tasks) {
    return next(new AppError("Failed to get all completed tasks", 404));
  }

  res.status(200).json({
    status: "success",
    result: tasks.length,
    message: "Completed Tasks fectched successfully",
    tasks,
  });
});

// Add a task Contributor
// Private Route
const addTaskContributors = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
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

// Delete a task Contributor
// Private Route
const removeTaskContributor = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  const userId = req.user._id;

  const task = await Tasks.findById(taskId);

  if (!task) {
    return next(new AppError("Task with the provided ID does not exist", 404));
  }

  //   Check if it is the task owner who is trying to add a collaborator
  if (!task.user.equals(userId)) {
    return next(
      new AppError(
        "You are not authorized to remove a collaborator from this task",
        403
      )
    );
  }

  const { collaborator_email } = req.body;

  if (!collaborator_email) {
    return next(
      new AppError(
        "Request body should contain the email of the collaborator you want to remove from the task",
        403
      )
    );
  }

  const collaborator = await Users.findOne({ email: collaborator_email });

  if (!collaborator) {
    return next(
      new AppError("No user with the specified collaborator email", 404)
    );
  }

  //   Check if the email specified is a collaborator for the task
  for (const collab of task.collaborators) {
    console.log(collab);
    console.log(collab.user);
    console.log(collaborator._id);
    if (!collab.user.equals(collaborator.id)) {
      return next(
        new AppError(
          "User with the specified email address is not a collaborator for this task",
          404
        )
      );
    }
  }

  // Reomve the collaborator from the collaborators array on the task
  task.collaborators = task.collaborators.filter((collaborator) =>
    collaborator.user.equals(collaborator.id)
  );
  console.log(task.collaborators);

  //   Save the new task as updatedTask
  const updatedTask = await task.save();
  // updatedtask = await updatedTask.populate("user, collaborators.user");

  res.status(200).json({
    status: "success",
    message: "Collaborator removed successfully",
    task: updatedTask,
  });
});

// Get all taks belonging to a category
// Private Route
const getTasksByCategory = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const categoryID = req.params.categoryId;

  const tasks = await Tasks.find({
    user: userID,
    category: categoryID,
  }).populate("user collaborators.user category");

  if (!tasks) {
    return next(
      new AppError(
        "Failed to get all tasks belonging to the specified category",
        404
      )
    );
  }

  res.status(200).json({
    status: "success",
    result: tasks.length,
    message: "All tasks in the specified category fectched successfully",
    tasks,
  });
});

// Search for tasks that macth a keyword
// Private Route
const searchTasks = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const keyword = req.query.keyword;

  const tasks = await Tasks.find({
    user: userID,
    $text: { $search: keyword },
  }).populate("user collaborators.user category");

  if (!tasks) {
    return next(
      new AppError(
        "Failed to get all tasks matching the specified keyword",
        404
      )
    );
  }

  res.status(200).json({
    status: "success",
    result: tasks.length,
    message:
      "All tasks matching the specified search keyword fectched successfully",
    tasks,
  });
});

// Teams Related Events for tasks

// Create task for team
// Private Route
const createTaskForTeam = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const teamID = req.params.teamID;
  const { name, description, priority, dueDate, category } = req.body;

  // Check if the user is the owner of the team
  const team = await Teams.findById(teamID);
  if (!team) {
    return next(new AppError("Team with the specified ID not found", 404));
  }

  if (!team.owner.equals(userID)) {
    return next(
      new AppError(
        "You are not authorized to create a task for this team. Only the team owner can create a task for the team",
        403
      )
    );
  }

  // Create the task
  let task = await Tasks.create({
    name,
    description,
    user: userID,
    priority,
    dueDate,
    category,
    team: teamID,
  });

  task = await task.populate("user team");

  if (!task) {
    return next(new AppError("Failed to create new task", 404));
  }

  // Add the task to the team
  team.tasks.push(task._id);
  await team.save();

  res.status(200).json({
    status: "success",
    message: "Task created successfully",
    task,
  });
});

// Assign Task Or SubTask to a team member
// Private Route
const assignTaskToTeamMember = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const teamID = req.params.teemID;
  const { memberEmail, taskID } = req.body;

  if (!memberEmail || !taskID) {
    return next(
      new AppError(
        "Please provide member email and taskID in the request body",
        404
      )
    );
  }

  // Check if the teeam ID supplied is valid for the logged in user
  const team = await Teams.findOne({ owner: userID, id: teamID });
  if (!team) {
    return next(
      new AppError("Team with the specified team ID and user ID not found", 404)
    );
  }

  // Check  if the member email supplied is  a vaoid user
  const member = await Users.findOne({ email: memberEmail });
  if (!member) {
    return next(
      new AppError("User with the email supplied does not exist", 404)
    );
  }

  // Check if the member is a member of the team
  const isMember = team.members.find((teamMember) =>
    teamMember.user.equals(member.id)
  );
  if (!isMember) {
    return next(
      new AppError(
        "The user with the ssupplied emkail you are trying to assign a task to is not a member of the team",
        404
      )
    );
  }

  // Check if the task exists and if the user is the owner of the task
  const task = await Tasks.findOne({ user: userID, _id: taskID });
  if (!task) {
    return next(new AppError("Task with the specified ID not found", 404));
  }

  // Check if the task being assigned belongs to the team
  if (!team.tasks.includes(task._id)) {
    return next(
      new AppError(
        "The task with the speciified taskID being assigned to a member does not belong to the team",
        404
      )
    );
  }

  // I think this is redundant as userID is passed when fetching the team in the first place
  // if (!task.user.equals(userID)) {
  //   return next(
  //     new AppError(
  //       "You are not authorized to assign a task to a team member. Only the task owner can assign a task to a team member",
  //       403
  //     )
  //   );
  // }

  // Checks if the task has been assigned to the member aleady
  const isMemberAssigned = task.assignedTo.some((assignedMember) =>
    assignedMember.user.equals(member.id)
  );

  console.log(isMemberAssigned);
  if (isMemberAssigned) {
    console.log(true);
    return next(
      new AppError("This task is already assigned to this member", 404)
    );
  }

  // Assign the task to the member
  task.save();

  res.status(200).json({
    status: "success",
    message: "Task assigned successfully",
    task,
  });
});

module.exports = {
  createNewTask,
  getAllTasks,
  getTaskDetails,
  modifyTask,
  deleteTask,
  getCompletedTasks,
  addTaskContributors,
  removeTaskContributor,
  getTasksByCategory,
  searchTasks,
  createTaskForTeam,
  assignTaskToTeamMember,
};
