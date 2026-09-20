"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BunApp = exports.BunHttpResponse = exports.BunHttpRequest = void 0;
const router_1 = require("./router");
// Replicates the subset of uWS.HttpRequest used across src/functions/get/*.ts
class BunHttpRequest {
    raw;
    url;
    params;
    paramNames;
    yielded = false;
    constructor(raw, params, paramNames) {
        this.raw = raw;
        this.url = new URL(raw.url);
        this.params = params;
        this.paramNames = paramNames;
    }
    getHeader(key) {
        return this.raw.headers.get(key) ?? "";
    }
    getQuery(key) {
        return this.url.searchParams.get(key) ?? "";
    }
    getMethod() {
        return this.raw.method.toLowerCase();
    }
    getUrl() {
        return this.url.pathname;
    }
    getParameter(param) {
        if (typeof param === "number")
            return this.params[param] ?? "";
        const namedIndex = this.paramNames.filter(n => n !== null).indexOf(param);
        return namedIndex === -1 ? "" : this.params[namedIndex] ?? "";
    }
    setYield(shouldYield) {
        this.yielded = shouldYield;
    }
}
exports.BunHttpRequest = BunHttpRequest;
// Replicates the subset of uWS.HttpResponse used across src/functions/{send,other,get}/*.ts
class BunHttpResponse {
    request;
    server;
    statusLine = "200 OK";
    headers = new Map();
    chunks = [];
    aborted = false;
    abortCbs = [];
    finished = false;
    resolve;
    donePromise;
    constructor(request, server) {
        this.request = request;
        this.server = server;
        this.donePromise = new Promise(res => (this.resolve = res));
        request.signal.addEventListener("abort", () => {
            this.aborted = true;
            for (const cb of this.abortCbs)
                cb();
        });
    }
    writeStatus(status) {
        this.statusLine = status;
        return this;
    }
    writeHeader(key, value) {
        this.headers.set(key, value);
        return this;
    }
    end(body) {
        if (this.finished)
            return this;
        this.finished = true;
        if (body !== undefined)
            this.chunks.push(typeof body === "string" ? new TextEncoder().encode(body) : body);
        this.flush();
        return this;
    }
    // Fast path used by file.ts for Bun: hand a BunFile/stream straight to Response,
    // skipping the manual backpressure loop uWS needs.
    endWithBody(body) {
        if (this.finished)
            return;
        this.finished = true;
        const code = parseInt(this.statusLine, 10) || 200;
        const init = { status: code, headers: Object.fromEntries(this.headers) };
        this.resolve(new Response(body, init));
    }
    flush() {
        const code = parseInt(this.statusLine, 10) || 200;
        const body = this.chunks.length ? Buffer.concat(this.chunks.map(c => Buffer.from(c))) : undefined;
        const init = { status: code, headers: Object.fromEntries(this.headers) };
        this.resolve(new Response(body, init));
    }
    onAborted(cb) {
        this.abortCbs.push(cb);
    }
    async onData(cb) {
        if (!this.request.body) {
            cb(new ArrayBuffer(0), true);
            return;
        }
        const reader = this.request.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                cb(new ArrayBuffer(0), true);
                return;
            }
            const isLast = false;
            cb(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength), isLast);
        }
    }
    getRemoteAddress() {
        return this.server.requestIP(this.request)?.address ?? "";
    }
    getProxiedRemoteAddress() {
        const forwarded = this.request.headers.get("x-forwarded-for");
        if (forwarded)
            return forwarded.split(",")[0].trim();
        return this.getRemoteAddress();
    }
    isAborted() {
        return this.aborted;
    }
}
exports.BunHttpResponse = BunHttpResponse;
class BunApp {
    routes = [];
    server = null;
    addRoute(method, url, handler) {
        this.routes.push((0, router_1.compileRoute)(method, url, handler));
    }
    listen(port, cb) {
        try {
            this.server = Bun.serve({
                port,
                fetch: (request, server) => this.handle(request, server)
            });
            cb(true);
        }
        catch {
            cb(false);
        }
    }
    close() {
        this.server?.stop(true);
        this.server = null;
    }
    async handle(request, server) {
        const pathname = new URL(request.url).pathname;
        const match = (0, router_1.matchRoute)(this.routes, request.method.toUpperCase(), pathname);
        if (!match)
            return new Response("Not Found", { status: 404 });
        const req = new BunHttpRequest(request, match.params, match.route.paramNames);
        const res = new BunHttpResponse(request, server);
        try {
            await match.route.handler(res, req);
        }
        catch {
            if (!res.isAborted())
                res.endWithBody("Internal Server Error");
        }
        return res.donePromise;
    }
}
exports.BunApp = BunApp;
//# sourceMappingURL=bun.js.map