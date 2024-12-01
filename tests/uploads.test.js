const request = require("supertest");
const { app, setupApp } = require("../index");

describe("Uploads API", () => {
    beforeAll(async () => {
        await setupApp();
    });

    describe("POST /v1/uploads", () => {
        it("should create an upload", async () => {
            const response = await request(app)
                .post("/v1/uploads")
                .send({
                    filename: "training_examples.jsonl",
                    purpose: "fine-tune",
                    bytes: 1024,
                    mime_type: "text/jsonl"
                });

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                object: "upload",
                filename: "training_examples.jsonl",
                purpose: "fine-tune",
                status: "pending",
                bytes: 1024,
                mime_type: "text/jsonl"
            });
            expect(response.body.id).toMatch(/^upload_/);
            expect(response.body.expires_at).toBeGreaterThan(response.body.created_at);
        });

        it("should return error when required fields are missing", async () => {
            const response = await request(app)
                .post("/v1/uploads")
                .send({
                    filename: "training_examples.jsonl",
                    purpose: "fine-tune"
                    // missing bytes and mime_type
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.type).toBe("invalid_request_error");
        });

        it("should return error when bytes exceed 8GB", async () => {
            const response = await request(app)
                .post("/v1/uploads")
                .send({
                    filename: "large_file.jsonl",
                    purpose: "fine-tune",
                    bytes: 9 * 1024 * 1024 * 1024,
                    mime_type: "text/jsonl"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.param).toBe("bytes");
        });
    });

    describe("POST /v1/uploads/:upload_id/parts", () => {
        let uploadId;

        beforeEach(async () => {
            const response = await request(app)
                .post("/v1/uploads")
                .send({
                    filename: "test.jsonl",
                    purpose: "fine-tune",
                    bytes: 1024,
                    mime_type: "text/jsonl"
                });
            uploadId = response.body.id;
        });

        it("should add a part to an upload", async () => {
            const response = await request(app)
                .post(`/v1/uploads/${uploadId}/parts`)
                .attach("data", Buffer.from("test content"), "part1.bin");

            expect(response.status).toBe(200);
            expect(response.body.object).toBe("upload.part");
            expect(response.body.upload_id).toBe(uploadId);
            expect(response.body.id).toMatch(/^part_/);
        });

        it("should return error when part size exceeds 64MB", async () => {
            const largeBuffer = Buffer.alloc(65 * 1024 * 1024);
            const response = await request(app)
                .post(`/v1/uploads/${uploadId}/parts`)
                .attach("data", largeBuffer, "large_part.bin");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.message).toContain("64MB");
        });

        it("should return error when upload not found", async () => {
            const response = await request(app)
                .post("/v1/uploads/nonexistent_upload/parts")
                .attach("data", Buffer.from("test content"), "part1.bin");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("POST /v1/uploads/:upload_id/complete", () => {
        let uploadId;
        let partId;

        beforeEach(async () => {
            // Create upload
            const uploadResponse = await request(app)
                .post("/v1/uploads")
                .send({
                    filename: "test.jsonl",
                    purpose: "fine-tune",
                    bytes: 12, // length of "test content"
                    mime_type: "text/jsonl"
                });
            uploadId = uploadResponse.body.id;

            // Add part
            const partResponse = await request(app)
                .post(`/v1/uploads/${uploadId}/parts`)
                .attach("data", Buffer.from("test content"), "part1.bin");
            partId = partResponse.body.id;
        });

        it("should complete an upload", async () => {
            const response = await request(app)
                .post(`/v1/uploads/${uploadId}/complete`)
                .send({
                    part_ids: [partId]
                });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("completed");
            expect(response.body.file).toBeDefined();
            expect(response.body.file.object).toBe("file");
        });

        it("should return error when part_ids is missing", async () => {
            const response = await request(app)
                .post(`/v1/uploads/${uploadId}/complete`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.param).toBe("part_ids");
        });

        it("should return error when upload not found", async () => {
            const response = await request(app)
                .post("/v1/uploads/nonexistent_upload/complete")
                .send({
                    part_ids: [partId]
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("POST /v1/uploads/:upload_id/cancel", () => {
        let uploadId;

        beforeEach(async () => {
            const response = await request(app)
                .post("/v1/uploads")
                .send({
                    filename: "test.jsonl",
                    purpose: "fine-tune",
                    bytes: 1024,
                    mime_type: "text/jsonl"
                });
            uploadId = response.body.id;
        });

        it("should cancel an upload", async () => {
            const response = await request(app)
                .post(`/v1/uploads/${uploadId}/cancel`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("cancelled");
        });

        it("should return error when upload not found", async () => {
            const response = await request(app)
                .post("/v1/uploads/nonexistent_upload/cancel");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});
