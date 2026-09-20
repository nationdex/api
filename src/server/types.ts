// Minimal shape that both backends (uWebSockets.js and Bun.serve) must satisfy.
// Every file under src/functions/ is written against these exact method names,
// which is what lets the whole route/function layer stay backend-agnostic.

export interface IAppBackend {
    addRoute(method: string, url: string, handler: RouteHandler): void;
    listen(port: number, cb: (ok: boolean) => void): void;
    close(): void;
}

export type RouteHandler = (response: any, request: any) => void | Promise<void>;
