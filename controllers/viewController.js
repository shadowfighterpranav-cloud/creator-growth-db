const Creator = require("../models/creatorModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get creator data from collection
  const creators = await Creator.find();

  // 2) Build template & 3) Render that template using creator data from 1)
  res.status(200).render("overview", {
    title: "All Creators",
    creators,
  });
});

exports.getCreator = catchAsync(async (req, res, next) => {
  // 1) Get data for the requested creator (including reviews and managers)
  const creator = await Creator.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!creator) {
    return next(new AppError("There is no creator with that name.", 404));
  }

  // 2) Build template & 3) Render template using data from 1)
  res.status(200).render("creator", {
    title: `${creator.name} Profile`,
    creator,
  });
});
