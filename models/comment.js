const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "Comment cannot be empty"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Tasks",
    },

    // if this is a reply to a comment it stores the comment id here, else it is null
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comments",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// The virtual field replies" below is used gotten from the parentComment field above. It is used to populate the replies to a comment, and all the comment with the same parentComment id will be classified as replies to that parent comment
commentSchema.virtual("replies", {
  ref: "Comments",
  localField: "_id",
  foreignField: "parentComment",
});

const Comments = mongoose.model("Comments", commentSchema);

module.exports = Comments;
