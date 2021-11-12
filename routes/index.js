const express = require("express");
const fetch = require("node-fetch");
const { ensureAuthenticated } = require("../config/auth.config");
const router = express.Router();
const PORT = process.env.PORT || 5000;

// Welcome page
router.get("/", (req, res) => {
  res.render("welcome");
});

// Add page
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("addblog", { username: req.user.name });
});

// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { username: req.user.name });
});

module.exports = router;
