const express = require("express");
const { ensureAuthenticated } = require("../config/auth.config");
const Blog = require("../models/Blog.model");

const router = express.Router();

// /api/blog: GET, POST, DELETE
// /api/blog/:id: GET, PATCH, DELETE
// /api/blog/:id/comments: patch delete
// /api/blog/:id/comments/:_id delete

// Create and Save a new Blog
router.post("/", ensureAuthenticated, (req, res) => {
  if (!req.body.title || !req.body.body) {
    req.flash("error_msg", "Please fill all fields");
    res.redirect("/add");
    return;
  }

  // Create blog
  const blog = new Blog({
    title: req.body.title,
    author: req.user.name,
    body: req.body.body,
  });

  // Save blog
  blog
    .save()
    .then((data) => {
      req.flash("success_msg", "Blog Successfully Posted!");
      res.redirect("/api/blogs");
    })
    .catch((err) => {
      res.status(500).json({
        msg: err.message || "Error creating the blog.",
      });
    });
});

// Retrieve all Blogs from the database.
router.get("/", (req, res) => {
  Blog.find({})
    .lean()
    .exec(function (error, blogs) {
      if (error)
        res.status(500).json({
          msg: err.message || "Could not retrieve all Blogs.",
        });
      res.render("blogboard", { blogs });
    });
});

// Retrieve a single Blog with id
router.get("/:id", (req, res) => {
  const id = req.params.id;

  Blog.findById(id)
    .then((data) => {
      if (!data) res.status(404).json({ msg: "No Blog with id=" + id });
      else res.json(data);
    })
    .catch((err) => {
      res.status(500).json({ msg: `Error while retrieving Blog id=${id}` });
    });
});

// Update a Blog with id
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

  Blog.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Cannot update Blog id=${id}.`,
        });
      } else res.json({ msg: "Blog updated." });
    })
    .catch((err) => {
      res.status(500).json({
        msg: `Error updating Blog id=${id}`,
      });
    });
});

// Update Comments on Blog with id
router.patch("/:id/comments", (req, res) => {
  if (!req.body.comments) {
    return res.status(400).json({
      msg: "Comments can not be empty!",
    });
  }

  const id = req.params.id;
  Blog.findByIdAndUpdate(
    id,
    { $push: { comments: req.body.comments } },
    { useFindAndModify: false }
  )
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Cannot update comments on Blog id=${id}.`,
        });
      } else res.json({ msg: "Blog updated." });
    })
    .catch((err) => {
      res.status(500).json({
        msg: err.message || `Error updating Blog id=${id}`,
      });
    });
});

// Delete Comments on Blog with id
router.delete("/:id/comments", (req, res) => {
  const id = req.params.id;

  Blog.findByIdAndUpdate(
    id,
    { $set: { comments: [] } },
    { useFindAndModify: false }
  )
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Cannot delete comments on Blog id=${id}.`,
        });
      } else res.json({ msg: `Deleted comments on Blog id=${id}.` });
    })
    .catch((err) => {
      res.status(500).json({
        msg: err.message || `Error deleting comments on blog  id=${id}`,
      });
    });
});

// Delete Comment with given id on Blog with id
router.delete("/:id/comments/:_id", (req, res) => {
  const id = req.params.id;
  const _id = req.params._id;
  Blog.findByIdAndUpdate(
    id,
    { $pull: { comments: { _id: _id } } },
    { useFindAndModify: false }
  )
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Cannot delete comments on Blog id=${id}.`,
        });
      } else res.json({ msg: `Deleted comments on Blog id=${id}.` });
    })
    .catch((err) => {
      res.status(500).json({
        msg: err.message || `Error deleting comments on blog  id=${id}`,
      });
    });
});

// Delete a Blog with id
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        res.status(404).json({
          msg: `Blog post was not found!`,
        });
      } else {
        res.json({
          msg: "Blog post was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        msg: `Could not delete Blog id=${id}.`,
      });
    });
});

// Create a new Blog
router.delete("/", (req, res) => {
  Blog.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Blogs were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error occurred while removing Blogs.",
      });
    });
});

module.exports = router;
