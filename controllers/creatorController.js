const APIFeatures = require("../utils/apiFeatures");
const Creator = require("../models/creatorModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.aliasTopCreators = (req, res, next) => {
  req.query.limit = "3";
  req.query.sort = "-subscriberGain";
  req.query.fields = "creatorName,platform,subscriberGain";
  next();
};

exports.getAllCreators = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Creator.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const creators = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: creators.length,
    data: { creators },
  });
});

exports.getCreator = catchAsync(async (req, res, next) => {
  const creator = await Creator.findById(req.params.id);

  if (!creator) {
    return next(new AppError("No creator found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { creator },
  });
});

exports.createCreator = catchAsync(async (req, res, next) => {
  const newCreator = await Creator.create(req.body);

  res.status(201).json({
    status: "success",
    data: { creator: newCreator },
  });
});

exports.updateCreator = catchAsync(async (req, res, next) => {
  const updatedCreator = await Creator.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedCreator) {
    return next(new AppError("No creator found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { creator: updatedCreator },
  });
});

exports.deleteCreator = catchAsync(async (req, res, next) => {
  const creator = await Creator.findByIdAndDelete(req.params.id);

  if (!creator) {
    return next(new AppError("No creator found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getCreatorStats = catchAsync(async (req, res, next) => {
  const stats = await Creator.aggregate([
    {
      // Stage 1: Match only creators with a positive subscriber gain
      $match: { subscriberGain: { $gte: 0 } },
    },
    {
      // Stage 2: Group by difficulty level and calculate stats
      $group: {
        _id: { $toUpper: "$difficultyLevel" },
        numCreators: { $sum: 1 },
        avgSubscribers: { $avg: "$subscriberGain" },
        minSubscribers: { $min: "$subscriberGain" },
        maxSubscribers: { $max: "$subscriberGain" },
      },
    },
    {
      // Stage 3: Sort the results by average subscribers descending
      $sort: { avgSubscribers: -1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});
