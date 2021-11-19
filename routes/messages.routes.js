const express = require("express");
const { ensureAuthenticated } = require("../config/auth.config");
const Message = require("../models/Message.model");

const router = express.Router();

// /api/message: GET, POST, DELETE
// /api/message/:username GET
// /api/message/:id: GET, PATCH, DELETE

// Create and Save a new Message
router.post("/", ensureAuthenticated, (req, res) => {
  if (!req.body.title || !req.body.body) {
    req.flash("error_msg", "Please fill all fields");
    res.redirect("/add");
    return;
  }
  const private = req.body.private;

  // Create Message
  const message = new Message({
    title: req.body.title,
    author: req.user.name,
    private: req.body.private ? true : false,
    body: req.body.body,
    color: req.body.color,
    created: new Date(Date.now()).toString(),
  });

  // Save Message
  message
    .save()
    .then((data) => {
      req.flash(
        "success_msg",
        `${
          req.body.private ? "Private" : "Public"
        } message successfully created!`
      );
      if (!req.body.private)
        req.flash(
          "error_msg",
          "Message will be reviewed before getting posted."
        );
      // Redirect to user's private/public messages
      res.redirect(
        private
          ? `/api/messages/${req.user.name}?public=false&private=true`
          : `/api/messages/${req.user.name}?public=true&private=false`
      );
    })
    .catch((err) => {
      res.status(500).json({
        msg: err.message || "Error creating the Message.",
      });
    });
});

// Retrieve all public Messages from the database.
router.get("/", (req, res) => {
  Message.find({ private: false, reviewed: true })
    .lean()
    .exec(function (error, messages) {
      if (error)
        res.status(500).json({
          msg: err.message || "Could not retrieve all Messages.",
        });
      res.render("messageboard", {
        messages: messages.reverse(),
        title: "PUBLIC MESSAGE BOARD",
        // username: req.user ? req.user.name : undefined,
        username: req.user && req.user.name,
        verifiedUser: req.user && req.user.valid,
        enableDelete: false,
      });
    });
});

// Retrieve all user messages from the database.
router.get("/:username", ensureAuthenticated, (req, res) => {
  const username = req.params.username;
  const private = req.query.private === "true" && true;
  const public = req.query.public === "true" && true;

  // route protection
  if (username !== req.user.name) {
    res.status(403).send({ msg: "Forbidden" });
    return;
  }

  // const cond = username ? { author: { $regex: username, $options: "i" } } : {};

  // Build db query condition
  const cond = private && public ? { $in: [true, false] } : private;

  let title;
  if (private && public) {
    title = "ALL YOUR MESSAGES";
  } else if (private && !public) {
    title = "YOUR PRIVATE MESSAGES";
  } else {
    title = "YOUR PUBLIC MESSAGES";
  }

  let query = { author: username, private: cond };
  let enableReview = false;

  // ADMIN account
  if (username === process.env.ADMIN) {
    if (private && public) {
      // ALL PUBLISHED PUBLIC MESSAGES
      title = "ALL PUBLISHED PUBLIC MESSAGES";
      enableReview = false;
      query = { reviewed: true, private: false };
    } else if (private && !public) {
      // YOUR PRIVATE MESSAGES"
    } else {
      // UNPUBLISHED PUBLIC MESSAGES
      title = "UNPUBLISHED PUBLIC MESSAGES";
      enableReview = true;
      query = { reviewed: false, private: false };
    }
  }

  Message.find(query)
    .lean()
    .exec(function (error, messages) {
      if (error)
        res.status(500).json({
          msg: err.message || "Could not retrieve all Messages.",
        });
      res.render("messageboard", {
        messages: messages.reverse(),
        username: username,
        verifiedUser: req.user && req.user.valid,
        title,
        enableDelete: true,
        enableReview,
      });
    });
});

// Delete a Message with a given id
router.delete("/:id", ensureAuthenticated, (req, res) => {
  const id = req.params.id;

  Message.findById(id)
    .then((data) => {
      // route protection
      if (
        !(data.author === req.user.name || req.user.name === process.env.ADMIN)
      ) {
        res.status(403).send({ msg: "Forbidden" });
        return;
      }
      Message.findByIdAndRemove(id)
        .then((data) => {
          if (!data) {
            res.status(404).json({
              msg: `Message post was not found!`,
            });
          } else {
            req.flash("success_msg", "Message successfuly deleted!");
            res.redirect("back");
          }
        })
        .catch((err) => {
          res.status(500).json({
            msg: `Could not delete Message id=${id}.`,
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Publish unreviewed message
router.post("/:id", ensureAuthenticated, (req, res) => {
  const id = req.params.id;
  Message.findByIdAndUpdate(id, { reviewed: true })
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Message post was not found!`,
        });
      } else {
        req.flash("success_msg", "Messages Published!");
        res.redirect("back");
      }
    })
    .catch((err) => {
      res.status(500).json({
        msg: `Could not publish Message id=${id}.`,
      });
    });
});

// Update a Message with a given id
router.patch("/:id", ensureAuthenticated, (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      msg: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  Message.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Cannot update Message id=${id}.`,
        });
      } else res.json({ msg: "Message updated." });
    })
    .catch((err) => {
      res.status(500).json({
        msg: `Error updating Message id=${id}`,
      });
    });
});

module.exports = router;
