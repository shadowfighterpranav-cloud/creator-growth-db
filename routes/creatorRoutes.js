const express = require("express");
const creatorController = require("../controllers/creatorController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, creatorController.getAllCreators)
  .post(creatorController.createCreator);

router
  .route("/:id")
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    creatorController.deleteCreator,
  );

module.exports = router;
