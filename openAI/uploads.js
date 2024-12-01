const express = require("express");
const router = express.Router();
const multer = require("multer");
const delay = require("../utils/delay");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mock uploads data store
let uploads = new Map();
let parts = new Map();

// Helper function to generate IDs
function generateUploadId() {
    return 'upload_' + Math.random().toString(36).substring(2, 15);
}

function generatePartId() {
    return 'part_' + Math.random().toString(36).substring(2, 15);
}

function generateFileId() {
    return 'file_' + Math.random().toString(36).substring(2, 15);
}

// Create an upload
router.post("/v1/uploads", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const { filename, purpose, bytes, mime_type } = req.body;

    // Validate required fields
    if (!filename || !purpose || !bytes || !mime_type) {
        return res.status(400).json({
            error: {
                message: "Missing required fields",
                type: "invalid_request_error",
                param: !filename ? "filename" : !purpose ? "purpose" : !bytes ? "bytes" : "mime_type",
                code: "invalid_request_error"
            }
        });
    }

    // Validate bytes (max 8GB)
    if (bytes > 8 * 1024 * 1024 * 1024) {
        return res.status(400).json({
            error: {
                message: "Upload size cannot exceed 8GB",
                type: "invalid_request_error",
                param: "bytes",
                code: "invalid_request_error"
            }
        });
    }

    const uploadId = generateUploadId();
    const upload = {
        id: uploadId,
        object: "upload",
        bytes,
        created_at: Math.floor(Date.now() / 1000),
        filename,
        purpose,
        status: "pending",
        expires_at: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        mime_type
    };

    uploads.set(uploadId, {
        ...upload,
        parts: new Map(), // Store parts data
        totalUploadedBytes: 0
    });

    res.status(200).json(upload);
});

// Add upload part
router.post("/v1/uploads/:upload_id/parts", upload.single("data"), async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const uploadId = req.params.upload_id;
    const upload = uploads.get(uploadId);

    if (!upload) {
        return res.status(404).json({
            error: {
                message: "Upload not found",
                type: "invalid_request_error",
                param: null,
                code: "resource_not_found"
            }
        });
    }

    if (upload.status !== "pending") {
        return res.status(400).json({
            error: {
                message: `Upload is ${upload.status}, cannot add parts`,
                type: "invalid_request_error",
                param: null,
                code: "invalid_request_error"
            }
        });
    }

    if (!req.file) {
        return res.status(400).json({
            error: {
                message: "No data provided",
                type: "invalid_request_error",
                param: "data",
                code: "invalid_request_error"
            }
        });
    }

    // Check part size (max 64MB)
    if (req.file.size > 64 * 1024 * 1024) {
        return res.status(400).json({
            error: {
                message: "Part size cannot exceed 64MB",
                type: "invalid_request_error",
                param: "data",
                code: "invalid_request_error"
            }
        });
    }

    // Check if total uploaded bytes would exceed the specified size
    if (upload.totalUploadedBytes + req.file.size > upload.bytes) {
        return res.status(400).json({
            error: {
                message: "Total uploaded bytes would exceed specified size",
                type: "invalid_request_error",
                param: "data",
                code: "invalid_request_error"
            }
        });
    }

    const partId = generatePartId();
    const part = {
        id: partId,
        object: "upload.part",
        created_at: Math.floor(Date.now() / 1000),
        upload_id: uploadId
    };

    // Store part data
    upload.parts.set(partId, {
        ...part,
        data: req.file.buffer,
        size: req.file.size
    });
    upload.totalUploadedBytes += req.file.size;

    uploads.set(uploadId, upload);
    res.status(200).json(part);
});

// Complete upload
router.post("/v1/uploads/:upload_id/complete", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const { part_ids, md5 } = req.body;
    const uploadId = req.params.upload_id;
    const upload = uploads.get(uploadId);

    if (!upload) {
        return res.status(404).json({
            error: {
                message: "Upload not found",
                type: "invalid_request_error",
                param: null,
                code: "resource_not_found"
            }
        });
    }

    if (upload.status !== "pending") {
        return res.status(400).json({
            error: {
                message: `Upload is ${upload.status}, cannot complete`,
                type: "invalid_request_error",
                param: null,
                code: "invalid_request_error"
            }
        });
    }

    if (!part_ids || !Array.isArray(part_ids) || part_ids.length === 0) {
        return res.status(400).json({
            error: {
                message: "part_ids must be a non-empty array",
                type: "invalid_request_error",
                param: "part_ids",
                code: "invalid_request_error"
            }
        });
    }

    // Verify all parts exist
    for (const partId of part_ids) {
        if (!upload.parts.has(partId)) {
            return res.status(400).json({
                error: {
                    message: `Part ${partId} not found`,
                    type: "invalid_request_error",
                    param: "part_ids",
                    code: "invalid_request_error"
                }
            });
        }
    }

    // Verify total bytes match
    if (upload.totalUploadedBytes !== upload.bytes) {
        return res.status(400).json({
            error: {
                message: "Total uploaded bytes does not match specified size",
                type: "invalid_request_error",
                param: null,
                code: "invalid_request_error"
            }
        });
    }

    // Create file object
    const fileId = generateFileId();
    const file = {
        id: fileId,
        object: "file",
        bytes: upload.bytes,
        created_at: Math.floor(Date.now() / 1000),
        filename: upload.filename,
        purpose: upload.purpose
    };

    // Update upload status
    upload.status = "completed";
    upload.file = file;
    uploads.set(uploadId, upload);

    res.status(200).json({
        ...upload,
        parts: undefined,
        totalUploadedBytes: undefined
    });
});

// Cancel upload
router.post("/v1/uploads/:upload_id/cancel", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const uploadId = req.params.upload_id;
    const upload = uploads.get(uploadId);

    if (!upload) {
        return res.status(404).json({
            error: {
                message: "Upload not found",
                type: "invalid_request_error",
                param: null,
                code: "resource_not_found"
            }
        });
    }

    if (upload.status !== "pending") {
        return res.status(400).json({
            error: {
                message: `Upload is ${upload.status}, cannot cancel`,
                type: "invalid_request_error",
                param: null,
                code: "invalid_request_error"
            }
        });
    }

    upload.status = "cancelled";
    uploads.set(uploadId, upload);

    res.status(200).json({
        ...upload,
        parts: undefined,
        totalUploadedBytes: undefined
    });
});

module.exports = router;
