const express = require("express");
const path = require("path");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const viewRouter = require("./routes/viewRoutes");
const creatorRouter = require("./routes/creatorRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const userRouter = require("./routes/userRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(cors());
app.options("/{*splat}", cors()); // <-- Fixed CORS options wildcard route

app.use(compression());

// Set up Pug template engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, images, JS)
app.use(express.static(path.join(__dirname, "public")));

// 1) Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "https://dummyimage.com",
          "https://images.unsplash.com",
          "https://picsum.photos",
        ],
      },
    },
  }),
);

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
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

// 6) Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["subscriberCount", "platform", "category"], // allow duplicate fields for filtering if needed
  }),
);

app.set("query parser", "extended");

// 7) ROUTES
app.use("/", viewRouter);
app.use("/api/v1/creators", creatorRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

// 8) CATCH-ALL & GLOBAL ERROR HANDLER
app.all("/{*splat}", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
