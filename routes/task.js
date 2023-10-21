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
  .get(authController.protectRoute, taskController.getTaskDetails)
  .patch(authController.protectRoute, taskController.modifyTask);

router
  .route("/collaborator/add/:id")
  .patch(authController.protectRoute, taskController.addTaskContributors);

module.exports = router;
