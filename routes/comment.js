const express = require("express");
const commentController = require("./../controllers/comment");
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
  .post(commentController.createNewComment)
  .get(commentController.getAllComments);

router.route("/reply").post(commentController.createReplyToComment);

router.route("/:commentID").patch(commentController.editComment);

module.exports = router;
