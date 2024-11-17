const {app, setupApp} = require("../index");
const request = require("supertest");
const { performance } = require('perf_hooks');

describe("POST /v1/completions", () => {
    beforeAll(async () => {
        await setupApp();
    });
    reqBody = {
        model: "text-davinci-003",
        prompt: "What is the best programming language?",
        stream: false,
    }
    //Happy Path and Response (normal)
    const startTime = performance.now();
    it("should return a valid response for a text completion request", async () => {
        const response = await request(app)
            .post("/v1/completions")
            .set('x-set-response-delay-ms', '1000')
            .set("Content-Type", "application/json")
            .send(reqBody);
        expect(response.statusCode).toBe(200);
        expect(response.type).toBe("application/json");
        expect(response.body.object).toBe("text_completion");
        expect(response.body.choices).toBeDefined();
        expect(response.body.choices.length).toBeGreaterThan(0);
        expect(performance.now() - startTime).toBeGreaterThanOrEqual(1000);
    });
    //Happy Path and Response (streaming)
    it("should return a valid response for a text completion request with streaming", async () => {
        const response = await request(app)
            .post("/v1/completions")
            .set("Content-Type", "application/json")
            .send({...reqBody, stream: true});
        expect(response.statusCode).toBe(200);
        expect(response.type).toBe("text/event-stream");
        const lines = response.text.split('\n');
        const dataLines = lines.filter(line => line.startsWith('data: '));
        
        expect(dataLines.length).toBeGreaterThan(0);
        
        dataLines.forEach(line => {
            if (line !== 'data: [DONE]') {
                const jsonStr = line.replace('data: ', '');
                expect(() => JSON.parse(jsonStr)).not.toThrow();
                const data = JSON.parse(jsonStr);
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('object', 'text_completion');
                expect(data).toHaveProperty('created');
                expect(data).toHaveProperty('model');
                expect(data).toHaveProperty('choices');
                expect(data.choices[0]).toHaveProperty('finish_reason');
            }
        });

        expect(response.text).toContain("data: [DONE]");
    }, 20000);
    //Bad Path and Response (missing prompt)
    it("should return a 400 response for a text completion request with missing prompt", async () => {
        const response = await request(app)
            .post("/v1/completions")
            .set("Content-Type", "application/json")
            .send({...reqBody, prompt: undefined});
        expect(response.statusCode).toBe(400);
        expect(response.type).toBe("application/json");
        expect(response.body.error).toBe('Missing or invalid "prompt" in request body');
    });
});