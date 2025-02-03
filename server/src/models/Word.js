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
    enum: ["noun", "verb", "adj", "adv"],
  },
  definition: {
    type: String,
  },
  examples: [
    {
      type: String,
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
  source: {
    type: String,
    enum: ["wordnik_wotd", "datamuse", "fallback"],
  },
  refreshedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Word", wordSchema);
