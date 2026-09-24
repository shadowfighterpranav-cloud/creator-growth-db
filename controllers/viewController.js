const Creator = require("../models/creatorModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get creator data from collection
  const creators = await Creator.find();

  // 2) Render template using creator data
  res.status(200).render("overview", {
    title: "All Creators",
    creators,
  });
});

exports.getCreator = catchAsync(async (req, res, next) => {
  // 1) Get data for requested creator
  const creator = await Creator.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!creator) {
    return next(new AppError("There is no creator with that name.", 404));
  }

  // 2) Render detail page
  res.status(200).render("creator", {
    title: `${creator.name} Profile`,
    creator,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
};
