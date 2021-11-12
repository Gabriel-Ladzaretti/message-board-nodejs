const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  title: {
    type: String,
    required: true,
  }, // String is shorthand for {type: String}
  author: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  // comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
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