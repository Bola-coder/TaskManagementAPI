const Team = require("../models/team");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Teams = require("../models/team");

// Create a team
// Private Route
const createTeam = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const { name, description } = req.body;
  const team = await Team.create({
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

// Add a new Team member
// Private Route
const addTeamMember = catchAsync(async (req, res, next) => {
  const { memberID } = req.body;
  const userID = req.user._id;
  const teamID = req.params.teamID;

  const team = await Teams.findById(teamID);

  if (!userID.equals(team.owner)) {
    return next(
      new AppError(
        "You are not authorized to add a team member to this team",
        404
      )
    );
  }

  //   Push the user to the team members list
  team.members.push({ user: memberID });

  // Save the team
  await team.save();

  //   Send response to user
  res.status(200).json({
    status: "success",
    message: "Team member added successfully",
    team,
  });
});

// Get All Teams for User
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

module.exports = { createTeam, addTeamMember, getAllTeams };
