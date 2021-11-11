const express = require("express");
const blog = require("../controller/blog.controller");
const router = express.Router();

// /api/blog: GET, POST, DELETE
// /api/blog/:id: GET, PATCH, DELETE
// /api/blog/:id/comments: patch delete
// /api/blog/:id/comments/:_id delete

// Create a new Blog
router.post("/", blog.create);

// Retrieve all Blogs
router.get("/", blog.findAll);

// Retrieve a single Blog with id
router.get("/:id", blog.findOne);

// Update a Blog with id
router.patch("/:id", blog.update);

// Update Comments on Blog with id
router.patch("/:id/comments", blog.updateComments);

// Delete Comments on Blog with id
router.delete("/:id/comments", blog.deleteComments);

// Delete Comment with given id on Blog with id
router.delete("/:id/comments/:_id", blog.deleteComment);

// Delete a Blog with id
router.delete("/:id", blog.delete);

// Create a new Blog
router.delete("/", blog.deleteAll);

module.exports = router;
