const Users = require("./../models/user");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const { dataUri } = require("./../utils/multer");
const { uploader } = require("./../utils/cloudinary");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((ele) => {
    if (allowedFields.includes(ele)) {
      newObj[ele] = obj[ele];
    }
  });
  return newObj;
};

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

const updateUserProfileDetails = catchAsync(async (req, res, next) => {
  const userID = req.user._id;

  if (Object.keys(req.body).length === 0) {
    return next(new AppError("Please fill in fields to update", 404));
  }

  if (req.body.password) {
    return next(
      new AppError(
        "This route is not for password update, please use the correct route if you want to update passwordx",
        404
      )
    );
  }
  const allowedFields = filterObj(
    req.body,
    "firstname",
    "lastname",
    "phoneNumber"
  );

  const user = await Users.findByIdAndUpdate(userID, allowedFields, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("Failed to update user details", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User details updated successfully",
    data: {
      user,
    },
  });
});

// Update User Profile Picture
const updateProfilePiture = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  if (!req.file) {
    return next(new AppError("Please upload an image", 404));
  }

  const file = dataUri(req).content;
  try {
    const result = await uploader.upload(file, {
      folder: "Taskify/profile-images",
      use_filename: true,
    });

    const image = result.url;
    const user = await Users.findByIdAndUpdate(
      userID,
      { profileImage: image },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return next(new AppError("Failed to upload profile image", 404));
    }

    res.status(200).json({
      messge: "Your image has been uploded successfully to cloudinary",
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      messge: "someting went wrong while processing your request",
      data: {
        err,
      },
    });
  }
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

module.exports = {
  getLoggedInUserDetails,
  deleteAccount,
  updateProfilePiture,
  updateUserProfileDetails,
};
