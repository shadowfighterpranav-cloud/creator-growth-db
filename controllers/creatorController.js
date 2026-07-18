const APIFeatures = require("../utils/apiFeatures");
const Creator = require("../models/creatorModel");
exports.getAllCreators = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: "fail",
      error: err.message,
    });
  }
};
exports.createCreator = async (req, res) => {
  try {
    const newCreator = await Creator.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        creator: newCreator,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      error: err,
    });
  }
};
exports.updateCreator = async (req, res) => {
  try {
    const updatedCreator = await Creator.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).json({
      status: "success",
      data: {
        creator: updatedCreator,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      error: err,
    });
  }
};

exports.deleteCreator = async (req, res) => {
  try {
    await Creator.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      error: err,
    });
  }
};
exports.aliasTopCreators = (req, res, next) => {
  req.query.limit = "3";
  req.query.sort = "-subscriberGain";
  req.query.fields = "creatorName,platform,subscriberGain";
  next();
};

exports.getCreatorStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: "fail",
      error: err.message,
    });
  }
};
