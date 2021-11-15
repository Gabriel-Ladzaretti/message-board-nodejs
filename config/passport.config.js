const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypct = require("bcryptjs");

// Load User Model
const User = require("../models/User.model");

module.exports = function (passport) {
  // init passport with The local authentication strategy:
  // authenticates users using a username and password.

  passport.use(
    new LocalStrategy(
      // Options
      { usernameField: "email" },
      // verify callback
      (email, password, done) => {
        // Match User
        User.findOne({ email })
          .then((user) => {
            // No such User
            if (!user) {
              return done(null, false, {
                message: "That email is not registered",
              });
            }

            // User found, Match password
            bcrypct
              .compare(password, user.password)
              .then((match) => {
                if (match) return done(null, user);
                else
                  return done(null, false, { message: "Password incorrect" });
              })
              .catch((err) => {
                throw err;
              });
          })
          .catch((err) => console.log(err));
      }
    )
  );

  // In a typical web application, the credentials used to // authenticate a user will only be transmitted during
  // the login request. If authentication succeeds, a
  // session will be established and maintained via a
  // cookie set in the user's browser.

  // Each subsequent request will not contain credentials
  // but rather the unique cookie that identifies the
  // session. In order to support login sessions, Passport
  // will serialize and deserialize user instances to and
  // from the session.

  // In this example, only the user ID is serialized to the session.
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
