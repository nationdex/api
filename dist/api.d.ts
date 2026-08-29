import * as uWS from "uWebSockets.js";
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
export interface ApiOptions {
    path?: string;
    port?: number | string;
    throttle?: boolean | ThrottleOptions;
    cacheIP?: number | string;
    allowed?: AllowedOptions;
    ssl?: uWS.AppOptions;
}
export declare function initializer(options: ApiOptions | undefined, instance: ForgeClient): Promise<void>;
export declare function updateRoutes(): Promise<void>;
