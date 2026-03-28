require("dotenv").config();

const app = require("./app");

const startServer = async () => {
  const port = process.env.PORT || 5001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
