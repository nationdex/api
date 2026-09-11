import * as uWS from "uWebSockets.js";
import { IAppBackend, RouteHandler } from "./types";
export declare class UwsApp implements IAppBackend {
    raw: uWS.TemplatedApp;
    private socket;
    constructor(ssl: uWS.AppOptions);
    addRoute(method: string, url: string, handler: RouteHandler): void;
    listen(port: number, cb: (ok: boolean) => void): void;
    close(): void;
}
//# sourceMappingURL=uws.d.ts.map