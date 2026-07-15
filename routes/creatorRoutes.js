const express = require("express");
const router = express.Router();
const creatorController = require("../controllers/creatorController");

router
  .route("/")
  .get(creatorController.getAllCreators)
  .post(creatorController.createCreator);

router
  .route("/:id")
  .patch(creatorController.updateCreator)
  .delete(creatorController.deleteCreator);

module.exports = router;
