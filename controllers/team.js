const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Teams = require("../models/team");
const Users = require("./../models/user");

// Create a team
// Private Route
const createTeam = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const { name, description } = req.body;
  const team = await Teams.create({
    name,
    description,
    owner: userID,
  });

  if (!team) {
    return next(new AppError("Failed to create team", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Team created sucessfully",
    team,
  });
});

// Get All Teams Created By User
// Private
const getAllTeams = catchAsync(async (req, res, next) => {
  const userID = req.user._id;

  const teams = await Teams.find({ owner: userID }).populate(
    "owner tasks members.user"
  );

  if (!teams) {
    return next(new AppError("Failed to get teams for this user", 404));
  }

  res.status(200).json({
    statusL: "success",
    mesage: "All Teams for the currently logged in user fetched successfully",
    result: teams.length,
    teams,
  });
});

// Add a new Team member
// Private Route
const addTeamMember = catchAsync(async (req, res, next) => {
  const { memberID } = req.body;
  const userID = req.user._id;
  const teamID = req.params.teamID;

  const team = await Teams.findById(teamID);
  const member = await Users.findById(memberID);

  if (!team) {
    return next(
      new AppError(
        "The team you are trying to add a member to doesn't exist!",
        404
      )
    );
  }

  if (!userID.equals(team.owner)) {
    return next(
      new AppError(
        "You are not authorized to add a team member to this team",
        404
      )
    );
  }

  // check if the user is already a team member
  if (team.members.some((member) => member.user.equals(memberID))) {
    return next(new AppError("The user is already a member of the team", 404));
  }

  // //   Push the user to the team members list
  // team.members.push({ user: memberID });

  // // Add the team to the user teams array
  // user.teams.push(teamID);

  // // Save the team
  // await team.save();
  // // save the team to the user teams array
  // await user.save();

  // Using sessions to make sure both the teams and user documents gets updated
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    // Push the user to the team members list
    team.members.push({ user: memberID });

    // Add the team to the user teams array
    member.teams.push({ team: teamID });

    // Save the team and user within the same transaction
    await team.save({ session });
    await member.save({ session });

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    // Handle transaction error
    await session.abortTransaction();
    session.endSession();
    return next(new AppError("Failed to add team member", 500));
  }

  //   Send response to user
  res.status(200).json({
    status: "success",
    message: "Team member added successfully",
    team,
  });
});

// Add a new Team member
// Private Route
const removeTeamMember = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const memberID = req.body.memberID;
  const teamID = req.params.teamID;

  const team = await Teams.findById(teamID);

  if (!team) {
    return next(
      new AppError("The team with the specified ID is not found", 404)
    );
  }

  const member = await Users.findById(memberID);
  console.log(user);

  if (!member) {
    return next(
      new AppError("User with the specified member ID not found!", 404)
    );
  }

  if (!userID.equals(team.owner)) {
    return next(
      new AppError(
        "You are not authorized to remove a team member to this team",
        404
      )
    );
  }

  console.log(team.members.some((member) => member.user.equals(memberID)));
  if (!team.members.some((member) => member.user.equals(memberID))) {
    return next(
      new AppError(
        "User with the specified ID is not an existing member of this team"
      )
    );
  }

  // Remove the user from the team
  team.members = team.members.filter((member) => !member.user.equals(memberID));
  // Remove the team from the users team array
  member.teams = member.teams.filter((team) => !team.equals(teamID));

  await team.save();
  await member.save();

  res.status(200).json({
    status: "success",
    mesage: "Member removed from team successfully",
    team,
  });
});

// Get Teams a User Belongs To
// Private Route
const getTeamsAUserBelongsTo = catchAsync(async (req, res, next) => {
  const userID = req.user._id;

  const user = await Users.findById(userID).populate("teams");

  if (!user) {
    return next(new AppError("User with the specified ID not found!", 404));
  }

  const userTeams = user.teams;

  res.status(200).json({
    status: "success",
    message: "Teams user belonged to fetched successfully",
    userTeams,
  });
});

module.exports = {
  createTeam,
  getAllTeams,
  addTeamMember,
  removeTeamMember,
  getTeamsAUserBelongsTo,
};
