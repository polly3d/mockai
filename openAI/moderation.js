const express = require("express");
const router = express.Router();
const delay = require("../utils/delay");

router.post("/v1/moderations", async (req, res) => {
  const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
  await delay(delayTime);
  
  const input = req.body.input;
  let inputs = Array.isArray(input) ? input : [input];

  const results = inputs.map(text => ({
    flagged: Math.random() > 0.7, // Random flagging
    categories: {
      "harassment": false,
      "harassment/threatening": false,
      "hate": false,
      "hate/threatening": false,
      "self-harm": false,
      "self-harm/intent": false,
      "self-harm/instructions": false,
      "sexual": false,
      "sexual/minors": false,
      "violence": false,
      "violence/graphic": false
    },
    category_scores: {
      "harassment": Math.random(),
      "harassment/threatening": Math.random(),
      "hate": Math.random(),
      "hate/threatening": Math.random(),
      "self-harm": Math.random(),
      "self-harm/intent": Math.random(),
      "self-harm/instructions": Math.random(),
      "sexual": Math.random(),
      "sexual/minors": Math.random(),
      "violence": Math.random(),
      "violence/graphic": Math.random()
    }
  }));

  res.json({
    id: "modr-" + Math.random().toString(36).substr(2, 9),
    model: "text-moderation-latest",
    results: results
  });
});

module.exports = router;
