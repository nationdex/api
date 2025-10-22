# QuorielAPI
A high-performance extension for ForgeScript that provides a reliable and scalable way to build HTTP APIs using uWebSockets.js.

## Installation
```
npm i @quoriel/api uNetworking/uWebSockets.js#v20.55.0
```

## Connection
```js
const { ForgeClient } = require("@tryforge/forgescript");
const { QuorielApi } = require("@quoriel/api");

const client = new ForgeClient({
    extensions: [
        new QuorielApi({
            port: 3000,        // HTTP server port (default: 3000)
            path: "routes",    // Routes directory path
            cacheIP: 10000,    // Cache up to 10,000 converted IP addresses (optional)
            ssl: {             // SSL options for HTTPS (optional)
                cert_file_name: "cert.pem",
                key_file_name: "key.pem"
            },
            allowed: {         // Global access control (optional)
                hosts: ["api.quoriel.com"],
                ips: {
                    white: ["243.117.6.40", "198.140.170.153"],
                    black: ["30.164.62.195"]
                },
                headers: {
                    "Authorization": "Bearer your-token-here"
                }
            },
            throttle: {        // Rate limiting and burst protection (optional)
                rateWindowMs: 120000,
                rateMaxRequests: 75,
                blockDuration: 365000
            }
        })
    ]
});

client.login("...");
```

## Cache
Caching of converted IP addresses for performance optimization.

```js
cacheIP: 10000  // Cache up to 10,000 converted IP addresses (optional)
```

> [!TIP]
> IP caching significantly improves performance by storing IP addresses in string format, avoiding repeated conversions from binary buffers.

## SSL
For HTTPS support, provide SSL options. If SSL options are present, the server will use `SSLApp`, otherwise it will use regular `App`.

```js
ssl: {
    cert_file_name: "path/to/cert.pem",     // SSL certificate file
    key_file_name: "path/to/key.pem",       // Private key file
    passphrase: "your_passphrase",          // Password for encrypted private key
    ca_file_name: "path/to/ca.pem",         // Certificate Authority chain file
    ssl_ciphers: "ECDHE-RSA-AES128-...",    // Allowed SSL cipher suites
    ssl_prefer_low_memory_usage: true       // Optimize for lower memory usage
}
```

> [!TIP]
> **Available SSL options:** See [uWebSockets.js AppOptions](https://unetworking.github.io/uWebSockets.js/generated/interfaces/AppOptions.html)

## Allowed
Access control mechanism for routes that can be configured globally or for individual routes.

```js
allowed: {
    hosts: [],        // Array of allowed hostnames
    ips: {
        white: [],    // Only these IPs are allowed
        black: []     // These IPs are blocked
    },
    headers: {}       // Required request headers
}
```

### Structure (Route)
- **false** - disable access control for this route
- **true** or (if not specified at all) - use global rules only
- **{ merge: true, ... }** - merge route settings with global rules (route takes priority)
- **{ ... }** - apply route settings only (ignore global)

## Throttle
Request rate limiting and burst protection to prevent abuse and automated attacks.

```js
throttle: {
    rateWindowMs: 60000,          // Rate limit window duration (default: 60000ms = 1 minute)
    rateMaxRequests: 60,          // Max requests per rate window (default: 60)
    burstWindowMs: 1000,          // Burst detection window duration (default: 1000ms = 1 second)
    burstMaxRequests: 3,          // Max requests per burst window (default: 3)
    blockDuration: 600000,        // Block duration in milliseconds (default: 600000ms = 10 minutes)
    cleanupIntervalMs: 180000,    // Cleanup interval for tracking data (default: 180000ms = 3 minutes)
    maxTrackedIPs: 1500,          // Maximum IPs to track simultaneously (default: 1500)
    logBlocks: false              // Log blocked IPs to console (default: false)
}
```

### How it works
The throttle system uses two-layer protection:

1. **Rate Limiting** - tracks total requests over a longer time window (e.g., 60 requests per minute)
2. **Burst Protection** - detects rapid request spikes in short intervals (e.g., 3 requests per second)

> [!IMPORTANT]
> When limits are exceeded, the IP is automatically blocked for a configured duration. Burst violations result in 2x longer blocks.

### Structure
- **false** - disable throttle completely
- **true** - enable with default settings
- **{ ... }** - enable with custom parameters

> [!NOTE]
> Individual routes can only enable or disable throttle using `throttle: false` or `throttle: true` in the route definition. Custom throttle parameters cannot be configured per route, only globally.

## Routes
Each route is defined as a module inside the `routes` directory.

```js
module.exports = {
    url: "/*",
    method: "GET",
    code: `$sendText[Hello world!]`
};
```

### Supported methods

`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD`, `TRACE`, `CONNECT`, `ANY`
