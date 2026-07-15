const Creator = require("../models/creatorModel");
exports.getAllCreators = async (req, res) => {
  try {
    //Basic filtering
    let queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    //Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log("PARSED QUERY OBJ:", JSON.parse(queryStr));
    let query = Creator.find(JSON.parse(queryStr));
    //Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
    //Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const creators = await query;
    res.status(200).json({
      status: "success",
      results: creators.length,
      data: {
        creators,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      error: err,
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
