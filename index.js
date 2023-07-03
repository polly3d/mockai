require("dotenv").config();

const express = require("express");
const app = express();
const chatRoutes = require("./openAI/chat");
const textRoutes = require("./openAI/text");
const imgRoutes = require("./openAI/image");
const { load: loadRandomContents } = require("./utils/randomContents");

const start = async () => {
  await loadRandomContents();

  const port = process.env.SERVER_PORT || 5001;
  app.use(express.json());
  app.use(chatRoutes);
  app.use(textRoutes);
  app.use(imgRoutes);

  app.get("/", (req, res) => {
    res.send("Hello World! This is MockAI");
  });

  app.use(function (req, res) {
    res.status(404).send("Page not found");
  });

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
};

start();
