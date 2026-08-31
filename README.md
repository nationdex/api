# @nationdex/api

A ForgeScript extension that runs a fast HTTP server powered by `uWebSockets.js`. It lets you create API routes that run ForgeScript code.

[![discord](https://img.shields.io/discord/1321001945738971167?color=5865F2&label=Discord&logo=discord)](https://discord.com/invite/WCdk6CSKKz)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://github.com/nationdex/api/blob/main/LICENSE)

---

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
  - [Extension Options](#extension-options)
  - [Throttle Options](#throttle-options)
  - [Access Control Options](#access-control-options)
  - [Route Options](#route-options)
  - [Other / Utilities](#other--utilities)

---

## Installation

Run this in your project root:

```bash
npm install github:nationdex/api

---

## Getting Started

Add the `API` extension to your ForgeClient:

```ts
import { ForgeClient } from "@tryforge/forgescript";
import { API } from "@nationdex/api";

const api = new API({
    path: "dist/routes",
    port: 3000
});

const client = new ForgeClient({
    events: ["clientReady"],
    extensions: [api]
});

client.login("YOUR_BOT_TOKEN");
```

When your client starts, the extension loads all route files inside the `./routes` folder and starts the server on port 3000.

---


## Configuration

### Extension Options

Pass these to `new API(options)`:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `port` | `number \| string` | `3000` | Port to run the server on. |
| `path` | `string` | `undefined` | Folder containing route files (relative to current working directory). |
| `throttle` | `boolean \| ThrottleOptions` | `false` | Enable rate limiting or configure throttle settings. |
| `cacheIP` | `number \| string` | `10000` | Size of the LRU cache for converted IP addresses. |
| `allowed` | `AllowedOptions` | `{}` | Global IP, host, and header restrictions. |
| `ssl` | `uWS.AppOptions` | `{}` | SSL certificate and key paths if running HTTPS. |

### Throttle Options

When setting `throttle: { ... }`:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rateWindowMs` | `number` | `60000` | Time window for regular requests in milliseconds. |
| `rateMaxRequests` | `number` | `60` | Max requests allowed in the `rateWindowMs`. |
| `burstWindowMs` | `number` | `1000` | Short time window to catch bursts. |
| `burstMaxRequests` | `number` | `3` | Max requests allowed in the `burstWindowMs`. |
| `blockDuration` | `number` | `600000` | How long an IP stays blocked (burst blocks double this). |
| `cleanupIntervalMs` | `number` | `180000` | How often expired tracking data is cleaned up. |
| `maxTrackedIPs` | `number` | `1500` | Max tracked IPs stored in memory. |
| `logBlocks` | `boolean` | `false` | Log a warning when an IP gets blocked. |

### Access Control Options

Can be set globally on `API` options or per route:

```javascript
{
    hosts: ["example.com", "api.example.com"],
    ips: {
        white: ["127.0.0.1", "::1"],
        black: ["192.168.1.100"]
    },
    headers: {
        "authorization": "Bearer secret-token"
    }
}
```

### Route Options

Each route object accepts:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | Yes | Path to match, like `"/hello"` or `"/user/:id"`. |
| `method` | `string` | Yes | HTTP method (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD`, `TRACE`, `CONNECT`, `ANY`). |
| `code` | `string` | Yes | ForgeScript code string to run for the route. |
| `allowed` | `boolean \| RouteAllowedOptions` | No | Set `false` to disable access checks, or supply route-specific allowed rules (with optional `merge: true`). |
| `throttle` | `boolean` | No | Set `false` to skip rate limiting on this specific route. |

---

## License

This project is licensed under the [GPL-3.0 License](LICENSE).
