const express = require("express");
const delay = require("../utils/delay")

const router = express.Router();

router.post("/v1/images/generations", async (req, res) => {
  const delayHeader = req.headers["x-set-response-delay-ms"]

  let delayTime = parseInt(delayHeader) || parseInt(process.env.RESPONSE_DELAY_MS) || 0

  await delay(delayTime)
  const { prompt, n } = req.body;

  // Check if 'prompt' is provided and is an array
  if (!prompt) {
    return res
      .status(400)
      .json({ error: 'Missing or invalid "prompt" in request body' });
  }

  let nn = n;
  if (!nn) {
    nn = 1;
  }
  if (nn > 10) {
    nn = 10;
  }
  const url =
    "https://images.unsplash.com/photo-1661956602926-db6b25f75947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1298&q=80";
  const imgs = [];
  for (let i = 0; i < nn; i++) {
    imgs.push(url);
  }
  const response = {
    created: Math.floor(Date.now() / 1000),
    data: imgs,
  };

  res.json(response);
});

module.exports = router;
