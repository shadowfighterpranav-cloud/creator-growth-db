const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const router = express.Router();

// Middleware that checks if a user is logged in to update header UI
router.use(authController.isLoggedIn);

// View Routes
router.get("/", viewController.getOverview);
router.get("/creator/:slug", viewController.getCreator);
router.get("/login", viewController.getLoginForm);
router.get("/me", authController.protect, viewController.getAccount);

module.exports = router;
