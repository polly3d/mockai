const request = require("supertest");
const { app, setupApp } = require("../index");

describe("Moderation API", () => {
  beforeAll(async () => {
    await setupApp();
  });

  describe("POST /v1/moderations", () => {
    it("should moderate a single input text", async () => {
      const response = await request(app)
        .post("/v1/moderations")
        .send({ input: "Sample text for moderation" })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("model");
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBe(1);

      const result = response.body.results[0];
      expect(result).toHaveProperty("flagged");
      expect(result).toHaveProperty("categories");
      expect(result).toHaveProperty("category_scores");
    });

    it("should moderate multiple input texts", async () => {
      const inputs = ["Text 1", "Text 2", "Text 3"];
      const response = await request(app)
        .post("/v1/moderations")
        .send({ input: inputs })
        .expect(200);

      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBe(inputs.length);

      response.body.results.forEach(result => {
        expect(result).toHaveProperty("flagged");
        expect(result).toHaveProperty("categories");
        expect(result).toHaveProperty("category_scores");
      });
    });

    it("should have all required category fields", async () => {
      const response = await request(app)
        .post("/v1/moderations")
        .send({ input: "Test text" })
        .expect(200);

      const result = response.body.results[0];
      const expectedCategories = [
        "harassment",
        "harassment/threatening",
        "hate",
        "hate/threatening",
        "self-harm",
        "self-harm/intent",
        "self-harm/instructions",
        "sexual",
        "sexual/minors",
        "violence",
        "violence/graphic"
      ];

      expectedCategories.forEach(category => {
        expect(result.categories).toHaveProperty(category);
        expect(result.category_scores).toHaveProperty(category);
        expect(typeof result.categories[category]).toBe("boolean");
        expect(typeof result.category_scores[category]).toBe("number");
        expect(result.category_scores[category]).toBeGreaterThanOrEqual(0);
        expect(result.category_scores[category]).toBeLessThanOrEqual(1);
      });
    });

    it("should handle empty input gracefully", async () => {
      const response = await request(app)
        .post("/v1/moderations")
        .send({ input: "" })
        .expect(200);

      expect(response.body.results.length).toBe(1);
    });

    it("should respect x-set-response-delay-ms header", async () => {
      const delay = 100;
      const startTime = Date.now();
      
      await request(app)
        .post("/v1/moderations")
        .set("x-set-response-delay-ms", delay)
        .send({ input: "Test text" })
        .expect(200);

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(delay);
    });
  });
});
