const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Viewers = new Schema({
  _id: {
    type: String,
    required: true,
  },
    viewer: {
    type: Number,
    required: true,
    }
});

const viewers = mongoose.model("viewers", Viewers);

module.exports = viewers;