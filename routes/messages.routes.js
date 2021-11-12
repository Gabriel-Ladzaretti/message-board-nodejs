const express = require("express");
const { ensureAuthenticated } = require("../config/auth.config");
const Message = require("../models/Message.model");

const router = express.Router();

// /api/message: GET, POST, DELETE
// /api/message/:id: GET, PATCH, DELETE

// Create and Save a new Message
router.post("/", ensureAuthenticated, (req, res) => {
  if (!req.body.title || !req.body.body) {
    req.flash("error_msg", "Please fill all fields");
    res.redirect("/add");
    return;
  }

  // Create Message
  const message = new Message({
    title: req.body.title,
    author: req.user.name,
    body: req.body.body,
    color: req.body.color,
  });

  // Save Message
  message
    .save()
    .then((data) => {
      req.flash("success_msg", "Message Successfully Posted!");
      res.redirect("/api/messages");
    })
    .catch((err) => {
      res.status(500).json({
        msg: err.message || "Error creating the Message.",
      });
    });
});

// Retrieve all Messages from the database.
router.get("/", (req, res) => {
  const username = req.query.username;
  const cond = username ? { author: { $regex: username, $options: "i" } } : {};
  Message.find(cond)
    .lean()
    .exec(function (error, messages) {
      if (error)
        res.status(500).json({
          msg: err.message || "Could not retrieve all Messages.",
        });
      res.render("messageboard", {
        messages: messages.reverse(),
        username: username,
      });
    });
});

// Delete a Message with a given id
router.delete("/:id", ensureAuthenticated, (req, res) => {
  const id = req.params.id;
  Message.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Message post was not found!`,
        });
      } else {
        req.flash("success_msg", "Message successfuly deleted!");
        res.redirect(`/api/messages?username=${req.user.name}`);
      }
    })
    .catch((err) => {
      res.status(500).json({
        msg: `Could not delete Message id=${id}.`,
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
