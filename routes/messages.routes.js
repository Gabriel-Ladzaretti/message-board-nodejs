const express = require("express");
const { ensureAuthenticated } = require("../config/auth.config");
const Message = require("../models/Message.model");

const router = express.Router();

// /api/message: GET, POST, DELETE
// /api/message/:id: GET, PATCH, DELETE
// /api/message/:id/comments: patch delete
// /api/message/:id/comments/:_id delete

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
  console.log(username);
  const cond = username ? { author: { $regex: username, $options: "i" } } : {};
  Message.find(cond)
    .lean()
    .exec(function (error, messages) {
      if (error)
        res.status(500).json({
          msg: err.message || "Could not retrieve all Messages.",
        });
      res.render("Messageboard", { messages: messages.reverse() });
    });
});

// Retrieve a single Message with id
router.get("/:id", (req, res) => {
  const id = req.params.id;

  Message.findById(id)
    .then((data) => {
      if (!data) res.status(404).json({ msg: "No Message with id=" + id });
      else res.json(data);
    })
    .catch((err) => {
      res.status(500).json({ msg: `Error while retrieving Message id=${id}` });
    });
});

// Update a Message with id
router.patch("/:id", (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      msg: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  // prevent comments from being overwritten
  if (req.body.comments) {
    delete req.body.comments;
  }

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

// Update Comments on Message with id
router.patch("/:id/comments", (req, res) => {
  if (!req.body.comments) {
    return res.status(400).json({
      msg: "Comments can not be empty!",
    });
  }

  const id = req.params.id;
  Message.findByIdAndUpdate(
    id,
    { $push: { comments: req.body.comments } },
    { useFindAndModify: false }
  )
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Cannot update comments on Message id=${id}.`,
        });
      } else res.json({ msg: "Message updated." });
    })
    .catch((err) => {
      res.status(500).json({
        msg: err.message || `Error updating Message id=${id}`,
      });
    });
});

// Delete Comments on Message with id
router.delete("/:id/comments", (req, res) => {
  const id = req.params.id;

  Message.findByIdAndUpdate(
    id,
    { $set: { comments: [] } },
    { useFindAndModify: false }
  )
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Cannot delete comments on Message id=${id}.`,
        });
      } else res.json({ msg: `Deleted comments on Message id=${id}.` });
    })
    .catch((err) => {
      res.status(500).json({
        msg: err.message || `Error deleting comments on Message  id=${id}`,
      });
    });
});

// Delete Comment with given id on Message with id
router.delete("/:id/comments/:_id", (req, res) => {
  const id = req.params.id;
  const _id = req.params._id;
  Message.findByIdAndUpdate(
    id,
    { $pull: { comments: { _id: _id } } },
    { useFindAndModify: false }
  )
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Cannot delete comments on Message id=${id}.`,
        });
      } else res.json({ msg: `Deleted comments on Message id=${id}.` });
    })
    .catch((err) => {
      res.status(500).json({
        msg: err.message || `Error deleting comments on Message  id=${id}`,
      });
    });
});

// Delete a Message with id
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  Message.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Message post was not found!`,
        });
      } else {
        res.json({
          msg: "Message post was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        msg: `Could not delete Message id=${id}.`,
      });
    });
});

// Create a new Message
router.delete("/", (req, res) => {
  Message.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Messages were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error occurred while removing Messages.",
      });
    });
});

module.exports = router;
