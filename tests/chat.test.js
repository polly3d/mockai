const {app, setupApp} = require("../index");
const request = require("supertest");
const { performance } = require('perf_hooks');

describe("POST /v1/chat/completions", () => {
    beforeAll(async () => {
        await setupApp();
    });
    reqBody = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                role: "user",
                content: "Who won the world series in 2020?"
            }
        ],
        temperature: 0.7,
    }
    //Happy Path and Response (normal)
    const startTime = performance.now();
    it("should return a valid response for a chat completion request", async () => {
        const response = await request(app)
            .post("/v1/chat/completions")
            .set("Content-Type", "application/json")
            .set('x-set-response-delay-ms', '1000')
            .send(reqBody);
        expect(response.statusCode).toBe(200);
        expect(response.type).toBe("application/json");
        expect(response.body.object).toBe("chat.completion");
        expect(response.body.choices).toBeDefined();
        expect(response.body.choices.length).toBeGreaterThan(0);
        expect(performance.now() - startTime).toBeGreaterThanOrEqual(1000);
    });

    //Happy Path and Response (streaming)
    it("should return a valid response for a chat completion request with streaming", async () => {
        const response = await request(app)
            .post("/v1/chat/completions")
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
                expect(data).toHaveProperty('object', 'chat.completion.chunk');
                expect(data).toHaveProperty('created');
                expect(data).toHaveProperty('model');
                expect(data).toHaveProperty('choices');
            }
        });

        expect(response.text).toContain("data: [DONE]");
    }, 20000);

    // Bad Path and Response (missing messages)
    it("should return a 400 response for a chat completion request with missing messages", async () => {
        const response = await request(app)
            .post("/v1/chat/completions")
            .set("Content-Type", "application/json")
            .send({...reqBody, messages: undefined});
        expect(response.statusCode).toBe(400);
        expect(response.type).toBe("application/json");
        expect(response.body.error).toBe('Missing or invalid "messages" in request body');
    });
})