const express = require("express");
const router = express.Router();
const delay = require("../utils/delay");

// Mock fine-tuning job data store
let jobs = new Map();
let events = new Map();

// Helper function to generate a random job ID
function generateJobId() {
    return 'ftjob_' + Math.random().toString(36).substring(2, 15);
}

// Helper function to generate mock events for a job
function generateMockEvents(jobId, status) {
    const baseEvents = [
        {
            id: `evt_${Math.random().toString(36).substring(2)}`,
            object: "fine_tuning.job.event",
            created_at: Math.floor(Date.now() / 1000) - 100,
            level: "info",
            message: "Fine-tuning job has been created",
            data: null,
            type: "message"
        }
    ];

    if (status === "succeeded") {
        baseEvents.push({
            id: `evt_${Math.random().toString(36).substring(2)}`,
            object: "fine_tuning.job.event",
            created_at: Math.floor(Date.now() / 1000),
            level: "info",
            message: "Fine-tuning job completed successfully",
            data: null,
            type: "message"
        });
    }

    return baseEvents;
}

// Create a fine-tuning job
router.post("/v1/fine_tuning/jobs", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const { model, training_file, hyperparameters, suffix } = req.body;

    if (!model || !training_file) {
        return res.status(400).json({
            error: {
                message: "model and training_file are required",
                type: "invalid_request_error",
                param: !model ? "model" : "training_file",
                code: "invalid_request_error"
            }
        });
    }

    const jobId = generateJobId();
    const job = {
        id: jobId,
        object: "fine_tuning.job",
        model,
        created_at: Math.floor(Date.now() / 1000),
        finished_at: null,
        fine_tuned_model: null,
        organization_id: "org-123456",
        result_files: [],
        status: "running",
        validation_file: null,
        training_file,
        hyperparameters,
        suffix,
        trained_tokens: 0,
        error: null
    };

    jobs.set(jobId, job);
    events.set(jobId, generateMockEvents(jobId, "running"));

    res.status(200).json(job);
});

// List fine-tuning jobs
router.get("/v1/fine_tuning/jobs", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const { limit = 20, after, status } = req.query;
    let jobsList = Array.from(jobs.values());

    if (status) {
        jobsList = jobsList.filter(job => job.status === status);
    }

    if (after) {
        const afterIndex = jobsList.findIndex(job => job.id === after);
        if (afterIndex !== -1) {
            jobsList = jobsList.slice(afterIndex + 1);
        }
    }

    jobsList = jobsList.slice(0, parseInt(limit));

    res.status(200).json({
        object: "list",
        data: jobsList,
        has_more: jobsList.length === parseInt(limit)
    });
});

// Retrieve fine-tuning job
router.get("/v1/fine_tuning/jobs/:job_id", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const job = jobs.get(req.params.job_id);
    if (!job) {
        return res.status(404).json({
            error: {
                message: "No fine-tuning job found",
                type: "invalid_request_error",
                param: null,
                code: "resource_not_found"
            }
        });
    }

    res.status(200).json(job);
});

// Cancel fine-tuning job
router.post("/v1/fine_tuning/jobs/:job_id/cancel", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const job = jobs.get(req.params.job_id);
    if (!job) {
        return res.status(404).json({
            error: {
                message: "No fine-tuning job found",
                type: "invalid_request_error",
                param: null,
                code: "resource_not_found"
            }
        });
    }

    if (job.status === "succeeded" || job.status === "failed" || job.status === "cancelled") {
        return res.status(400).json({
            error: {
                message: `Fine-tuning job ${job.status}, cannot be cancelled`,
                type: "invalid_request_error",
                param: null,
                code: "invalid_request_error"
            }
        });
    }

    job.status = "cancelled";
    job.finished_at = Math.floor(Date.now() / 1000);
    jobs.set(req.params.job_id, job);

    res.status(200).json(job);
});

// List fine-tuning events
router.get("/v1/fine_tuning/jobs/:job_id/events", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const { limit = 20, after } = req.query;
    const jobEvents = events.get(req.params.job_id) || [];

    if (!jobs.has(req.params.job_id)) {
        return res.status(404).json({
            error: {
                message: "No fine-tuning job found",
                type: "invalid_request_error",
                param: null,
                code: "resource_not_found"
            }
        });
    }

    let filteredEvents = [...jobEvents];
    if (after) {
        const afterIndex = filteredEvents.findIndex(event => event.id === after);
        if (afterIndex !== -1) {
            filteredEvents = filteredEvents.slice(afterIndex + 1);
        }
    }

    filteredEvents = filteredEvents.slice(0, parseInt(limit));

    res.status(200).json({
        object: "list",
        data: filteredEvents,
        has_more: filteredEvents.length === parseInt(limit)
    });
});

module.exports = router;
