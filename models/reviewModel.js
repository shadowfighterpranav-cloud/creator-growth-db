const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // PARENT REFERENCING
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: "Creator",
      required: [true, "Review must belong to a creator."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// Each combination of creator and user must be unique
reviewSchema.index({ creator: 1, user: 1 }, { unique: true });
reviewSchema.statics.calcAverageRatings = async function (creatorId) {
  const stats = await this.aggregate([
    {
      $match: { creator: creatorId },
    },
    {
      $group: {
        _id: "$creator",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Creator").findByIdAndUpdate(creatorId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await mongoose.model("Creator").findByIdAndUpdate(creatorId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.creator);
});

// Update & Delete hooks using findOneAnd
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.creator);
  }
});
// Auto-populate author information on reviews
reviewSchema.pre(/^find/, function () {
  this.populate({
    path: "user",
    select: "name",
  });
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
