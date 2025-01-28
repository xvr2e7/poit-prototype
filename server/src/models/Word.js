const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wordSchema = new Schema({
  text: {
    type: String,
    required: true,
    unique: true,
  },
  score: {
    type: Number,
    default: 0,
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

// Export the model directly
const Word = mongoose.model("Word", wordSchema);
module.exports = Word;
