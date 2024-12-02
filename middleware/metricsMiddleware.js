const { requestCounter, requestLatency, payloadSize } = require("../utils/metrics");

function metricsMiddleware(req, res, next) {
    const then = Date.now();
    const originalEnd = res.end;
    const originalJson = res.json;

    // Override res.end to capture metrics when the response is sent
    res.end = function (...args) {
        const now = Date.now();
        const path = req.route ? req.route.path : req.path;
        const status = res.statusCode;

        // Record metrics
        requestCounter.inc({ method: req.method, path, status });
        requestLatency.observe({ method: req.method, path, status }, now - then);
        payloadSize.observe({ method: req.method, path }, req.socket.bytesRead);

        originalEnd.apply(res, args);
    };

    // Override res.json to ensure we capture metrics for JSON responses
    res.json = function (...args) {
        const now = Date.now();
        const path = req.route ? req.route.path : req.path;
        const status = res.statusCode;

        // Record metrics
        requestCounter.inc({ method: req.method, path, status });
        requestLatency.observe({ method: req.method, path, status }, now - then);
        payloadSize.observe({ method: req.method, path }, req.socket.bytesRead);

        originalJson.apply(res, args);
    };

    next();
}

module.exports = metricsMiddleware;
