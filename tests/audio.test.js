const request = require("supertest");
const { setupApp } = require("../index");
const fs = require('fs');
const path = require('path');

describe("Audio API", () => {
  let app;

  beforeAll(async () => {
    app = await setupApp();
  });

  describe("POST /v1/audio/speech", () => {
    it("should generate speech from text", async () => {
      const response = await request(app)
        .post("/v1/audio/speech")
        .send({
          model: "tts-1",
          input: "Hello, this is a test.",
          voice: "alloy"
        })
        .expect("Content-Type", /audio\/mp3/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should support different response formats", async () => {
      const response = await request(app)
        .post("/v1/audio/speech")
        .send({
          model: "tts-1",
          input: "Hello, this is a test.",
          voice: "alloy",
          response_format: "wav"
        })
        .expect("Content-Type", /audio\/wav/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("POST /v1/audio/transcriptions", () => {
    it("should transcribe audio to text", async () => {
      const mockAudioBuffer = Buffer.from('Mock audio content');

      const response = await request(app)
        .post("/v1/audio/transcriptions")
        .field("model", "whisper-1")
        .attach("file", mockAudioBuffer, "audio.mp3")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("text");
    });

    it("should support verbose_json format", async () => {
      const mockAudioBuffer = Buffer.from('Mock audio content');

      const response = await request(app)
        .post("/v1/audio/transcriptions")
        .field("model", "whisper-1")
        .field("response_format", "verbose_json")
        .attach("file", mockAudioBuffer, "audio.mp3")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("text");
      expect(response.body).toHaveProperty("segments");
      expect(response.body.segments[0]).toHaveProperty("words");
    });

    it("should support srt format", async () => {
      const mockAudioBuffer = Buffer.from('Mock audio content');

      const response = await request(app)
        .post("/v1/audio/transcriptions")
        .field("model", "whisper-1")
        .field("response_format", "srt")
        .attach("file", mockAudioBuffer, "audio.mp3")
        .expect("Content-Type", /text\/plain/)
        .expect(200);

      expect(response.text).toContain("-->");
      expect(response.text).toContain("00:00:00,000");
    });

    it("should support vtt format", async () => {
      const mockAudioBuffer = Buffer.from('Mock audio content');

      const response = await request(app)
        .post("/v1/audio/transcriptions")
        .field("model", "whisper-1")
        .field("response_format", "vtt")
        .attach("file", mockAudioBuffer, "audio.mp3")
        .expect("Content-Type", /text\/plain/)
        .expect(200);

      expect(response.text).toContain("WEBVTT");
      expect(response.text).toContain("-->");
      expect(response.text).toContain("00:00:00.000");
    });
  });

  describe("POST /v1/audio/translations", () => {
    it("should translate audio to English text", async () => {
      const mockAudioBuffer = Buffer.from('Mock audio content');

      const response = await request(app)
        .post("/v1/audio/translations")
        .field("model", "whisper-1")
        .attach("file", mockAudioBuffer, "audio.mp3")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("text");
    });

    it("should support verbose_json format", async () => {
      const mockAudioBuffer = Buffer.from('Mock audio content');

      const response = await request(app)
        .post("/v1/audio/translations")
        .field("model", "whisper-1")
        .field("response_format", "verbose_json")
        .attach("file", mockAudioBuffer, "audio.mp3")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("text");
      expect(response.body).toHaveProperty("segments");
      expect(response.body.segments[0]).toHaveProperty("words");
    });

    it("should support srt format", async () => {
      const mockAudioBuffer = Buffer.from('Mock audio content');

      const response = await request(app)
        .post("/v1/audio/translations")
        .field("model", "whisper-1")
        .field("response_format", "srt")
        .attach("file", mockAudioBuffer, "audio.mp3")
        .expect("Content-Type", /text\/plain/)
        .expect(200);

      expect(response.text).toContain("-->");
      expect(response.text).toContain("00:00:00,000");
    });

    it("should support vtt format", async () => {
      const mockAudioBuffer = Buffer.from('Mock audio content');

      const response = await request(app)
        .post("/v1/audio/translations")
        .field("model", "whisper-1")
        .field("response_format", "vtt")
        .attach("file", mockAudioBuffer, "audio.mp3")
        .expect("Content-Type", /text\/plain/)
        .expect(200);

      expect(response.text).toContain("WEBVTT");
      expect(response.text).toContain("-->");
      expect(response.text).toContain("00:00:00.000");
    });
  });

  describe("Response delay", () => {
    it("should respect x-set-response-delay-ms header", async () => {
      const delay = 100;
      const startTime = Date.now();

      await request(app)
        .post("/v1/audio/speech")
        .set("x-set-response-delay-ms", delay)
        .send({
          model: "tts-1",
          input: "Test delay",
          voice: "alloy"
        })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeGreaterThanOrEqual(delay);
    });
  });
});
