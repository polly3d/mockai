const request = require("supertest");
const { app, setupApp } = require("../index");

describe("Models API", () => {
  beforeAll(async () => {
    await setupApp();
  });

  describe("GET /v1/models", () => {
    it("should return a list of models", async () => {
      const response = await request(app)
        .get("/v1/models")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.object).toBe("list");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check if common models exist
      const modelIds = response.body.data.map(model => model.id);
      expect(modelIds).toContain("gpt-4");
      expect(modelIds).toContain("gpt-3.5-turbo");
    });

    it("should have correct model object structure", async () => {
      const response = await request(app)
        .get("/v1/models")
        .expect(200);

      const model = response.body.data[0];
      expect(model).toHaveProperty("id");
      expect(model).toHaveProperty("created");
      expect(model).toHaveProperty("object");
      expect(model).toHaveProperty("owned_by");
      expect(model.object).toBe("model");
    });
  });

  describe("GET /v1/models/:model", () => {
    it("should return details for a specific model", async () => {
      const modelId = "gpt-4";
      const response = await request(app)
        .get(`/v1/models/${modelId}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.id).toBe(modelId);
      expect(response.body.object).toBe("model");
      expect(response.body).toHaveProperty("created");
      expect(response.body).toHaveProperty("owned_by");
    });

    it("should handle non-existent models gracefully", async () => {
      const response = await request(app)
        .get("/v1/models/non-existent-model")
        .expect(200);  // Since we're mocking, we return a generated response

      expect(response.body).toHaveProperty("id", "non-existent-model");
      expect(response.body.object).toBe("model");
    });
  });

  describe("Response delay", () => {
    it("should respect x-set-response-delay-ms header", async () => {
      const delay = 100;
      const startTime = Date.now();
      
      await request(app)
        .get("/v1/models")
        .set("x-set-response-delay-ms", delay)
        .expect(200);

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(delay);
    });
  });
});
