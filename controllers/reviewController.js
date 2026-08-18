const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

exports.setCreatorUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.creator) req.body.creator = req.params.creatorId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.creatorId) filter = { creator: req.params.creatorId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
