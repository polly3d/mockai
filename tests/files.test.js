const request = require("supertest");
const { app, setupApp } = require("../index");

describe("Files API", () => {
    beforeAll(async () => {
        await setupApp();
    });

    describe("POST /v1/files", () => {
        it("should upload a file", async () => {
            const response = await request(app)
                .post("/v1/files")
                .field("purpose", "fine-tune")
                .attach("file", Buffer.from("test content"), "test.jsonl");

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                object: "file",
                filename: "test.jsonl",
                purpose: "fine-tune",
                status: "processed"
            });
            expect(response.body.id).toMatch(/^file-/);
            expect(response.body.bytes).toBe(12); // length of "test content"
        });

        it("should return error when no file is provided", async () => {
            const response = await request(app)
                .post("/v1/files")
                .field("purpose", "fine-tune");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.type).toBe("invalid_request_error");
        });

        it("should return error when no purpose is provided", async () => {
            const response = await request(app)
                .post("/v1/files")
                .attach("file", Buffer.from("test content"), "test.jsonl");

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.type).toBe("invalid_request_error");
        });
    });

    describe("GET /v1/files", () => {
        it("should list files", async () => {
            // First upload a file
            await request(app)
                .post("/v1/files")
                .field("purpose", "fine-tune")
                .attach("file", Buffer.from("test content"), "test.jsonl");

            const response = await request(app)
                .get("/v1/files");

            expect(response.status).toBe(200);
            expect(response.body.object).toBe("list");
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it("should filter files by purpose", async () => {
            // Upload files with different purposes
            await request(app)
                .post("/v1/files")
                .field("purpose", "fine-tune")
                .attach("file", Buffer.from("test content 1"), "test1.jsonl");

            await request(app)
                .post("/v1/files")
                .field("purpose", "assistants")
                .attach("file", Buffer.from("test content 2"), "test2.jsonl");

            const response = await request(app)
                .get("/v1/files")
                .query({ purpose: "fine-tune" });

            expect(response.status).toBe(200);
            expect(response.body.data.every(file => file.purpose === "fine-tune")).toBe(true);
        });
    });

    describe("DELETE /v1/files/:file_id", () => {
        it("should delete a file", async () => {
            // First upload a file
            const uploadResponse = await request(app)
                .post("/v1/files")
                .field("purpose", "fine-tune")
                .attach("file", Buffer.from("test content"), "test.jsonl");

            const fileId = uploadResponse.body.id;

            const response = await request(app)
                .delete(`/v1/files/${fileId}`);

            expect(response.status).toBe(200);
            expect(response.body.deleted).toBe(true);
            expect(response.body.id).toBe(fileId);
        });

        it("should return 404 for non-existent file", async () => {
            const response = await request(app)
                .delete("/v1/files/nonexistent_file");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /v1/files/:file_id", () => {
        it("should retrieve file information", async () => {
            // First upload a file
            const uploadResponse = await request(app)
                .post("/v1/files")
                .field("purpose", "fine-tune")
                .attach("file", Buffer.from("test content"), "test.jsonl");

            const fileId = uploadResponse.body.id;

            const response = await request(app)
                .get(`/v1/files/${fileId}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(fileId);
            expect(response.body.filename).toBe("test.jsonl");
            expect(response.body.purpose).toBe("fine-tune");
            // Ensure content is not included in the response
            expect(response.body.content).toBeUndefined();
        });

        it("should return 404 for non-existent file", async () => {
            const response = await request(app)
                .get("/v1/files/nonexistent_file");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("GET /v1/files/:file_id/content", () => {
        it("should retrieve file content", async () => {
            const testContent = "test content";
            // First upload a file
            const uploadResponse = await request(app)
                .post("/v1/files")
                .field("purpose", "fine-tune")
                .attach("file", Buffer.from(testContent), "test.jsonl");

            const fileId = uploadResponse.body.id;

            const response = await request(app)
                .get(`/v1/files/${fileId}/content`);

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/octet-stream');
            expect(response.headers['content-disposition']).toContain('attachment');
            expect(response.body.toString()).toBe(testContent);
        });

        it("should return 404 for non-existent file content", async () => {
            const response = await request(app)
                .get("/v1/files/nonexistent_file/content");

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });
    });
});
