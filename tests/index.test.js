const {app, setupApp} = require("../index");
const request = require("supertest");
const { performance } = require('perf_hooks');

describe("GET /", () => {
    beforeAll(async () => {
        await setupApp();
    });

    const startTime = performance.now();
    it("should return 200 and hello world response", async () => {
        const response = await request(app).get("/")
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Hello World! This is MockAI");
    });
    it ("should have a response time greater than 1000ms", async () => {
        const response = await request(app).get("/").set('x-set-response-delay-ms', '1000')
        expect(performance.now() - startTime).toBeGreaterThanOrEqual(1000);
    })
})

describe("Request to undefined route or method", () => {
    beforeAll(async () => {
        await setupApp();
    });
    it("should return 404 and Page not found response for GET", async () => {
        const response = await request(app).get("/undefined");
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe("Page not found");
    });
    it("should return 404 and Page not found response for POST", async () => {
        const response = await request(app).post("/post");
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe("Page not found");
    });
})