const express = require("express");

const categoryController = require("./../controllers/category");
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
  .post(categoryController.createNewCategory)
  .get(categoryController.getAllCategoriesBelongingToUser);

router
  .route("/:id")
  .get(categoryController.getCategoryDetails)
  .patch(categoryController.updateCategoryDetails)
  .delete(categoryController.deleteCategory);

router
  .route("/team/:teamID")
  .post(categoryController.createTeamCategory)
  .get(categoryController.getAllCategoriesBelongingToTeam);

module.exports = router;
