const Payments = require("./../models/payment.js");
const Users = require("./../models/user.js");
const catchAsync = require("./../utils/catchAsync.js");
const AppError = require("./../utils/AppError.js");
const Paystack = require("./../config/paystack.js");

const makeMonthlySubscriptionPayment = catchAsync(async (req, res, next) => {
  const userID = req.user._id;

  const user = await Users.findById(userID);

  if (!user) {
    return next(new AppError("User not found!!"));
  }

  const planCode = process.env.planCode;
  const paymentBody = {
    email: user.email,
    plan: planCode,
  };

  try {
    const initailizePayment = () => {
      return new Promise((resolve, reject) => {
        Paystack.initializeSubScriptionPayment(paymentBody, (error, body) => {
          if (error) {
            reject(
              new AppError("Failed to make monthly susbscription payment", 404)
            );
          } else {
            resolve(body);
          }
        });
      });
    };

    const paymentResponse = await initailizePayment();

    const payment = await Payments.create({
      user: userID,
      amount: paymentResponse.amount,
    });

    user.type = "premium";
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Montly subscription made successfully",
      paymentResponse,
    });
  } catch (error) {
    return next(error);
  }
});

const cancelSubscriptionPayment = catchAsync(async (req, res, next) => {});

module.exports = { makeMonthlySubscriptionPayment };
