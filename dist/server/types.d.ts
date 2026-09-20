export interface IAppBackend {
    addRoute(method: string, url: string, handler: RouteHandler): void;
    listen(port: number, cb: (ok: boolean) => void): void;
    close(): void;
}
export type RouteHandler = (response: any, request: any) => void | Promise<void>;
//# sourceMappingURL=types.d.ts.map