const express = require("express");
const { ensureAuthenticated } = require("../config/auth.config");
const router = express.Router();

// Welcome page
router.get("/", (req, res) => {
  res.render("welcome", {
    connected: req.user ? true : false,
    valid: req.user ? req.user.valid : false,
  });
});

// Add a messages
router.get("/add", ensureAuthenticated, (req, res) => {
  // check if validated user
  if (!req.user.valid) {
    req.flash("error_msg", "Please verify your account first!");
    res.redirect("/");
    return;
  }
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
