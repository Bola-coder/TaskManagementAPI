const AppError = require("./../utils/AppError");

const restrictModifyTaskAction = (...roles) => {
  if (!roles.includes("editor")) {
    return next(
      new AppError("You are not authorized to perform this action", 403)
    );
  }
  next();
};

module.exports = { restrictModifyTaskAction };
