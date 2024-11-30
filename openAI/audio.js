const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const delay = require("../utils/delay");
const { getMockAudioData } = require("../data/mockAudio");

// Text to Speech
router.post("/v1/audio/speech", async (req, res) => {
  const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
  await delay(delayTime);

  const { model, input, voice, response_format = "mp3", speed = 1.0 } = req.body;

  // Get mock audio data in the requested format
  const mockAudioData = getMockAudioData(response_format);

  // Set appropriate headers based on response format
  res.set({
    'Content-Type': response_format === 'mp3' ? 'audio/mp3' : 'audio/wav',
    'Content-Length': mockAudioData.length
  });

  res.send(mockAudioData);
});

// Speech to Text (Transcription)
router.post("/v1/audio/transcriptions", upload.single('file'), async (req, res) => {
  const delayTime = parseInt(req.get('x-set-response-delay-ms')) || 0;
  await delay(delayTime);

  const { model = "whisper-1", language, prompt, response_format = "json", temperature = 0 } = req.body;
  const format = response_format;

  // Mock transcription response
  const transcription = {
    text: "This is a mock transcription of the audio file. The quick brown fox jumps over the lazy dog.",
  };

  if (format === "verbose_json") {
    const verboseResponse = {
      text: transcription.text,
      language: language || "en",
      segments: [
        {
          id: 0,
          seek: 0,
          start: 0.0,
          end: 4.0,
          text: "This is a mock transcription",
          tokens: [50364, 1029, 338, 257, 3277, 12314],
          temperature: temperature,
          avg_logprob: -0.458,
          compression_ratio: 1.275,
          no_speech_prob: 0.1,
          words: [
            { word: "This", start: 0.0, end: 0.3, probability: 0.999 },
            { word: "is", start: 0.3, end: 0.5, probability: 0.999 },
            { word: "a", start: 0.5, end: 0.6, probability: 0.999 },
            { word: "mock", start: 0.6, end: 0.9, probability: 0.999 },
            { word: "transcription", start: 0.9, end: 1.5, probability: 0.999 }
          ]
        }
      ]
    };
    res.json(verboseResponse);
  } else if (format === "srt" || format === "vtt") {
    const content = format === "srt" 
      ? "1\n00:00:00,000 --> 00:00:04,000\nThis is a mock transcription of the audio file.\n\n2\n00:00:04,000 --> 00:00:08,000\nThe quick brown fox jumps over the lazy dog."
      : "WEBVTT\n\n00:00:00.000 --> 00:00:04.000\nThis is a mock transcription of the audio file.\n\n00:00:04.000 --> 00:00:08.000\nThe quick brown fox jumps over the lazy dog.";
    
    res.set('Content-Type', 'text/plain');
    res.send(content);
  } else {
    res.json(transcription);
  }
});

// Audio Translation
router.post("/v1/audio/translations", upload.single('file'), async (req, res) => {
  const delayTime = parseInt(req.get('x-set-response-delay-ms')) || 0;
  await delay(delayTime);

  const { model = "whisper-1", prompt, response_format = "json", temperature = 0 } = req.body;
  const format = response_format;

  // Mock translation response (always translates to English)
  const translation = {
    text: "This is a mock translation to English. The quick brown fox jumps over the lazy dog.",
  };

  if (format === "verbose_json") {
    const verboseResponse = {
      text: translation.text,
      segments: [
        {
          id: 0,
          seek: 0,
          start: 0.0,
          end: 4.0,
          text: "This is a mock translation",
          tokens: [50364, 1029, 338, 257, 3277, 12314],
          temperature: temperature,
          avg_logprob: -0.458,
          compression_ratio: 1.275,
          no_speech_prob: 0.1,
          words: [
            { word: "This", start: 0.0, end: 0.3, probability: 0.999 },
            { word: "is", start: 0.3, end: 0.5, probability: 0.999 },
            { word: "a", start: 0.5, end: 0.6, probability: 0.999 },
            { word: "mock", start: 0.6, end: 0.9, probability: 0.999 },
            { word: "translation", start: 0.9, end: 1.5, probability: 0.999 }
          ]
        }
      ]
    };
    res.json(verboseResponse);
  } else if (format === "srt" || format === "vtt") {
    const content = format === "srt" 
      ? "1\n00:00:00,000 --> 00:00:04,000\nThis is a mock translation to English.\n\n2\n00:00:04,000 --> 00:00:08,000\nThe quick brown fox jumps over the lazy dog."
      : "WEBVTT\n\n00:00:00.000 --> 00:00:04.000\nThis is a mock translation to English.\n\n00:00:04.000 --> 00:00:08.000\nThe quick brown fox jumps over the lazy dog.";
    
    res.set('Content-Type', 'text/plain');
    res.send(content);
  } else {
    res.json(translation);
  }
});

module.exports = router;
