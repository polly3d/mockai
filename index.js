require("dotenv").config();

const express = require("express");
const app = express();
const chatRoutes = require("./openAI/chat");
const textRoutes = require("./openAI/text");
const imgRoutes = require("./openAI/image");
const embeddingRoutes = require("./openAI/embeddings");
const { load: loadRandomContents } = require("./utils/randomContents");
const delay = require("./utils/delay")


const start = async () => {
  await loadRandomContents();

  const port = process.env.SERVER_PORT || 5001;
  const req_limit = process.env.REQUEST_SIZE_LIMIT || "10kb";
  app.use(express.json({"limit": req_limit}));
  app.use(chatRoutes);
  app.use(textRoutes);
  app.use(imgRoutes);
  app.use(embeddingRoutes);

  app.get("/", async (req, res) => {
    const delayHeader = req.headers["x-set-response-delay-ms"]

  let delayTime = parseInt(delayHeader) || 0

  await delay(delayTime)
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
