const Creator = require("../models/creatorModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Build filter object based on query param
  const filter = {};
  if (req.query.platform && req.query.platform.toLowerCase() !== "all") {
    filter.platform = new RegExp(`^${req.query.platform}$`, "i");
  }

  // 2) Fetch creators matching filter
  const rawCreators = await Creator.find(filter);

  // 3) Apply ratings & mappings
  const creators = rawCreators.map((creator) => {
    const doc = creator.toObject();
    const name = (doc.creatorName || doc.name || "").toLowerCase();

    if (name.includes("mrbeast")) {
      doc.ratingsAverage = 4.9;
      doc.ratingsQuantity = 250;
    } else if (name.includes("marques")) {
      doc.ratingsAverage = 4.6;
      doc.ratingsQuantity = 180;
    } else {
      doc.ratingsAverage = doc.ratingsAverage || 4.2;
    }
    return doc;
  });

  // 4) Render template with active platform tag
  res.status(200).render("overview", {
    title: "All Creators",
    creators,
    activePlatform: req.query.platform
      ? req.query.platform.toLowerCase()
      : "all",
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
