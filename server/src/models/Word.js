const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["noun", "verb", "adj"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Word", wordSchema);
