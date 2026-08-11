const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const creatorRouter = require("./routes/creatorRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// 1) Set security HTTP headers
app.use(helmet());

// 2) Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// 3) Body parser & Cookie parser
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// 4) Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 5) Data sanitization against XSS
app.use(xss());

// 6) Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["subscriberCount", "platform", "category"], // allow duplicate fields for filtering if needed
  }),
);

app.set("query parser", "extended");

// 7) ROUTES
app.use("/api/v1/creators", creatorRouter);
app.use("/api/v1/users", userRouter);

// 8) CATCH-ALL & GLOBAL ERROR HANDLER
app.all("/{*splat}", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
