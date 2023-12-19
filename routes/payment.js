const express = require("express");
const authController = require("./../controllers/auth");
const paymentController = require("./../controllers/payment");

const router = express.Router();

router
  .route("/monthly")
  .post(
    authController.protectRoute,
    paymentController.makeMonthlySubscriptionPayment
  );

module.exports = router;
