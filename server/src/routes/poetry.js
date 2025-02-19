const express = require("express");
const axios = require("axios");
const router = express.Router();

const STANDS4_BASE_URL = "http://www.stands4.com/services/v2/poetry.php";

router.get("/stands4", async (req, res) => {
  try {
    const params = {
      uid: process.env.STANDS4_UID,
      tokenid: process.env.STANDS4_TOKEN,
      term: req.query.term || "*",
      p: "poetry",
      format: "json",
      full: 1,
      md: 1, // Request markdown format which might include full text
    };

    console.log("STANDS4 Request:", {
      url: STANDS4_BASE_URL,
      params: {
        ...params,
        uid: "***",
        tokenid: "***",
      },
    });

    const response = await axios.get(STANDS4_BASE_URL, {
      params,
      timeout: 8000,
      headers: {
        Accept: "application/json",
        "User-Agent": "POiT Poetry Application",
      },
    });

    // Log the complete response structure
    console.log("STANDS4 Complete Response:", {
      status: response.status,
      headers: response.headers,
      data: JSON.stringify(response.data, null, 2),
    });

    res.json(response.data);
  } catch (error) {
    console.error("STANDS4 API error:", {
      message: error.message,
      response: error.response?.data,
      config: {
        url: error.config?.url,
        params: error.config?.params
          ? {
              ...error.config.params,
              uid: "***",
              tokenid: "***",
            }
          : null,
      },
    });

    res.status(error.response?.status || 500).json({
      error: "Failed to fetch from STANDS4",
      details: error.message,
    });
  }
});

module.exports = router;
