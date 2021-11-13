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
router.get("/account", ensureAuthenticated, (req, res) => {
  const query = new URLSearchParams({
    public: req.query.public,
    private: req.query.private,
  });
  res.redirect(`/api/messages/${req.user.name}?${query}`);
});

module.exports = router;
