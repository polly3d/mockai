const client = require("prom-client"); 

const register = new client.Registry()

client.collectDefaultMetrics({
    app: 'mockiai',
    prefix: 'node_',
    timeout: 10000,
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register
});

const requestCounter = new client.Counter({
    name: "mockai_http_requests_total",
    help: "Total number of requests received",
    labelNames: ["method", "path", "status"],
});

const requestLatency = new client.Histogram({
    name: "mockai_http_request_duration_ms",
    help: "Duration of HTTP requests in ms",
    labelNames: ["method", "path", "status"],
    buckets: [0.001, 0.01, 0.1, 1, 2, 5, 10, 15, 20, 50, 100, 200, 500, 1000, 2000, 5000],
});

const payloadSize = new client.Histogram({
    name: "mockai_http_request_size_bytes",
    help: "Size of HTTP requests in bytes",
    labelNames: ["method", "path", "status"],
    buckets: [200, 500, 1000, 2000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000, 10000000],
});

register.registerMetric(requestCounter)
register.registerMetric(requestLatency)
register.registerMetric(payloadSize)

module.exports = {
    register,
    requestCounter,
    requestLatency,
    payloadSize
}