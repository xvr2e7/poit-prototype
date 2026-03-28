const serverless = require("serverless-http");
require("dotenv").config();

const app = require("../server/src/app");

module.exports = async (req, res) => {
  return serverless(app)(req, res);
};
