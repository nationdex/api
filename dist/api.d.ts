import type { AppOptions } from "uWebSockets.js";
import { ForgeClient } from "@tryforge/forgescript";
import { ThrottleOptions } from "./throttle";
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
export interface APIOptions {
    path?: string;
    port?: number | string;
    throttle?: boolean | ThrottleOptions;
    cacheIP?: number | string;
    allowed?: AllowedOptions;
    ssl?: AppOptions;
}
export declare const isBun: boolean;
export declare function initializer(options: APIOptions | undefined, instance: ForgeClient): Promise<void>;
export declare function updateRoutes(): Promise<void>;
//# sourceMappingURL=api.d.ts.map