const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: [true, "Username already taken by another user"],
    required: [true, "Please should provide a username"],
    minLength: [4, "Your username should be a minimum of 4 characters"],
    maxLength: [16, "Your username should be a maximum of 16 characters"],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide an email address"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "Your password should be a minimum of 8 characters"],
    select: false,
  },
  passwordChangedAt: {
    type: Date,
  },
  slug: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// A database middleware to hash the password before saving to the database;
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Hook to check if password has been modifeid and then give a value to passwordChangedAt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now - 2000;
});

// Creating a pre save hook for creating slugs for each user based on their username
userSchema.pre("save", function (next) {
  this.slug = slugify(this.username, { lower: true });
  next();
});

// Creating an instance method to compare password entered by user to the one in the database during login
userSchema.methods.confirmPasswordDuringLogin = async function (
  enteredPassword,
  userPassword
) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

// Creating an instance method to check if the password has been changed after token has been issued
userSchema.methods.passwordChangedAfterTokenIssued = async function (
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 100,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const Users = mongoose.model("users", userSchema);

module.exports = Users;
