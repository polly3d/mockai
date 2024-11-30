const request = require("supertest");
const {app, setupApp} = require("../index");

describe("Batch API", () => {
    beforeAll(async () => {
        await setupApp();
    });

    describe("POST /v1/batch", () => {
        it("should create a batch processing job", async () => {
            const response = await request(app)
                .post("/v1/batch")
                .send({
                    operations: [
                        {
                            operation: "embeddings",
                            parameters: {
                                model: "text-embedding-ada-002",
                                input: "Hello world"
                            }
                        },
                        {
                            operation: "chat.completions",
                            parameters: {
                                model: "gpt-3.5-turbo",
                                messages: [{ role: "user", content: "Hello!" }]
                            }
                        }
                    ]
                });

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                object: "batch",
                status: "running",
                total_operations: 2,
                completed_operations: 0
            });
            expect(response.body.id).toMatch(/^batch_/);
            expect(Array.isArray(response.body.operations)).toBe(true);
            expect(response.body.operations.length).toBe(2);
        });

        it("should return error for empty operations array", async () => {
            const response = await request(app)
                .post("/v1/batch")
                .send({
                    operations: []
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.type).toBe("invalid_request_error");
        });

        it("should return error for invalid operation", async () => {
            const response = await request(app)
                .post("/v1/batch")
                .send({
                    operations: [
                        {
                            // Missing required fields
                            invalid: true
                        }
                    ]
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.type).toBe("invalid_request_error");
        });
    });

    describe("GET /v1/batch/:batch_id", () => {
        it("should retrieve batch status", async () => {
            // First create a batch
            const createResponse = await request(app)
                .post("/v1/batch")
                .send({
                    operations: [
                        {
                            operation: "embeddings",
                            parameters: {
                                model: "text-embedding-ada-002",
                                input: "Hello world"
                            }
                        }
                    ]
                });

            const batchId = createResponse.body.id;

            const response = await request(app)
                .get(`/v1/batch/${batchId}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(batchId);
            expect(response.body.object).toBe("batch");
            expect(typeof response.body.status).toBe("string");
        });

        it("should return 404 for non-existent batch", async () => {
            const response = await request(app)
                .get("/v1/batch/nonexistent_batch");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("POST /v1/batch/:batch_id/cancel", () => {
        it("should cancel a running batch", async () => {
            // First create a batch
            const createResponse = await request(app)
                .post("/v1/batch")
                .send({
                    operations: [
                        {
                            operation: "embeddings",
                            parameters: {
                                model: "text-embedding-ada-002",
                                input: "Hello world"
                            }
                        }
                    ]
                });

            const batchId = createResponse.body.id;

            const response = await request(app)
                .post(`/v1/batch/${batchId}/cancel`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(batchId);
            expect(response.body.status).toBe("cancelled");
            expect(response.body.finished_at).toBeDefined();
        });

        it("should return 404 for non-existent batch", async () => {
            const response = await request(app)
                .post("/v1/batch/nonexistent_batch/cancel");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /v1/batch/:batch_id/events", () => {
        it("should list batch events", async () => {
            // First create a batch
            const createResponse = await request(app)
                .post("/v1/batch")
                .send({
                    operations: [
                        {
                            operation: "embeddings",
                            parameters: {
                                model: "text-embedding-ada-002",
                                input: "Hello world"
                            }
                        }
                    ]
                });

            const batchId = createResponse.body.id;

            const response = await request(app)
                .get(`/v1/batch/${batchId}/events`);

            expect(response.status).toBe(200);
            expect(response.body.object).toBe("list");
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].object).toBe("batch.event");
        });

        it("should return 404 for non-existent batch events", async () => {
            const response = await request(app)
                .get("/v1/batch/nonexistent_batch/events");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        it("should respect limit parameter", async () => {
            // First create a batch
            const createResponse = await request(app)
                .post("/v1/batch")
                .send({
                    operations: [
                        {
                            operation: "embeddings",
                            parameters: {
                                model: "text-embedding-ada-002",
                                input: "Hello world"
                            }
                        }
                    ]
                });

            const batchId = createResponse.body.id;

            const response = await request(app)
                .get(`/v1/batch/${batchId}/events`)
                .query({ limit: 1 });

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBeLessThanOrEqual(1);
        });
    });
});
