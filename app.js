const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const errorHandler = require("./middlewares/ErrorHandler");
const authRouter = require("./routes/auth");
const taskRouter = require("./routes/task");
const categoryRouter = require("./routes/category");
const commentRouter = require("./routes/comment");
const teamRouter = require("./routes/team");
const paymentRouter = require("./routes/payment");
const AppError = require("./utils/AppError");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/payment", paymentRouter);

app.all("*", (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server. Route not defined`,
    404
  );
  next(error);
});

app.use(errorHandler);

module.exports = app;
