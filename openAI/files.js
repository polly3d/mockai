const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const delay = require("../utils/delay");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mock files data store
let files = new Map();

// Helper function to generate a random file ID
function generateFileId() {
    return 'file-' + Math.random().toString(36).substring(2, 15);
}

// Helper function to calculate bytes from a string or buffer
function calculateBytes(data) {
    if (Buffer.isBuffer(data)) {
        return data.length;
    }
    return Buffer.from(data).length;
}

// List files
router.get("/v1/files", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const { purpose } = req.query;
    let filesList = Array.from(files.values());

    if (purpose) {
        filesList = filesList.filter(file => file.purpose === purpose);
    }

    res.status(200).json({
        object: "list",
        data: filesList,
        has_more: false
    });
});

// Upload a file
router.post("/v1/files", upload.single("file"), async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    if (!req.file) {
        return res.status(400).json({
            error: {
                message: "No file provided",
                type: "invalid_request_error",
                param: "file",
                code: "invalid_request_error"
            }
        });
    }

    const purpose = req.body.purpose;
    if (!purpose) {
        return res.status(400).json({
            error: {
                message: "Purpose is required",
                type: "invalid_request_error",
                param: "purpose",
                code: "invalid_request_error"
            }
        });
    }

    const fileId = generateFileId();
    const file = {
        id: fileId,
        object: "file",
        bytes: calculateBytes(req.file.buffer),
        created_at: Math.floor(Date.now() / 1000),
        filename: req.file.originalname,
        purpose: purpose,
        status: "processed",
        status_details: null
    };

    // Store file data
    files.set(fileId, {
        ...file,
        content: req.file.buffer // Store the actual file content
    });

    // Don't send the content in the response
    res.status(200).json(file);
});

// Delete a file
router.delete("/v1/files/:file_id", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const fileId = req.params.file_id;
    const file = files.get(fileId);

    if (!file) {
        return res.status(404).json({
            error: {
                message: "No such file",
                type: "invalid_request_error",
                param: null,
                code: "resource_not_found"
            }
        });
    }

    files.delete(fileId);

    res.status(200).json({
        id: fileId,
        object: "file",
        deleted: true
    });
});

// Retrieve file information
router.get("/v1/files/:file_id", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const fileId = req.params.file_id;
    const file = files.get(fileId);

    if (!file) {
        return res.status(404).json({
            error: {
                message: "No such file",
                type: "invalid_request_error",
                param: null,
                code: "resource_not_found"
            }
        });
    }

    // Don't send the content in the response
    const { content, ...fileInfo } = file;
    res.status(200).json(fileInfo);
});

// Retrieve file content
router.get("/v1/files/:file_id/content", async (req, res) => {
    const delayTime = parseInt(req.headers["x-set-response-delay-ms"]) || 0;
    await delay(delayTime);

    const fileId = req.params.file_id;
    const file = files.get(fileId);

    if (!file) {
        return res.status(404).json({
            error: {
                message: "No such file",
                type: "invalid_request_error",
                param: null,
                code: "resource_not_found"
            }
        });
    }

    // Set appropriate headers based on file type
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    
    // Send the file content
    res.send(file.content);
});

module.exports = router;
