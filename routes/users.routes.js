const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth.config");
// User model
const User = require("../models/User.model");

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

  // RFC2822 email regex validation
  const re =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

  const validateEmail = (mail) => re.test(mail);

  if (!validateEmail(email)) {
    errors.push({ msg: "Please enter a valid email." });
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
        const code = crypto.randomBytes(16).toString("hex");
        const user = new User({
          name,
          email: email.toLowerCase(),
          password,
          code,
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
                // Email validation email
                const emailCredentials = require("../config/email.config");
                const auth = {
                  email: emailCredentials.MAIL_USER,
                  password: emailCredentials.MAIL_PASS,
                };
                const emailSender = require("../utils/create-mailer")(
                  {
                    name: "msg-board - noreply",
                    address: auth.email,
                  },
                  auth
                );
                emailSender(
                  email,
                  "Welcome to Message-Board",
                  `Please verify your email by following the given link: ${
                    req.protocol
                  }://${req.get("host")}/users/login?code=${code}`
                );
                req.flash(
                  "success_msg",
                  `You are now registered and can login.`
                );
                req.flash(
                  "error_msg",
                  `Account verification link has been sent to your email.`
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

// User verification
router.get("/verify", ensureAuthenticated, (req, res) => {
  // Find current user in db
  User.findOne({ email: req.user.email }).then((user) => {
    // User already verified
    if (user.valid) res.redirect("/api/messages");
    // Verify user
    else if (user.code === req.query.code) {
      // Codes match, update user profile
      User.findOneAndUpdate({ email: req.user.email }, { valid: true }).then(
        (user) => {
          req.flash(
            "success_msg",
            "Email verification complete, You can now create messages."
          );
          res.redirect("/api/messages");
        }
      );
    } else {
      // Codes does not match
      req.flash("error_msg", "Invalid Request.");
      res.redirect("/users/login");
    }
  });
});

// Login Page
router.get("/login", (req, res) => {
  if (req.user && req.query.code)
    res.redirect(`/users/verify?code=${req.query.code}`);
  else res.render("login", { code: req.query.code });
});

// Login Handle
router.post("/login", emailToLowerCase, (req, res, next) => {
  const code = req.query.code;
  passport.authenticate("local", {
    successRedirect: code ? `/users/verify?code=${code}` : "/api/messages",
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
