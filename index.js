require("dotenv").config();

const express = require("express");
const app = express();
const chatRoutes = require("./openAI/chat");
const { load: loadRandomContents } = require("./utils/randomContents");

const start = async () => {
  await loadRandomContents();

  const port = process.env.SERVER_PORT || 5001;
  app.use(express.json());
  app.use(chatRoutes);

  app.get("/", (req, res) => {
    res.send("Hello World! This is MockAI");
  });

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
};

start();
