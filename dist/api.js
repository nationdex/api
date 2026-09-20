"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBun = void 0;
exports.initializer = initializer;
exports.updateRoutes = updateRoutes;
const forgescript_1 = require("@tryforge/forgescript");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const convert_1 = require("./convert");
const throttle_1 = require("./throttle");
const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "TRACE", "CONNECT", "ANY"];
let app = null;
let client = null;
let port = 3000;
let path = null;
let throttle = false;
let ssl = {};
let allowed = {};
// Bun ships Bun.serve() natively; anything else (Node via npm/pnpm) uses uWebSockets.js.
// This is the only place that decides which backend loads - neither backend module is
// ever statically imported, so the wrong one never even touches disk/ABI at runtime.
exports.isBun = typeof globalThis.Bun !== "undefined";
async function createApp() {
    if (exports.isBun) {
        const { BunApp } = await Promise.resolve().then(() => __importStar(require("./server/bun")));
        return new BunApp();
    }
    const { UwsApp } = await Promise.resolve().then(() => __importStar(require("./server/uws")));
    return new UwsApp(ssl);
}
async function initializer(options = {}, instance) {
    if (options.path)
        path = (0, path_1.join)(process.cwd(), options.path);
    if (!path)
        return;
    if (options.throttle) {
        throttle = true;
        (0, throttle_1.setupThrottle)(options.throttle);
    }
    if (options.cacheIP)
        (0, convert_1.cacheIP)(options.cacheIP);
    if (options.allowed)
        allowed = options.allowed;
    if (options.ssl)
        ssl = options.ssl;
    client = instance;
    port = +(options.port ?? 3000) || 3000;
    await updateRoutes();
}
async function updateRoutes() {
    if (!path)
        return;
    if (app)
        app.close();
    app = await createApp();
    await loadRoutes();
    startServer();
}
async function loadRoutes() {
    if (!path)
        return;
    const files = await scanRoutes(path);
    for (const file of files) {
        try {
            const modules = require(file);
            delete require.cache[require.resolve(file)];
            const array = Array.isArray(modules) ? modules : [modules.default ?? modules];
            for (const module of array) {
                if (validateRoute(module))
                    registerRoute(module);
            }
        }
        catch (error) {
            forgescript_1.Logger.error(`Error loading route from ${file}:`, error);
        }
    }
}
async function scanRoutes(poth) {
    try {
        await (0, promises_1.access)(poth);
    }
    catch {
        return [];
    }
    const results = [];
    const files = await (0, promises_1.readdir)(poth, { withFileTypes: true });
    for (const file of files) {
        const full = (0, path_1.join)(poth, file.name);
        if (file.isDirectory()) {
            const sub = await scanRoutes(full);
            results.push(...sub);
        }
        else if (file.name.endsWith(".js") || file.name.endsWith(".ts")) {
            results.push(full);
        }
    }
    return results;
}
function validateRoute(route) {
    if (!route || typeof route !== "object")
        return false;
    if (typeof route.url !== "string" || typeof route.method !== "string" || typeof route.code !== "string")
        return false;
    if (!methods.includes(route.method))
        return false;
    return true;
}
function registerRoute(route) {
    if (!app)
        return;
    const url = route.url.startsWith("/") ? route.url : "/" + route.url;
    const code = forgescript_1.Compiler.compile(route.code);
    let handler = async (response, request) => {
        response.onAborted(() => { });
        try {
            await forgescript_1.Interpreter.run({ obj: {}, command: null, client: client, data: code, extras: { response, request } });
        }
        catch (error) {
            response.end("Internal Server Error");
            forgescript_1.Logger.error(error);
        }
    };
    let allowedHosts = new Set();
    let whiteIps = new Set();
    let blackIps = new Set();
    let allowedHeaders = new Map();
    if (route.allowed !== false) {
        if (!route.allowed || route.allowed === true) {
            allowedHosts = new Set(allowed.hosts || []);
            whiteIps = new Set(allowed.ips?.white || []);
            blackIps = new Set(allowed.ips?.black || []);
            allowedHeaders = new Map(Object.entries(allowed.headers || {}));
        }
        else if (route.allowed.merge) {
            const routeAllowed = route.allowed;
            allowedHosts = new Set([...(allowed.hosts || []), ...(routeAllowed.hosts || [])]);
            whiteIps = new Set([...(allowed.ips?.white || []), ...(routeAllowed.ips?.white || [])]);
            blackIps = new Set([...(allowed.ips?.black || []), ...(routeAllowed.ips?.black || [])]);
            allowedHeaders = new Map([...Object.entries(allowed.headers || {}), ...Object.entries(routeAllowed.headers || {})]);
        }
        else {
            const routeAllowed = route.allowed;
            allowedHosts = new Set(routeAllowed.hosts || []);
            whiteIps = new Set(routeAllowed.ips?.white || []);
            blackIps = new Set(routeAllowed.ips?.black || []);
            allowedHeaders = new Map(Object.entries(routeAllowed.headers || {}));
        }
    }
    if (allowedHeaders.size) {
        const headers = new Map();
        for (const entry of allowedHeaders)
            headers.set(entry[0].toLowerCase(), entry[1]);
        const old = handler;
        handler = (response, request) => {
            for (const entry of headers) {
                if (request.getHeader(entry[0]) !== entry[1]) {
                    response.end("Access denied");
                    return;
                }
            }
            old(response, request);
        };
    }
    if (allowedHosts.size) {
        const old = handler;
        handler = (response, request) => {
            if (!allowedHosts.has(request.getHeader("host"))) {
                response.end("Access denied");
                return;
            }
            old(response, request);
        };
    }
    if (whiteIps.size) {
        const old = handler;
        handler = (response, request) => {
            const ip = (0, convert_1.convertIP)(response.getRemoteAddress());
            if (!ip || !whiteIps.has(ip)) {
                response.end("Access denied");
                return;
            }
            old(response, request);
        };
    }
    if (blackIps.size) {
        const old = handler;
        handler = (response, request) => {
            const ip = (0, convert_1.convertIP)(response.getRemoteAddress());
            if (ip && blackIps.has(ip)) {
                response.end("Access denied");
                return;
            }
            old(response, request);
        };
    }
    if (throttle && route.throttle !== false) {
        const old = handler;
        handler = (response, request) => {
            const ip = (0, convert_1.convertIP)(response.getRemoteAddress());
            if ((0, throttle_1.checkThrottle)(ip)) {
                response.end("Access denied");
                return;
            }
            old(response, request);
        };
    }
    app.addRoute(route.method, url, handler);
}
function startServer() {
    if (!app)
        return;
    app.listen(port, (ok) => {
        if (!ok) {
            forgescript_1.Logger.error(`Failed to start server on port ${port}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=api.js.map