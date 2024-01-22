const Users = require("./../models/user");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");

const getLoggedInUserDetails = catchAsync(async (req, res, next) => {
  const userID = req.user._id;

  const user = await Users.findById(userID);

  if (!user) {
    return next(
      new AppError(
        "User with the specified ID not found, please login again",
        404
      )
    );
  }

  res.status(200).json({
    status: "Success",
    message: "User details gotten succeffully",
    data: user,
  });
});

const deleteAccount = catchAsync(async (req, res, next) => {
  const userID = req.user._id;

  const user = await Users.findById(userID);

  if (!user) {
    return next(
      new AppError(
        "User with the specified ID not found, please login again",
        404
      )
    );
  }

  //   Disable the user by setting active to true
  user.active = false;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Account Deleted successfully",
  });
});

module.exports = { getLoggedInUserDetails, deleteAccount };
