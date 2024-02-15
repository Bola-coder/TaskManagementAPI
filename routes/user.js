const express = require("express");
const userController = require("./../controllers/user");
const userMiddleware = require("./../middlewares/userMiddleware");
const authController = require("./../controllers/auth");
const { multerUploads } = require("./../utils/multer");

const router = express.Router();

router
  .route("/profile")
  .get(
    authController.protectRoute,
    userMiddleware.verifyIfUserIsActive,
    userMiddleware.checkIfUserEmailIsVerified,
    userController.getLoggedInUserDetails
  )
  .patch(
    authController.protectRoute,
    userMiddleware.verifyIfUserIsActive,
    userMiddleware.checkIfUserEmailIsVerified,
    userController.updateUserProfileDetails
  )
  .delete(
    authController.protectRoute,
    userMiddleware.verifyIfUserIsActive,
    userMiddleware.checkIfUserEmailIsVerified,
    userController.deleteAccount
  );

router.patch(
  "/profile-image",
  multerUploads,
  authController.protectRoute,
  userMiddleware.verifyIfUserIsActive,
  userMiddleware.checkIfUserEmailIsVerified,
  userController.updateProfilePiture
);

module.exports = router;
