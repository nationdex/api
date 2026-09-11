import * as uWS from "uWebSockets.js";
import { IAppBackend, RouteHandler } from "./types";

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

export class UwsApp implements IAppBackend {
    public raw: uWS.TemplatedApp;
    private socket: uWS.us_listen_socket | null = null;

    constructor(ssl: uWS.AppOptions) {
        this.raw = Object.keys(ssl).length ? uWS.SSLApp(ssl) : uWS.App();
    }

    addRoute(method: string, url: string, handler: RouteHandler): void {
        const methodName = methods[method] as keyof uWS.TemplatedApp;
        (this.raw[methodName] as Function)(url, handler);
    }

    listen(port: number, cb: (ok: boolean) => void): void {
        this.raw.listen(port, (listen: uWS.us_listen_socket | false) => {
            this.socket = listen || null;
            cb(!!listen);
        });
    }

    close(): void {
        if (this.socket) {
            uWS.us_listen_socket_close(this.socket);
            this.socket = null;
        }
    }
}
