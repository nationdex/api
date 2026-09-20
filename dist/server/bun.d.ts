import { IAppBackend, RouteHandler } from "./types";
export declare class BunHttpRequest {
    raw: Request;
    private url;
    private params;
    private paramNames;
    yielded: boolean;
    constructor(raw: Request, params: string[], paramNames: (string | null)[]);
    getHeader(key: string): string;
    getQuery(key: string): string;
    getMethod(): string;
    getUrl(): string;
    getParameter(param: string | number): string;
    setYield(shouldYield: boolean): void;
}
export declare class BunHttpResponse {
    private request;
    private server;
    private statusLine;
    private headers;
    private chunks;
    private aborted;
    private abortCbs;
    private finished;
    private resolve;
    donePromise: Promise<Response>;
    constructor(request: Request, server: {
        requestIP(req: Request): {
            address: string;
            family: string;
            port: number;
        } | null;
    });
    writeStatus(status: string): this;
    writeHeader(key: string, value: string): this;
    end(body?: string | Uint8Array): this;
    endWithBody(body: BodyInit): void;
    private flush;
    onAborted(cb: () => void): void;
    onData(cb: (chunk: ArrayBuffer, isLast: boolean) => void): Promise<void>;
    getRemoteAddress(): string;
    getProxiedRemoteAddress(): string;
    isAborted(): boolean;
}
export declare class BunApp implements IAppBackend {
    private routes;
    private server;
    addRoute(method: string, url: string, handler: RouteHandler): void;
    listen(port: number, cb: (ok: boolean) => void): void;
    close(): void;
    private handle;
}
//# sourceMappingURL=bun.d.ts.map