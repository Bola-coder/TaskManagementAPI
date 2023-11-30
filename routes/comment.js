const express = require("express");
const commentController = require("./../controllers/comment");
const authController = require("./../controllers/auth");

const router = express.Router();

router
  .route("/")
  .post(authController.protectRoute, commentController.createNewComment)
  .get(authController.protectRoute, commentController.getAllComments);

router
  .route("/reply")
  .post(authController.protectRoute, commentController.createReplyToComment);

router
  .route("/:commentID")
  .patch(authController.protectRoute, commentController.editComment);

module.exports = router;
