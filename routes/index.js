const express = require("express");
const fetch = require("node-fetch");
const { ensureAuthenticated } = require("../config/auth.config");
const router = express.Router();
const PORT = process.env.PORT || 5000;

// Welcome page
router.get("/", (req, res) => {
  res.render("welcome");
});

// Add a messages
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("addmessage", { username: req.user.name });
});

// Delete a messages
router.get("/delete", ensureAuthenticated, (req, res) => {
  res.redirect(`/api/messages?username=${req.user.name}`);
});

module.exports = router;
