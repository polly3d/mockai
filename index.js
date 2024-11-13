require("dotenv").config();

const express = require("express");
const morgan = require("morgan");

const app = express();
const requestId = require("./utils/requestId");
const chatRoutes = require("./openAI/chat");
const textRoutes = require("./openAI/text");
const imgRoutes = require("./openAI/image");
const embeddingRoutes = require("./openAI/embeddings");
const { load: loadRandomContents } = require("./utils/randomContents");
const delay = require("./utils/delay")
const { register, requestCounter, requestLatency, payloadSize } = require("./utils/metrics")


const start = async () => {
  await loadRandomContents();

  const port = process.env.SERVER_PORT || 5001;
  const req_limit = process.env.REQUEST_SIZE_LIMIT || "10kb";
  app.use(express.json({"limit": req_limit}));
  
  // Request Logger Configuration
  app.use(requestId);
  morgan.token('id', function getId(req) {
      return req.id
  });
  loggerFormat = ':id [:date[web]]" :method :url" :status :response-time ms'

  app.use(morgan(loggerFormat, {
    skip: function (req, res) {
        return res.statusCode < 400
    },
    stream: process.stderr
  }));
  app.use(morgan(loggerFormat, {
      skip: function (req, res) {
          return res.statusCode >= 400
      },
      stream: process.stderr
  }));

  app.use(chatRoutes);
  app.use(textRoutes);
  app.use(imgRoutes);
  app.use(embeddingRoutes);

  app.get("/", async (req, res) => {
    then = Date.now();
    const delayHeader = req.headers["x-set-response-delay-ms"]

  let delayTime = parseInt(delayHeader) || parseInt(process.env.RESPONSE_DELAY_MS) || 0

  await delay(delayTime)

  requestCounter.inc({ method: "GET", path: "/", status: res.statusCode });
  requestLatency.observe({ method: "GET", path: "/", status: 200 }, (Date.now() - then));
  payloadSize.observe({ method: "GET", path: "/", status: 200 }, req.socket.bytesRead);
  res.send("Hello World! This is MockAI");
  });

  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });

  app.use(function (req, res) {
    then = Date.now();
    requestCounter.inc({ method: req.method, path: req.path, status: 404 });
    requestLatency.observe({ method: req.method, path: req.path, status: 404 }, (Date.now() - then));
    payloadSize.observe({ method: req.method, path: req.path, status: 404 }, req.socket.bytesRead);
    res.status(404).send("Page not found");
  });

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
};

start();
