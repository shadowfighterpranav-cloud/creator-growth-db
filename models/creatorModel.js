const mongoose = require("mongoose");
const creatorSchema = new mongoose.Schema({
  creatorName: {
    type: String,
    required: [true, "A creator must have a name"],
    unique: true,
    trim: true,
  },
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
    required: [true, "An approximate subscriber or follower gain is required"],
  },
  difficultyLevel: {
    type: String,
    required: [true, "An execution difficulty level is required"],
    enum: ["Easy", "Medium", "Hard"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Creator = mongoose.model("Creator", creatorSchema);

module.exports = Creator;
