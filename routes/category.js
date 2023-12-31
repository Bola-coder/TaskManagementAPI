const express = require("express");

const router = express.Router();

const categoryController = require("./../controllers/category");

const authController = require("./../controllers/auth");

router
  .route("/")
  .post(authController.protectRoute, categoryController.createNewCategory)
  .get(
    authController.protectRoute,
    categoryController.getAllCategoriesBelongingToUser
  );

router
  .route("/:id")
  .get(authController.protectRoute, categoryController.getCategoryDetails)
  .patch(authController.protectRoute, categoryController.updateCategoryDetails)
  .delete(authController.protectRoute, categoryController.deleteCategory);

router
  .route("/team/:teamID")
  .post(authController.protectRoute, categoryController.createTeamCategory)
  .get(
    authController.protectRoute,
    categoryController.getAllCategoriesBelongingToTeam
  );

module.exports = router;
