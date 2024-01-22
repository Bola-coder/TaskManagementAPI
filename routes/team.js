const express = require("express");
const taskController = require("./../controllers/task");
const authController = require("./../controllers/auth");
const teamController = require("./../controllers/team");
const userMiddleware = require("./../middlewares/userMiddleware");

const router = express.Router();

// Configuring all the routers in this file to use the middleware function stated
router.use(
  authController.protectRoute,
  userMiddleware.verifyIfUserIsActive,
  userMiddleware.checkIfUserEmailIsVerified
);

router
  .route("/")
  .post(teamController.createTeam)
  .get(teamController.getAllTeams);

router.route("/add/member/:teamID").patch(teamController.addTeamMember);
router.route("/remove/member/:teamID").patch(teamController.removeTeamMember);

router.route("/task/:teamID").post(taskController.createTaskForTeam);

router
  .route("/task/assign/:teamID")
  .post(taskController.assignTaskToTeamMember);
router
  .route("/task/unassign/:teamID")
  .patch(taskController.unAssignTaskToTeamMember);

router.route("/user").get(teamController.getTeamsAUserBelongsTo);

module.exports = router;
