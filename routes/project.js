const router = require("express").Router();
const projectController = require("./../controllers/project");
const authController = require("./../controllers/auth");
const userMiddleware = require("./../middlewares/userMiddleware");

// Configuring all the routers in this file to use the middleware function stated
router.use(
  authController.protectRoute,
  userMiddleware.verifyIfUserIsActive,
  userMiddleware.checkIfUserEmailIsVerified
);

router
  .route("/")
  .post(projectController.createNewProject)
  .get(projectController.getAllProjects);

router
  .route("/add-member/:projectID")
  .patch(projectController.addMemberToProject);

module.exports = router;
