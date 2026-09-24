const Creator = require("../models/creatorModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Middleware for top/alias routes (e.g., /top-5-creators)
exports.aliasTopCreators = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-subscriberCount,ratingsAverage";
  req.query.fields = "name,platform,subscriberCount,ratingsAverage,category";
  next();
};

// Generic CRUD Operations via Handler Factory
exports.getAllCreators = factory.getAll(Creator);
exports.getCreator = factory.getOne(Creator, { path: "reviews" });
exports.createCreator = factory.createOne(Creator);
exports.updateCreator = factory.updateOne(Creator);
exports.deleteCreator = factory.deleteOne(Creator);

// Aggregation Pipeline for Creator Analytics
exports.getCreatorStats = catchAsync(async (req, res, next) => {
  const stats = await Creator.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.0 } },
    },
    {
      $group: {
        _id: { $toUpper: "$category" },
        numCreators: { $sum: 1 },
        avgRating: { $avg: "$ratingsAverage" },
        avgSubscribers: { $avg: "$subscriberCount" },
        minSubscribers: { $min: "$subscriberCount" },
        maxSubscribers: { $max: "$subscriberCount" },
      },
    },
    {
      $sort: { avgSubscribers: -1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
