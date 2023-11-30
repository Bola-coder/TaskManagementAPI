const Comments = require("../models/comment");
// const Tasks = require("../models/task");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Create new Comment
// Private route

const createNewComment = catchAsync(async (req, res, next) => {
  const { comment, taskID } = req.body;
  const userID = req.user._id;

  const newComment = await Comments.create({
    comment,
    user: userID,
    task: taskID,
  });

  res.status(201).json({
    status: "success",
    data: {
      newComment,
    },
  });
});

// Get all comments
// Private route
const getAllComments = catchAsync(async (req, res, next) => {
  //   const userID = req.user._id;
  const taskID = req.body.taskID;
  let comments = await Comments.find({ task: taskID })
    .populate("replies")
    .populate("user", "id username email")
    .populate("task", "id name description");

  if (!comments) {
    return next(new AppError("No comments found", 404));
  }

  //   Filter out rpelies to comments from the actual comments
  comments = comments.filter((comment) => comment.parentComment === null);

  res.status(200).json({
    status: "success",
    result: comments.length,
    data: {
      comments,
    },
  });
});

const createReplyToComment = catchAsync(async (req, res, next) => {
  const { comment, taskID, parentCommentID } = req.body;
  const userID = req.user._id;

  const newComment = await Comments.create({
    comment,
    user: userID,
    task: taskID,
    parentComment: parentCommentID,
  });

  res.status(201).json({
    status: "success",
    data: {
      newComment,
    },
  });
});

// Edit a comment
// Private route

const editComment = catchAsync(async (req, res, next) => {
  const { commentID } = req.params;
  const { comment } = req.body;
  const userID = req.user._id;

  const editedComment = await Comments.findOneAndUpdate(
    { _id: commentID, user: userID },
    { comment, editedAt: Date.now() },
    { new: true }
  );

  if (!editedComment) {
    return next(new AppError("Failed to edit comment", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      editedComment,
    },
  });
});

module.exports = {
  createNewComment,
  getAllComments,
  createReplyToComment,
  editComment,
};
