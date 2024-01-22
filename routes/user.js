const express = require("express");
const userController = require("./../controllers/user");
const userMiddleware = require("./../middlewares/userMiddleware");
const authController = require("./../controllers/auth");

const router = express.Router();

router
  .route("/profile")
  .get(
    authController.protectRoute,
    userMiddleware.verifyIfUserIsActive,
    userMiddleware.checkIfUserEmailIsVerified,
    userController.getLoggedInUserDetails
  )
  .delete(
    authController.protectRoute,
    userMiddleware.verifyIfUserIsActive,
    userMiddleware.checkIfUserEmailIsVerified,
    userController.deleteAccount
  );

module.exports = router;
