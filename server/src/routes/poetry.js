const express = require("express");
const router = express.Router();

router.get("/poetsorg", async (req, res) => {
  try {
    // Skip any external requests and just return the fallback poem
    const fallbackPoem = {
      title: "Do not go gentle into that good night",
      author: "Dylan Thomas",
      lines: [
        "Do not go gentle into that good night,",
        "Old age should burn and rave at close of day;",
        "Rage, rage against the dying of the light.",
        "",
        "Though wise men at their end know dark is right,",
        "Because their words had forked no lightning they",
        "Do not go gentle into that good night.",
        "",
        "Good men, the last wave by, crying how bright",
        "Their frail deeds might have danced in a green bay,",
        "Rage, rage against the dying of the light.",
        "",
        "Wild men who caught and sang the sun in flight,",
        "And learn, too late, they grieved it on its way,",
        "Do not go gentle into that good night.",
        "",
        "Grave men, near death, who see with blinding sight",
        "Blind eyes could blaze like meteors and be gay,",
        "Rage, rage against the dying of the light.",
        "",
        "And you, my father, there on the sad height,",
        "Curse, bless, me now with your fierce tears, I pray.",
        "Do not go gentle into that good night.",
        "Rage, rage against the dying of the light.",
      ],
      source: "fallback",
      year: "1947",
      refreshedAt: new Date().toISOString(),
    };

    console.log("Serving fallback poem");
    res.json(fallbackPoem);
  } catch (error) {
    console.error("Error serving fallback poem:", error.message);
    res.status(500).json({
      error: "Failed to serve poem",
      details: error.message,
    });
  }
});

module.exports = router;
