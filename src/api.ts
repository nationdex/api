import * as uWS from "uWebSockets.js";
import { Interpreter, Compiler, Logger, ForgeClient } from "@tryforge/forgescript";
import { readdir, access } from "fs/promises";
import { join } from "path";
import { cacheIP, convertIP } from "./convert";
import { setupThrottle, checkThrottle, ThrottleOptions } from "./throttle";

export interface AllowedOptions {
    hosts?: string[];
    ips?: {
        white?: string[];
        black?: string[];
    };
    headers?: Record<string, string>;
}

export interface RouteAllowedOptions {
    merge?: boolean;
    hosts?: string[];
    ips?: {
        white?: string[];
        black?: string[];
    };
    headers?: Record<string, string>;
}

export interface RouteDefinition {
    url: string;
    method: string;
    code: string;
    allowed?: boolean | RouteAllowedOptions;
    throttle?: boolean;
}

export interface ApiOptions {
    path?: string;
    port?: number | string;
    throttle?: boolean | ThrottleOptions;
    cacheIP?: number | string;
    allowed?: AllowedOptions;
    ssl?: uWS.AppOptions;
}

let app: uWS.TemplatedApp | null = null;
let client: ForgeClient | null = null;
let port = 3000;
let path: string | null = null;
let socket: uWS.us_listen_socket | null = null;
let throttle = false;
let ssl: uWS.AppOptions = {};
let allowed: AllowedOptions = {};

const methods: Record<string, string> = {
    GET: "get",
    POST: "post",
    PUT: "put",
    DELETE: "del",
    PATCH: "patch",
    OPTIONS: "options",
    HEAD: "head",
    TRACE: "trace",
    CONNECT: "connect",
    ANY: "any"
};

export async function initializer(options: ApiOptions = {}, instance: ForgeClient): Promise<void> {
    if (options.path) path = join(process.cwd(), options.path);
    if (!path) return;
    if (options.throttle) {
        throttle = true;
        setupThrottle(options.throttle);
    }
    if (options.cacheIP) cacheIP(options.cacheIP);
    if (options.allowed) allowed = options.allowed;
    if (options.ssl) ssl = options.ssl;
    client = instance;
    port = +(options.port ?? 3000) || 3000;
    await updateRoutes();
}

export async function updateRoutes(): Promise<void> {
    if (!path) return;
    if (socket) {
        uWS.us_listen_socket_close(socket);
        socket = null;
    }
    app = Object.keys(ssl).length ? uWS.SSLApp(ssl) : uWS.App();
    await loadRoutes();
    startServer();
}

async function loadRoutes(): Promise<void> {
    if (!path) return;
    const files = await scanRoutes(path);
    for (const file of files) {
        try {
            const modules = require(file);
            delete require.cache[require.resolve(file)];
            const array = Array.isArray(modules) ? modules : [modules.default ?? modules];
            for (const module of array) {
                if (validateRoute(module)) registerRoute(module);
            }
        } catch (error) {
            Logger.error(`Error loading route from ${file}:`, error);
        }
    }
}

async function scanRoutes(poth: string): Promise<string[]> {
    try {
        await access(poth);
    } catch {
        return [];
    }
    const results: string[] = [];
    const files = await readdir(poth, { withFileTypes: true });
    for (const file of files) {
        const full = join(poth, file.name);
        if (file.isDirectory()) {
            const sub = await scanRoutes(full);
            results.push(...sub);
        } else if (file.name.endsWith(".js") || file.name.endsWith(".ts")) {
            results.push(full);
        }
    }
    return results;
}

function validateRoute(route: any): route is RouteDefinition {
    if (!route || typeof route !== "object") return false;
    if (typeof route.url !== "string" || typeof route.method !== "string" || typeof route.code !== "string") return false;
    if (!Object.hasOwn(methods, route.method)) return false;
    return true;
}

function registerRoute(route: RouteDefinition): void {
    if (!app) return;
    const url = route.url.startsWith("/") ? route.url : "/" + route.url;
    const code = Compiler.compile(route.code);
    let handler: (response: uWS.HttpResponse, request: uWS.HttpRequest) => void | Promise<void> = async (response, request) => {
        response.onAborted(() => { });
        try {
            await Interpreter.run({ obj: {}, command: null, client: client!, data: code, extras: { response, request } });
        } catch (error) {
            response.end("Internal Server Error");
            Logger.error(error);
        }
    };
    let allowedHosts = new Set<string>();
    let whiteIps = new Set<string>();
    let blackIps = new Set<string>();
    let allowedHeaders = new Map<string, string>();
    if (route.allowed !== false) {
        if (!route.allowed || route.allowed === true) {
            allowedHosts = new Set(allowed.hosts || []);
            whiteIps = new Set(allowed.ips?.white || []);
            blackIps = new Set(allowed.ips?.black || []);
            allowedHeaders = new Map(Object.entries(allowed.headers || {}));
        } else if ((route.allowed as RouteAllowedOptions).merge) {
            const routeAllowed = route.allowed as RouteAllowedOptions;
            allowedHosts = new Set([...(allowed.hosts || []), ...(routeAllowed.hosts || [])]);
            whiteIps = new Set([...(allowed.ips?.white || []), ...(routeAllowed.ips?.white || [])]);
            blackIps = new Set([...(allowed.ips?.black || []), ...(routeAllowed.ips?.black || [])]);
            allowedHeaders = new Map([...Object.entries(allowed.headers || {}), ...Object.entries(routeAllowed.headers || {})]);
        } else {
            const routeAllowed = route.allowed as RouteAllowedOptions;
            allowedHosts = new Set(routeAllowed.hosts || []);
            whiteIps = new Set(routeAllowed.ips?.white || []);
            blackIps = new Set(routeAllowed.ips?.black || []);
            allowedHeaders = new Map(Object.entries(routeAllowed.headers || {}));
        }
    }
    if (allowedHeaders.size) {
        const headers = new Map<string, string>();
        for (const entry of allowedHeaders) headers.set(entry[0].toLowerCase(), entry[1]);
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
            const ip = convertIP(response.getRemoteAddress());
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
            const ip = convertIP(response.getRemoteAddress());
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
            const ip = convertIP(response.getRemoteAddress());
            if (checkThrottle(ip)) {
                response.end("Access denied");
                return;
            }
            old(response, request);
        };
    }
    const methodName = methods[route.method] as keyof uWS.TemplatedApp;
    (app[methodName] as Function)(url, handler);
}

function startServer(): void {
    if (!app) return;
    app.listen(port, (listen: uWS.us_listen_socket | false) => {
        if (!listen) {
            Logger.error(`Failed to start server on port ${port}`);
            process.exit(1);
        }
        socket = listen;
    });
}
