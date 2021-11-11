const Blog = require("../model/blog.model");

// Create and Save a new Blog
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).json({ msg: "Title must be included!" });
    return;
  }

  // Create blog
  const blog = new Blog({
    title: req.body.title,
    author: req.body.author,
    body: req.body.body,
  });

  // Save blog

  blog
    .save()
    .then((data) => res.json(data))
    .catch((err) => {
      res.status(500).json({
        msg: err.message || "Error creating the blog.",
      });
    });
};

// Retrieve all Blogs from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  const cond = title ? { title: { $regex: title, $options: "i" } } : {};

  Blog.find(cond)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json({
        msg: err.message || "Could not retrieve all Blogs.",
      });
    });
};

// Find a single Blog with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Blog.findById(id)
    .then((data) => {
      if (!data) res.status(404).json({ msg: "No Blog with id=" + id });
      else res.json(data);
    })
    .catch((err) => {
      res.status(500).json({ msg: `Error while retrieving Blog id=${id}` });
    });
};

// Update a Blog by the id in the request
exports.update = (req, res) => {
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
};

exports.updateComments = (req, res) => {
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
};

// Delete all comments in a given blog
exports.deleteComments = (req, res) => {
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
};

// Delete specific comment
exports.deleteComment = (req, res) => {
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
};

// Delete a Blog with the specified id in the request
exports.delete = (req, res) => {
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
};

// Delete all Blogs from the database.
exports.deleteAll = (req, res) => {
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
};
