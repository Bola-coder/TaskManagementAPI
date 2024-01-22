const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const Users = require("./../models/user");
const { createToken } = require("../utils/token");
const sendEmail = require("../utils/email");
const {
  encryptString,
  compareEncryptedString,
} = require("../utils/encryption");

const signJWTToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Signup function
const signup = catchAsync(async (req, res, next) => {
  const newUser = await Users.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    password: req.body.password,
  });

  if (!newUser) {
    return next(new AppError("Failed to create new user", 404));
  }

  // newUser.password = undefined;

  // const safeUserData = { ...newUser };

  // delete safeUserData.password;

  // Create a verification URL and send to the user's email for verification
  const verification_token = createToken("hex");
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verify/${newUser.email}/${verification_token}`;

  sendEmail({
    email: newUser.email,
    subject: "Email Verification",
    message: `Please click on the link below to verify your email address: \n\n ${verificationUrl}`,
  });

  // Hash the verification token and save to the user data in the database
  const hashedVerificationToken = encryptString(verification_token, 10);

  const user = await Users.findByIdAndUpdate(newUser._id, {
    verificationToken: hashedVerificationToken,
  }).select("-password");

  const token = signJWTToken(newUser._id);
  res.status(200).json({
    status: "success",
    data: { token, user },
  });
});

// Login function
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Fetching user from db based on email
  const user = await Users.findOne({ email }).select("+password");

  //   Checking if user exist and if password is the same with the hashed one
  if (
    !user ||
    !(await user.confirmPasswordDuringLogin(password, user.password))
  ) {
    return next(new AppError("Invalid email or password!"));
  }

  const token = signJWTToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    user,
    // email: user.email,
    // username: user.username,
    // slug: user.slug,
  });
});

// Protect route from unauthorised users function
const protectRoute = catchAsync(async (req, res, next) => {
  let token;

  //Getting token from auth header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "You are currently not logged in. Please sign in to continue",
        401
      )
    );
  }

  // Verifying token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Checking if user still exists
  const id = decoded.id;
  const currentUser = await Users.findById(id);
  if (!currentUser) {
    return next(
      new AppError("The user with the token does not exist anymore", 401)
    );
  }

  // Checking if user hasn't changed password since the token was last issued
  if (!currentUser.passwordChangedAfterTokenIssued(decoded.iat)) {
    return next(
      new AppError(
        "User password has been changed. Please login to get a new token"
      ),
      401
    );
  }

  // If everything checks out
  req.user = currentUser;
  next();
});

const resendEmailVerificationToken = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // Check if user with email exist
  const user = await Users.findOne({ email: email }).select(
    "+verificationToken"
  );
  if (!user) {
    return next(
      new AppError("User with the specified email address does not exist", 404)
    );
  }

  // Send the verification email to the user
  const verification_token = createToken("hex");
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verify/${user.email}/${verification_token}`;

  sendEmail({
    email: user.email,
    subject: "Email Verification Link Resent",
    message: `Please click on the link below to verify your email address: \n\n ${verificationUrl}`,
  });

  const hashedVerificationToken = encryptString(verification_token, 10);

  // stored a hashed version of the token in the database
  const updatedUser = await Users.findByIdAndUpdate(user._id, {
    verificationToken: hashedVerificationToken,
  });

  res.status(200).json({
    status: "success",
    message: "Verification link has resent to your email address",
  });
});

const verifyUserEmail = catchAsync(async (req, res, next) => {
  const { email, verification_token } = req.params;
  // Check if user with email exist
  const user = await Users.findOne({ email: email }).select(
    "+verificationToken"
  );
  if (!user) {
    return next(
      new AppError("User with the specified email address does not exist", 404)
    );
  }

  // Checks if the user is already verified
  if (user.emailVerified) {
    return next(new AppError("User has already been verified", 404));
  }

  // Checks if the verificationToken in the request params matches the encrypted on in the Db
  console.log(user.verificationToken);
  console.log(user);
  if (
    !(await compareEncryptedString(verification_token, user.verificationToken))
  ) {
    return next(new AppError("Invalid verification token", 404));
  }

  // Update the user's verification status
  const verifiedUser = await Users.findByIdAndUpdate(
    user._id,
    {
      emailVerified: true,
      verificationToken: null,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "User's email verified successfully",
    verifiedUser,
  });
});

// // Creating a controller to get the user  by slug
// const getUserBySlug = catchAsync(async (req, res, next) => {
//   const slug = req.params.slug;
//   const user = await Users.find({ slug }).select("+_id");

//   if (!user) {
//     return next(new AppError("User not found!!!", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     user,
//   });
// });

module.exports = {
  signup,
  login,
  protectRoute,
  // getUserBySlug,
  resendEmailVerificationToken,
  verifyUserEmail,
};
