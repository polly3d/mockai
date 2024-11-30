const request = require("supertest");
const {app, setupApp} = require("../index");

describe("Fine-tuning API", () => {
    beforeAll(async () => {
        await setupApp();
    });

    describe("POST /v1/fine_tuning/jobs", () => {
        it("should create a fine-tuning job", async () => {
            const response = await request(app)
                .post("/v1/fine_tuning/jobs")
                .send({
                    model: "gpt-3.5-turbo",
                    training_file: "file-abc123",
                    hyperparameters: {
                        n_epochs: 3
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                object: "fine_tuning.job",
                model: "gpt-3.5-turbo",
                training_file: "file-abc123",
                status: "running"
            });
            expect(response.body.id).toMatch(/^ftjob_/);
        });

        it("should return error for missing required fields", async () => {
            const response = await request(app)
                .post("/v1/fine_tuning/jobs")
                .send({
                    model: "gpt-3.5-turbo"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.type).toBe("invalid_request_error");
        });
    });

    describe("GET /v1/fine_tuning/jobs", () => {
        it("should list fine-tuning jobs", async () => {
            // First create a job
            await request(app)
                .post("/v1/fine_tuning/jobs")
                .send({
                    model: "gpt-3.5-turbo",
                    training_file: "file-abc123"
                });

            const response = await request(app)
                .get("/v1/fine_tuning/jobs");

            expect(response.status).toBe(200);
            expect(response.body.object).toBe("list");
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it("should respect limit parameter", async () => {
            // Create multiple jobs
            await request(app)
                .post("/v1/fine_tuning/jobs")
                .send({
                    model: "gpt-3.5-turbo",
                    training_file: "file-abc123"
                });

            await request(app)
                .post("/v1/fine_tuning/jobs")
                .send({
                    model: "gpt-3.5-turbo",
                    training_file: "file-def456"
                });

            const response = await request(app)
                .get("/v1/fine_tuning/jobs")
                .query({ limit: 1 });

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
        });
    });

    describe("GET /v1/fine_tuning/jobs/:job_id", () => {
        it("should retrieve a specific fine-tuning job", async () => {
            // First create a job
            const createResponse = await request(app)
                .post("/v1/fine_tuning/jobs")
                .send({
                    model: "gpt-3.5-turbo",
                    training_file: "file-abc123"
                });

            const jobId = createResponse.body.id;

            const response = await request(app)
                .get(`/v1/fine_tuning/jobs/${jobId}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(jobId);
            expect(response.body.object).toBe("fine_tuning.job");
        });

        it("should return 404 for non-existent job", async () => {
            const response = await request(app)
                .get("/v1/fine_tuning/jobs/nonexistent_job");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("POST /v1/fine_tuning/jobs/:job_id/cancel", () => {
        it("should cancel a running fine-tuning job", async () => {
            // First create a job
            const createResponse = await request(app)
                .post("/v1/fine_tuning/jobs")
                .send({
                    model: "gpt-3.5-turbo",
                    training_file: "file-abc123"
                });

            const jobId = createResponse.body.id;

            const response = await request(app)
                .post(`/v1/fine_tuning/jobs/${jobId}/cancel`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(jobId);
            expect(response.body.status).toBe("cancelled");
        });

        it("should return 404 for non-existent job", async () => {
            const response = await request(app)
                .post("/v1/fine_tuning/jobs/nonexistent_job/cancel");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /v1/fine_tuning/jobs/:job_id/events", () => {
        it("should list events for a fine-tuning job", async () => {
            // First create a job
            const createResponse = await request(app)
                .post("/v1/fine_tuning/jobs")
                .send({
                    model: "gpt-3.5-turbo",
                    training_file: "file-abc123"
                });

            const jobId = createResponse.body.id;

            const response = await request(app)
                .get(`/v1/fine_tuning/jobs/${jobId}/events`);

            expect(response.status).toBe(200);
            expect(response.body.object).toBe("list");
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].object).toBe("fine_tuning.job.event");
        });

        it("should return 404 for non-existent job events", async () => {
            const response = await request(app)
                .get("/v1/fine_tuning/jobs/nonexistent_job/events");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});
