const express = require("express");

const authcontroller = require("./../controllers/auth");

const router = express.Router();

router.route("/signup").post(authcontroller.signup);
router.route("/login").post(authcontroller.login);
router
  .route("/verify/:email/:verification_token")
  .get(authcontroller.verifyUserEmail);
router.post("/verify/resend/", authcontroller.resendEmailVerificationToken);

// router.route("/me/:slug").get(authcontroller.getUserBySlug);

module.exports = router;
