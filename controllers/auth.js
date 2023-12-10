const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const Users = require("./../models/user");

const signJWTToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Signup function
const signup = catchAsync(async (req, res, next) => {
  console.log(process.env.JWT_SECRET);
  const newUser = await Users.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  if (!newUser) {
    return next(new AppError("Failed to create new user", 404));
  }
  const token = signJWTToken(newUser._id);
  res.status(200).json({
    status: "success",
    user: newUser,
    token,
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

// Creating a controller to get the user  by slug

const getUserBySlug = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const user = await Users.find({ slug }).select("+_id");

  if (!user) {
    return next(new AppError("User not found!!!", 404));
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

module.exports = { signup, login, protectRoute, getUserBySlug };
