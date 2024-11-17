const {app, setupApp} = require("../index");
const request = require("supertest");

describe("POST /v1/embeddings", () => {
    beforeAll(async () => {
        await setupApp();
    });
    const reqBody = {
        model: "text-embedding-ada-002",
        input: "The food was delicious and the waiter...",
        encoding_format: "float",
    }

    //Happy Path and Response (normal)
    it("should return a valid response for a embeddings request", async () => {
        const response = await request(app)
            .post("/v1/embeddings")
            .set("Content-Type", "application/json")
            .send(reqBody);
        expect(response.statusCode).toBe(200);
        expect(response.type).toBe("application/json");
        expect(response.body.object).toBe("list");
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0].object).toBe("embedding");
        expect(response.body.data[0].embedding.length).toBe(1536);
    });

    //Bad Path and Response (missing input)
    it("should return a 400 response for a embeddings request with missing input", async () => {
        const response = await request(app)
            .post("/v1/embeddings")
            .set("Content-Type", "application/json")
            .send({...reqBody, input: undefined});
        expect(response.statusCode).toBe(400);
        expect(response.type).toBe("application/json");
        expect(response.body.error).toBe('Missing or invalid "input" in request body');
    });

})