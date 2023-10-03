const express = require("express");
const router = express.Router();

router.post("/v1/embeddings", (req, res) => {
    const {
        model,
        input
    } = req.body;
    if (!input) {
        return res
            .status(400)
            .json({ error: 'Missing or invalid "input" in request body' });
    }
    if (!model) {
        return res
            .status(400)
            .json({ error: 'Missing or invalid "model" in request body' });
    }

    const embeddingArray = [];

    for (let j = 0; j < 1536; j++) {
        embeddingArray.push(Math.random())
    }

    const response = {
        object: "list",
        data: [
            {
                object: "embedding",
                index: 0,
                embedding: embeddingArray
            }
        ],
        model: model,
        usage: {
            prompt_tokens: 5,
            total_tokens: 5
        }
    };
    res.json(response);
});

module.exports = router;
