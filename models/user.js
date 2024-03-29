const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please provide your firstname"],
    trim: true,
  },
  lastname: {
    type: String,
    required: [true, "Please provide your lastname"],
    trim: true,
  },
  email: {
    type: String,
    unique: [true, "Email aleady in use"],
    required: [true, "Please provide an email address"],
    trim: true,
  },
  type: {
    //This type will be used to determine the what actions users can perform based on subsxription
    type: String,
    enum: ["basic", "premium", "enterprise"],
    default: "basic",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "Your password should be a minimum of 8 characters"],
    select: false,
  },
  phoneNumber: {
    type: String,
    unique: [true, "Phone number already in use"],
    required: [true, "Please provide your phone number"],
  },
  passwordChangedAt: {
    type: Date,
  },
  slug: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    select: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  projects: [
    {
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Projects",
      },
    },
  ],

  teams: [
    {
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
      },
    },
  ],

  assignedTasks: [
    {
      task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tasks",
      },
    },
  ],
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
  this.slug = slugify(this.firstname + "-" + this.lastname, { lower: true });
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

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
