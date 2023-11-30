const express = require("express");
const taskController = require("./../controllers/task");
const authController = require("./../controllers/auth");

const router = express.Router();

router
  .route("/")
  .get(authController.protectRoute, taskController.getAllTasks)
  .post(authController.protectRoute, taskController.createNewTask);

router
  .route("/completed")
  .get(authController.protectRoute, taskController.getCompletedTasks);

router
  .route("/:id")
  .get(authController.protectRoute, taskController.getTaskDetails)
  .patch(authController.protectRoute, taskController.modifyTask)
  .delete(authController.protectRoute, taskController.deleteTask);

router
  .route("/collaborator/add/:taskId")
  .patch(authController.protectRoute, taskController.addTaskContributors);

router
  .route("/collaborator/remove/:taskId")
  .patch(authController.protectRoute, taskController.removeTaskContributor);

router
  .route("/category/:categoryId")
  .get(authController.protectRoute, taskController.getTasksByCategory);

module.exports = router;
