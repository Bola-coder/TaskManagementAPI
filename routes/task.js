const express = require("express");
const taskController = require("./../controllers/task");
const authController = require("./../controllers/auth");

const router = express.Router();

router
  .route("/")
  .get(authController.protectRoute, taskController.getAllTasks)
  .post(authController.protectRoute, taskController.createNewTask);

router
  .route("/:id")
  .patch(authController.protectRoute, taskController.modifyTask);

router
  .route("/:id/collaborator/add")
  .patch(authController.protectRoute, taskController.modifyTaskContributors);

module.exports = router;
