const mongoose = require("mongoose");
const slugify = require("slugify");

const creatorSchema = new mongoose.Schema(
  {
    creatorName: {
      type: String,
      required: [true, "A creator must have a name"],
      unique: true,
      trim: true,
    },
    slug: String,
    platform: {
      type: String,
      required: [true, "A strategy must be tied to a primary platform"],
      enum: ["YouTube", "TikTok", "Twitch", "Instagram"],
    },
    growthStrategy: {
      type: String,
      required: [true, "A growth strategy breakdown is required"],
      trim: true,
    },
    subscriberGain: {
      type: Number,
      required: [
        true,
        "An approximate subscriber or follower gain is required",
      ],
    },
    difficultyLevel: {
      type: String,
      required: [true, "An execution difficulty level is required"],
      enum: ["Easy", "Medium", "Hard"],
    },
    isSecretCreator: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

creatorSchema.virtual("weeklySubscriberGain").get(function () {
  return Math.round(this.subscriberGain / 52);
});

// 2) DOCUMENT MIDDLEWARE: runs before .save() and .create()
creatorSchema.pre("save", function () {
  this.slug = slugify(this.creatorName, { lower: true });
});

// 3) QUERY MIDDLEWARE: runs before any query starting with "find"
creatorSchema.pre(/^find/, function () {
  this.find({ isSecretCreator: { $ne: true } });
});

// 4) AGGREGATION MIDDLEWARE: runs before .aggregate()
creatorSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { isSecretCreator: { $ne: true } } });
});

const Creator = mongoose.model("Creator", creatorSchema);

module.exports = Creator;
