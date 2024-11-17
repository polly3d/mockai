const {app, setupApp} = require("../index");
const request = require("supertest");
const { performance } = require('perf_hooks');

describe("POST /v1/images/generations", () => {
    beforeAll(async () => {
        await setupApp();
    });
    const reqBody = {
        prompt: "a cat sitting on a couch",
        n: 1,
        size: "1024x1024",
        model: "dall-e-3",
    }
    // Happy Path and Response (normal). Check n is equalt to 1 or not.
    it("should return a valid response for a image generation request", async () => {
        const response = await request(app)
            .post("/v1/images/generations")
            .set("Content-Type", "application/json")
            .send(reqBody);
        expect(response.statusCode).toBe(200);
        expect(response.type).toBe("application/json");
        expect(response.body.data.length).toBeGreaterThan(0);
        for (let i=0; i<response.body.data.length; i++) {
            expect(response.body.data[i]).toHaveProperty("revised_prompt");
            expect(response.body.data[i]).toHaveProperty("data");
            expect(response.body.data[i].data.length).toBeGreaterThan(0);
        }
    })
    //Bad Path and Response (missing prompt)
    it("should return a 400 response for a image generation request with missing prompt", async () => {
        const response = await request(app)
            .post("/v1/images/generations")
            .set("Content-Type", "application/json")
            .send({...reqBody, prompt: undefined});
        expect(response.statusCode).toBe(400);
        expect(response.type).toBe("application/json");
        expect(response.body.error).toBe('Missing or invalid "prompt" in request body');
    });
});