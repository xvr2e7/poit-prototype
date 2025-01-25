const express = require("express");
const router = express.Router();
const Word = require("../models/Word");

// Get all active words
router.get("/", async (req, res) => {
  try {
    const words = await Word.find({ isActive: true });
    res.json(words);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new word
router.post("/", async (req, res) => {
  const word = new Word({
    text: req.body.text,
    type: req.body.type,
  });

  try {
    const newWord = await word.save();
    res.status(201).json(newWord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Seed initial words
router.post("/seed", async (req, res) => {
  const initialWords = [
    { text: "microwave", type: "noun" },
    { text: "fidget", type: "verb" },
    { text: "sneaker", type: "noun" },
    { text: "grumpy", type: "adj" },
    { text: "buffering", type: "verb" },
    { text: "doorknob", type: "noun" },
    { text: "slouch", type: "verb" },
    { text: "glitch", type: "verb" },
    { text: "squeaky", type: "adj" },
    { text: "deadline", type: "noun" },
    { text: "crumple", type: "verb" },
    { text: "sticky", type: "adj" },
    { text: "upload", type: "verb" },
    { text: "awkward", type: "adj" },
    { text: "pixel", type: "noun" },
    { text: "sprint", type: "verb" },
    { text: "crispy", type: "adj" },
    { text: "coffee", type: "noun" },
    { text: "restless", type: "adj" },
    { text: "inbox", type: "noun" },
  ];

  try {
    await Word.deleteMany({}); // Clear existing words
    const words = await Word.insertMany(initialWords);
    res.status(201).json(words);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
