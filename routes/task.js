const express = require("express");
const taskController = require("./../controllers/task");
const authController = require("./../controllers/auth");
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
  .get(taskController.getAllTasks)
  .post(taskController.createNewTask);

router.route("/completed").get(taskController.getCompletedTasks);

router.route("/search").get(taskController.searchTasks);

router.route("/assigned").get(taskController.getAssignedTasks);

router
  .route("/:id")
  .get(taskController.getTaskDetails)
  .patch(taskController.modifyTask)
  .delete(taskController.deleteTask);

router
  .route("/collaborator/add/:taskId")
  .patch(taskController.addTaskContributors);

router
  .route("/collaborator/remove/:taskId")
  .patch(taskController.removeTaskContributor);

router.route("/category/:categoryId").get(taskController.getTasksByCategory);

router.route("/reminder/:taskId").patch(taskController.createTaskReminder);

module.exports = router;
