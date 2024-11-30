const express = require("express");
const router = express.Router();
const delay = require("../utils/delay");

// List models
router.get("/v1/models", async (req, res) => {
  const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
  await delay(delayTime);
  
  const models = [
    {
      id: "gpt-4",
      created: 1687882410,
      object: "model",
      owned_by: "openai",
    },
    {
      id: "gpt-4-0613",
      created: 1686744178,
      object: "model",
      owned_by: "openai",
    },
    {
      id: "gpt-3.5-turbo",
      created: 1677649963,
      object: "model",
      owned_by: "openai",
    },
    {
      id: "dall-e-3",
      created: 1698785189,
      object: "model",
      owned_by: "openai",
    },
    {
      id: "whisper-1",
      created: 1677532384,
      object: "model",
      owned_by: "openai",
    }
  ];

  res.json({
    object: "list",
    data: models
  });
});

// Retrieve model
router.get("/v1/models/:model", async (req, res) => {
  const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
  await delay(delayTime);
  
  const modelId = req.params.model;
  const modelData = {
    id: modelId,
    created: Math.floor(Date.now() / 1000) - 10000,
    object: "model",
    owned_by: "openai",
  };

  res.json(modelData);
});

module.exports = router;
