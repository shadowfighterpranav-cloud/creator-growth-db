const express = require("express");
const app = express();

const creatorRouter = require("./routes/creatorRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

app.use(express.json());

app.use("/api/v1/creators", creatorRouter);

app.set("query parser", "extended");
// Catch-all route for unhandled URL requests
// Express 5 catch-all syntax passing down to the new AppError class
app.all("/{*splat}", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// The global error handling middleware mount point
app.use(globalErrorHandler);
module.exports = app;
