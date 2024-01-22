const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const verifyIfUserIsActive = (req, res, next) => {
  const user = req.user;

  if (!user || !user.active) {
    return next(new AppError("User account no longer active", 404));
  }

  next();
};

const checkIfUserEmailIsVerified = (req, res, next) => {
  const user = req.user;

  if (!user || !user.emailVerified) {
    return next(new AppError("User email not verified!", 404));
  }

  next();
};

module.exports = { verifyIfUserIsActive, checkIfUserEmailIsVerified };
