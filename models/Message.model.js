const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  private: {
    type: Boolean,
    required: true,
  },
  reviewed: {
    type: Boolean,
    required: true,
    default: false,
  },
  // comments: [{ body: String, date: Date }],
  created: { type: String, default: () => new Date(Date.now()).toString() },
  hidden: Boolean,
  color: { type: String, required: true },
  // meta: {
  //   votes: Number,
  //   favs: Number,
  // },
});

messageSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Message", messageSchema);
