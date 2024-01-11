const express = require("express");
const taskController = require("./../controllers/task");
const authcontroller = require("./../controllers/auth");
const teamController = require("./../controllers/team");

const router = express.Router();

router
  .route("/")
  .post(authcontroller.protectRoute, teamController.createTeam)
  .get(authcontroller.protectRoute, teamController.getAllTeams);

router
  .route("/add/member/:teamID")
  .patch(authcontroller.protectRoute, teamController.addTeamMember);
router
  .route("/remove/member/:teamID")
  .patch(authcontroller.protectRoute, teamController.removeTeamMember);

router
  .route("/task/:teamID")
  .post(authcontroller.protectRoute, taskController.createTaskForTeam);

router
  .route("/task/assign/:teamID")
  .post(authcontroller.protectRoute, taskController.assignTaskToTeamMember);
router
  .route("/task/unassign/:teamID")
  .patch(authcontroller.protectRoute, taskController.unAssignTaskToTeamMember);

router
  .route("/user")
  .get(authcontroller.protectRoute, teamController.getTeamsAUserBelongsTo);

module.exports = router;
