/// <reference types="bun-types" />
import { IAppBackend, RouteHandler } from "./types";
import { compileRoute, matchRoute, CompiledRoute } from "./router";

// Replicates the subset of uWS.HttpRequest used across src/functions/get/*.ts
export class BunHttpRequest {
    private url: URL;
    private params: string[];
    private paramNames: (string | null)[];
    public yielded = false;

    constructor(public raw: Request, params: string[], paramNames: (string | null)[]) {
        this.url = new URL(raw.url);
        this.params = params;
        this.paramNames = paramNames;
    }

    getHeader(key: string): string {
        return this.raw.headers.get(key) ?? "";
    }

    getQuery(key: string): string {
        return this.url.searchParams.get(key) ?? "";
    }

    getMethod(): string {
        return this.raw.method.toLowerCase();
    }

    getUrl(): string {
        return this.url.pathname;
    }

    getParameter(param: string | number): string {
        if (typeof param === "number") return this.params[param] ?? "";
        const namedIndex = this.paramNames.filter(n => n !== null).indexOf(param);
        return namedIndex === -1 ? "" : this.params[namedIndex] ?? "";
    }

    setYield(shouldYield: boolean): void {
        this.yielded = shouldYield;
    }
}

// Replicates the subset of uWS.HttpResponse used across src/functions/{send,other,get}/*.ts
export class BunHttpResponse {
    private statusLine = "200 OK";
    private headers = new Map<string, string>();
    private chunks: Uint8Array[] = [];
    private aborted = false;
    private abortCbs: Array<() => void> = [];
    private finished = false;
    private resolve!: (response: Response) => void;
    public donePromise: Promise<Response>;

    constructor(private request: Request, private server: { requestIP(req: Request): { address: string; family: string; port: number } | null }) {
        this.donePromise = new Promise(res => (this.resolve = res));
        request.signal.addEventListener("abort", () => {
            this.aborted = true;
            for (const cb of this.abortCbs) cb();
        });
    }

    writeStatus(status: string): this {
        this.statusLine = status;
        return this;
    }

    writeHeader(key: string, value: string): this {
        this.headers.set(key, value);
        return this;
    }

    end(body?: string | Uint8Array): this {
        if (this.finished) return this;
        this.finished = true;
        if (body !== undefined) this.chunks.push(typeof body === "string" ? new TextEncoder().encode(body) : body);
        this.flush();
        return this;
    }

    // Fast path used by file.ts for Bun: hand a BunFile/stream straight to Response,
    // skipping the manual backpressure loop uWS needs.
    endWithBody(body: BodyInit): void {
        if (this.finished) return;
        this.finished = true;
        const code = parseInt(this.statusLine, 10) || 200;
        const init: ResponseInit = { status: code, headers: Object.fromEntries(this.headers) };
        this.resolve(new Response(body, init));
    }

    private flush(): void {
        const code = parseInt(this.statusLine, 10) || 200;
        const body = this.chunks.length ? Buffer.concat(this.chunks.map(c => Buffer.from(c))) : undefined;
        const init: ResponseInit = { status: code, headers: Object.fromEntries(this.headers) };
        this.resolve(new Response(body, init));
    }

    onAborted(cb: () => void): void {
        this.abortCbs.push(cb);
    }

    async onData(cb: (chunk: ArrayBuffer, isLast: boolean) => void): Promise<void> {
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

    getRemoteAddress(): string {
        return this.server.requestIP(this.request)?.address ?? "";
    }

    getProxiedRemoteAddress(): string {
        const forwarded = this.request.headers.get("x-forwarded-for");
        if (forwarded) return forwarded.split(",")[0].trim();
        return this.getRemoteAddress();
    }

    isAborted(): boolean {
        return this.aborted;
    }
}

export class BunApp implements IAppBackend {
    private routes: CompiledRoute[] = [];
    private server: any = null;

    addRoute(method: string, url: string, handler: RouteHandler): void {
        this.routes.push(compileRoute(method, url, handler));
    }

    listen(port: number, cb: (ok: boolean) => void): void {
        try {
            this.server = Bun.serve({
                port,
                fetch: (request: Request, server: any) => this.handle(request, server)
            });
            cb(true);
        } catch {
            cb(false);
        }
    }

    close(): void {
        this.server?.stop(true);
        this.server = null;
    }

    private async handle(request: Request, server: any): Promise<Response> {
        const pathname = new URL(request.url).pathname;
        const match = matchRoute(this.routes, request.method.toUpperCase(), pathname);
        if (!match) return new Response("Not Found", { status: 404 });

        const req = new BunHttpRequest(request, match.params, match.route.paramNames);
        const res = new BunHttpResponse(request, server);

        try {
            await match.route.handler(res, req);
        } catch {
            if (!res.isAborted()) res.endWithBody("Internal Server Error");
        }

        return res.donePromise;
    }
}
