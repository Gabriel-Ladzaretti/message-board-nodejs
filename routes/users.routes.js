const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// User model
const User = require("../models/User.model");

// Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

// Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

// Register Handle
router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be atleast 6 characters" });
  }

  // Check username
  const username = await User.findOne({ name });
  if (username) errors.push({ msg: "Username taken, Please try another one." });

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // Validation Pass
    User.findOne({ email: email.toLowerCase() }).then((user) => {
      if (user) {
        // User exists
        errors.push({ msg: "Email is aleady registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const user = new User({
          name,
          email: email.toLowerCase(),
          password,
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            // Set password to hashed
            if (err) throw err;
            user.password = hash;
            // Save User
            user
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

function emailToLowerCase(req, res, next) {
  req.body.email = req.body.email.toLowerCase();
  next();
}
// Login Handle
router.post("/login", emailToLowerCase, (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/api/messages",
    failureRedirect: "/users/login",
    badRequestMessage:
      "Missing credentials, Please enter your Email and password.",
    failureFlash: true,
  })(req, res, next);
});

// Logout Handle
router.get("/logout", (req, res) => {
  if (req.user) {
    req.logout();
    req.flash("success_msg", "You are logged out.");
    res.redirect("/users/login");
  } else {
    req.flash("error_msg", "Please login first.");
    res.redirect("back");
  }
});
module.exports = router;
